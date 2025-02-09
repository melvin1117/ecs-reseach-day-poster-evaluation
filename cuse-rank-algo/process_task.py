import pandas as pd
import numpy as np
import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from ortools.sat.python import cp_model
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from celery import Celery
import time
from sqlalchemy.sql import text  # Import text for safe queries
from os import getenv

# Import Celery instance
from celery_worker import celery_app

# ---------------- Database Configuration ---------------- #
DB_NAME = getenv('DB_NAME')
DB_USER = getenv('DB_USER')
DB_PASSWORD = getenv('DB_PASSWORD')
DB_HOST = getenv('DB_HOST')
DB_PORT = getenv('DB_PORT')

# ---------------- Celery Task ---------------- #
@celery_app.task(name="process_event") 
def process_event(event_id: str):
    """Background Task to Process Judge Assignments"""

    engine = create_engine(f'postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}')

    # Fetch judges data
    faculty_df = pd.read_sql_query("SELECT * FROM judges_master;", engine)

    # Fetch posters with advisor name
    abstracts_df = pd.read_sql_query("""
        SELECT p.id, p.title, p.abstract, j.name AS advisor_name
        FROM posters p
        LEFT JOIN judges_master j ON p.advisor_id = j.id
    """, engine)

    # Step 1: Load `event_judges` from the database (fetching all columns)
    event_judges_df = pd.read_sql_query("""
        SELECT id AS event_judge_id, judge_id, event_id, availability, unique_code 
        FROM event_judges;
    """, engine)

    # Step 2: Load `judges_master`
    faculty_df = pd.read_sql_query("SELECT id, name, department, details FROM judges_master;", engine)

    # Step 3: Merge `event_judges` with `judges_master` using `judge_id`
    merged_judges = event_judges_df.merge(
        faculty_df[["id", "name", "department", "details"]], 
        left_on="judge_id", right_on="id", how="left"
    )

    # Rename columns for clarity
    merged_judges.rename(columns={
        "name": "Full Name",
        "details": "Expertise",
        "availability": "Hour available"
    }, inplace=True)

    # Select only relevant columns
    merged_judges = merged_judges[["event_judge_id", "judge_id", "event_id", "Full Name", "department", "Expertise", "Hour available", "unique_code"]]

    # Ensure Expertise column is cleaned
    merged_judges["Expertise"] = merged_judges["Expertise"].fillna("").astype(str)  # Prevent NaN issues


    # Clean expertise function
    def clean_expertise(text):
        if pd.isna(text) or text.strip() == "":
            return "N/A"
        text = re.sub(r'\S+@\S+', '', text)  # Remove emails
        text = re.sub(r'\d{1,}-\d{1,}', '', text)  # Remove numerical ranges
        return text.strip()

    merged_judges["Cleaned Expertise"] = merged_judges["Expertise"].apply(clean_expertise)

    # Extract projects
    projects = abstracts_df[["id", "title", "abstract", "advisor_name"]]
    projects["abstract"] = projects["abstract"].fillna("N/A").astype(str)

    # Step 2: Compute Similarity Scores
    model = SentenceTransformer('all-MiniLM-L6-v2')

    judge_embeddings = {row["Full Name"]: model.encode(row["Cleaned Expertise"]) for _, row in merged_judges.iterrows()}
    project_embeddings = {row["id"]: model.encode(row["abstract"]) for _, row in projects.iterrows()}

    similarity_matrix = pd.DataFrame(index=merged_judges["Full Name"], columns=projects["id"])

    for j_id in merged_judges["Full Name"]:
        for p_id in projects["id"]:
            sim_score = cosine_similarity([judge_embeddings[j_id]], [project_embeddings[p_id]])[0][0]
            similarity_matrix.loc[j_id, p_id] = sim_score

    similarity_matrix = similarity_matrix.astype(float)
    similarity_matrix = (similarity_matrix - similarity_matrix.min().min()) / (similarity_matrix.max().max() - similarity_matrix.min().min())

    # Step 3: Solve Assignment Problem
    solver_model = cp_model.CpModel()
    assignments = {}

    for j in merged_judges["Full Name"]:
        for p in projects["id"]:
            assignments[(j, p)] = solver_model.NewBoolVar(f'judge{j}_poster{p}')

    # Assign exactly 2 judges per poster
    for p in projects["id"]:
        solver_model.Add(sum(assignments[(j, p)] for j in merged_judges["Full Name"]) == 2)

    # Assign each judge to at most 6 posters
    for j in merged_judges["Full Name"]:
        solver_model.Add(sum(assignments[(j, p)] for p in projects["id"]) <= 6)

    # Ensure judges are available during poster time slots
    for _, judge in merged_judges.iterrows():
        for _, poster in projects.iterrows():
            poster_time_slot = 1 if int(poster["id"]) % 2 == 1 else 2
            judge_time_slots = str(judge["Hour available"]).strip().lower() if pd.notna(judge["Hour available"]) else "both"

            if judge_time_slots != "both" and str(poster_time_slot) not in judge_time_slots:
                solver_model.Add(assignments[(judge["Full Name"], poster["id"])] == 0)

    # Maximize similarity scores
    objective = sum(assignments[(j, p)] * int(similarity_matrix.loc[j, p] * 100) for j in merged_judges["Full Name"] for p in projects["id"])
    solver_model.Maximize(objective)

    solver = cp_model.CpSolver()
    status = solver.Solve(solver_model)

    # Step 4: Insert Results into judge_assignments Table
    if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:

        with engine.begin() as conn:  # Ensures transactions are managed properly
            for _, judge in merged_judges.iterrows():
                for _, poster in projects.iterrows():
                    if solver.Value(assignments[(judge["Full Name"], poster["id"])]) == 1:
                        
                        # Step 1: Fetch judge's `id` from `judges_master`
                        master_judge_id_result = conn.execute(
                            text("SELECT id FROM judges_master WHERE name = :name"),
                            {"name": judge["Full Name"]}
                        ).fetchone()

                        if not master_judge_id_result:
                            continue  # Skip if judge is not found in judges_master

                        master_judge_id = master_judge_id_result[0]  # Extract UUID

                        # Step 2: Fetch corresponding `id` from `event_judges` using master judge's `id`
                        event_judge_id_result = conn.execute(
                            text("SELECT id FROM event_judges WHERE judge_id = :master_judge_id"),
                            {"master_judge_id": master_judge_id}
                        ).fetchone()

                        if not event_judge_id_result:
                            continue  # Skip if judge is not found in event_judges

                        event_judge_id = event_judge_id_result[0]  # Extract UUID

                        # Step 3: Insert into `judge_assignments`
                        conn.execute(
                            text("""
                                INSERT INTO judge_assignments (id, relevance_score, assigned_at, event_id, judge_id, poster_id)
                                VALUES (uuid_generate_v4(), :relevance_score, NOW(), :event_id, :judge_id, :poster_id)
                                ON CONFLICT (judge_id, poster_id) DO NOTHING;
                            """),
                            {
                                "relevance_score": round(similarity_matrix.loc[judge["Full Name"], poster["id"]], 2),
                                "event_id": event_id,
                                "judge_id": event_judge_id,  # Use `id` from event_judges
                                "poster_id": poster["id"],
                            }
                        )



        return {"status": "Task Completed", "message": "Judge assignment stored in DB"}

    return {"status": "Failed", "message": "No feasible solution found!"}
