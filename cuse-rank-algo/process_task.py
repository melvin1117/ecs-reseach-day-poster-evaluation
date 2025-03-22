import pandas as pd
import numpy as np
import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from ortools.sat.python import cp_model
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from celery import Celery
from sqlalchemy.sql import text  # Safe SQL queries
from os import getenv

# Import Celery instance
from celery_worker import celery_app

# ---------------- Database Configuration ---------------- #
DB_NAME = "cuse_rank"
DB_USER = "user"
DB_PASSWORD = "password"
DB_HOST = "db"
DB_PORT = 5432

# ---------------- Celery Task ---------------- #
@celery_app.task(name="process_event") 
def process_event(event_id: str):
    """Background Task to Process Judge Assignments"""
    
    print(f"Starting processing for event: {event_id}")

    engine = create_engine(f'postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}')

    # ---------------- Load Data ---------------- #
    try:
        faculty_df = pd.read_sql_query("SELECT id, name, department, details FROM judges_master;", engine)
        print("Loaded faculty data")

        abstracts_df = pd.read_sql_query("""
            SELECT p.id, p.title, p.abstract, p.slots, j.name AS advisor_name
            FROM posters p
            LEFT JOIN judges_master j ON p.advisor_id = j.id
        """, engine)
        print("Loaded posters data")

        event_judges_df = pd.read_sql_query("""
            SELECT id AS event_judge_id, judge_id, event_id, availability, unique_code 
            FROM event_judges;
        """, engine)
        print("Loaded event judges data")

    except SQLAlchemyError as e:
        print(f"Database query failed: {str(e)}")
        return {"status": "Error", "message": f"Database query failed: {str(e)}"}

    # Merge event judges with faculty data
    merged_judges = event_judges_df.merge(
        faculty_df, left_on="judge_id", right_on="id", how="left"
    ).rename(columns={"name": "Full Name", "details": "Expertise", "availability": "Hour available"})
    print("Merged judges data")

    # Remove duplicate judge IDs (prevents indexing issues)
    merged_judges = merged_judges.drop_duplicates(subset=["judge_id"], keep="first")
    print("Removed duplicate judges")

    # Clean expertise text
    def clean_expertise(text):
        if not text or pd.isna(text) or text.strip() == "":
            return "N/A"
        text = re.sub(r'\S+@\S+', '', text)  # Remove emails
        text = re.sub(r'\d{1,}-\d{1,}', '', text)  # Remove numerical ranges
        return text.strip()

    merged_judges["Cleaned Expertise"] = merged_judges["Expertise"].apply(clean_expertise)
    print("Cleaned expertise text")

    # Ensure abstracts are filled
    projects = abstracts_df[["id", "title", "abstract", "advisor_name", "slots"]].fillna("N/A")
    print("Filled missing abstract data")

    # Create a mapping of poster id to advisor name for advisor conflict checks
    poster_advisor = dict(zip(projects["id"], projects["advisor_name"]))
    print("Created poster to advisor mapping")

    # ---------------- Compute Similarity Scores ---------------- #
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("Loaded sentence transformer model")

    judge_embeddings = {
        row["judge_id"]: model.encode(row["Cleaned Expertise"]) 
        for _, row in merged_judges.iterrows()
    }
    print("Generated embeddings for judges")

    project_embeddings = {
        row["id"]: model.encode(row["abstract"]) 
        for _, row in projects.iterrows()
    }
    print("Generated embeddings for projects")

    # Initialize similarity matrix with zeros
    similarity_matrix = pd.DataFrame(
        0.0, index=merged_judges["judge_id"].unique(), columns=projects["id"].unique()
    )
    print("Initialized similarity matrix")

    # Populate similarity matrix
    for j_id in merged_judges["judge_id"]:
        for p_id in projects["id"]:
            if j_id in judge_embeddings and p_id in project_embeddings:
                similarity_matrix.loc[j_id, p_id] = cosine_similarity(
                    [judge_embeddings[j_id]], [project_embeddings[p_id]]
                )[0][0]
    print("Computed similarity matrix")

    # Save a copy of the original normalized similarity scores
    similarity_matrix_orig = similarity_matrix.copy()
    print("Saved original similarity matrix")

    # Normalize similarity scores
    if similarity_matrix.max().max() - similarity_matrix.min().min() != 0:
        similarity_matrix = (similarity_matrix - similarity_matrix.min().min()) / (
            similarity_matrix.max().max() - similarity_matrix.min().min()
        )
    print("Normalized similarity scores")

    # ---------------- Solve Assignment Problem ---------------- #
    solver_model = cp_model.CpModel()
    assignments = {
        (j, p): solver_model.NewBoolVar(f'judge{j}_poster{p}')
        for j in merged_judges["judge_id"] for p in projects["id"]
    }
    print("Created optimization model variables")

    # Each poster is assigned exactly 2 judges
    for p in projects["id"]:
        solver_model.Add(sum(assignments[(j, p)] for j in merged_judges["judge_id"]) == 2)
    print("Added constraint: each poster gets 2 judges")

    # Each judge is assigned to at most 6 posters
    for j in merged_judges["judge_id"]:
        solver_model.Add(sum(assignments[(j, p)] for p in projects["id"]) >= 1)  # Minimum 1 poster per judge
        solver_model.Add(sum(assignments[(j, p)] for p in projects["id"]) <= 6)
    print("Added constraint: each judge can evaluate up to 6 posters")

    # Fairness Constraint: Prevent strong bias by limiting high-similarity assignments
    for j in merged_judges["judge_id"]:
        max_similarity = similarity_matrix.loc[j].max()
        min_similarity = similarity_matrix.loc[j].min()
        
        # Only apply fairness constraint if there's a significant range in similarity
        if max_similarity - min_similarity > 0.3:
            solver_model.Add(sum(assignments[(j, p)] 
                             for p in projects["id"] if similarity_matrix.loc[j, p] > 0.7) <= 3)
    print("Added fairness constraints to prevent judge bias")

    # Ensure availability constraints and advisor conflicts
    for _, judge in merged_judges.iterrows():
        for _, poster in projects.iterrows():
            # Time slot availability check
            poster_time_slot = int(poster["slots"])
            judge_time_slots = str(judge["Hour available"]).strip().lower() if pd.notna(judge["Hour available"]) else "both"

            if judge_time_slots != "both" and str(poster_time_slot) not in judge_time_slots:
                solver_model.Add(assignments[(judge["judge_id"], poster["id"])] == 0)
            
            # Advisor conflict check - judges can't evaluate posters where they're the advisor
            if judge["Full Name"] == poster_advisor.get(poster["id"], ""):
                solver_model.Add(assignments[(judge["judge_id"], poster["id"])] == 0)
    
    print("Added availability and advisor conflict constraints")

    # Maximize similarity scores
    solver_model.Maximize(
        sum(assignments[(j, p)] * int(float(similarity_matrix.loc[j, p])) * 100
            for j in merged_judges["judge_id"] for p in projects["id"])
    )
    print("Added objective function to maximize similarity scores")

    solver = cp_model.CpSolver()
    status = solver.Solve(solver_model)
    print(f"Optimization solver status: {status}")

    # ---------------- Insert Results into Database ---------------- #
    if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
        with engine.begin() as conn:
            for _, judge in merged_judges.iterrows():
                for _, poster in projects.iterrows():
                    if solver.Value(assignments[(judge["judge_id"], poster["id"])]) == 1:
                        event_judge_id_result = conn.execute(
                            text("SELECT id FROM event_judges WHERE judge_id = :judge_id"),
                            {"judge_id": judge["judge_id"]}
                        ).fetchone()

                        if not event_judge_id_result:
                            print(f"Warning: Event judge ID not found for judge_id {judge['judge_id']}. Skipping...")
                            continue

                        event_judge_id = event_judge_id_result[0]

                        conn.execute(
                            text("""
                                INSERT INTO judge_assignments (id, relevance_score, assigned_at, event_id, judge_id, poster_id)
                                VALUES (uuid_generate_v4(), :relevance_score, NOW(), :event_id, :judge_id, :poster_id)
                                ON CONFLICT (judge_id, poster_id) DO NOTHING;
                            """),
                            {
                                "relevance_score": round(similarity_matrix.loc[judge["judge_id"], poster["id"]], 2),
                                "event_id": event_id,
                                "judge_id": event_judge_id,
                                "poster_id": poster["id"],
                            }
                        )
        print("Judge assignments successfully stored in database")
        return {"status": "Task Completed", "message": "Judge assignment stored in DB"}

    print("No feasible solution found")
    return {"status": "Failed", "message": "No feasible solution found!"}