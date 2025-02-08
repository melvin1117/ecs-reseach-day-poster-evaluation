from celery import Celery
import time
import random
import json
import pandas as pd
import logging
from sqlalchemy.orm import Session
from db_config import SessionLocal
from datetime import datetime

celery_app = Celery(
    "celery_worker",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0"
)

logging.basicConfig(
    filename="celery_tasks.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

def fetch_data(db: Session):
    try:
        logging.info("Fetching data from the database.")
        query = """
            SELECT e.poster_id, e.judge_id, e.scores, j.relevance_score, ev.criteria, p.event_id
            FROM evaluations e
            JOIN judge_assignments j ON e.judge_id = j.judge_id AND e.poster_id = j.poster_id
            JOIN posters p ON e.poster_id = p.id
            JOIN events ev ON p.event_id = ev.id
        """
        result = db.execute(query).fetchall()
        logging.info(f"Fetched {len(result)} records successfully.")
        return pd.DataFrame(result, columns=['poster_id', 'judge_id', 'scores', 'relevance_score', 'criteria', 'event_id'])
    except Exception as e:
        logging.error(f"Error while fetching data: {e}")
        raise

def normalize_criteria(criteria_json):
    try:
        criteria = json.loads(criteria_json)
        total_weight = sum(criteria.values())
        return {k: v / total_weight for k, v in criteria.items()} if total_weight else criteria
    except Exception as e:
        logging.error(f"Error normalizing criteria weightage: {e}")
        raise

@celery_app.task(bind=True)
def compute_scores(self):
    logging.info("Starting score computation task.")
    db = SessionLocal()
    
    try:
        df = fetch_data(db)
        if df.empty:
            logging.warning("No data found for processing.")
            return {"message": "No data available for computation"}

        df['criteria'] = df['criteria'].apply(normalize_criteria)
        df['scores'] = df['scores'].apply(json.loads)

        df['weighted_score'] = df.apply(lambda row: sum(
            row['scores'][k] * row['criteria'][k] for k in row['scores']), axis=1)

        df['final_score'] = df['weighted_score'] * df['relevance_score']

        final_scores = df.groupby(['poster_id', 'event_id']).agg(
            weighted_score=('weighted_score', 'mean'),
            final_score=('final_score', 'mean')
        ).reset_index()

        final_scores = final_scores.round(2)
        logging.info("Score computation completed successfully.")

        filename = f"poster_scores_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        final_scores.to_excel(filename, index=False)
        logging.info(f"Scores saved to Excel: {filename}")

        insert_query = """
            INSERT INTO rankings (event_id, poster_id, final_score, created_at)
            VALUES (:event_id, :poster_id, :final_score, NOW())
            ON CONFLICT (poster_id) DO UPDATE SET final_score = EXCLUDED.final_score
        """
        for _, row in final_scores.iterrows():
            db.execute(insert_query, {"event_id": row['event_id'], "poster_id": row['poster_id'], "final_score": row['final_score']})

        db.commit()
        db.close()
        logging.info("Final scores successfully added to the database.")

        return {"message": "Scores computed and stored successfully", "filename": filename}

    except Exception as e:
        logging.error(f"Error during score computation: {e}")
        self.retry(exc=e, countdown=10, max_retries=3)  
        raise
