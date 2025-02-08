from fastapi import FastAPI
from celery_worker import compute_scores

app = FastAPI()

@app.post("/compute-scores/")
async def start_score_computation():
    task = compute_scores.delay()
    return {"task_id": task.id, "status": "Processing"}

@app.get("/task-status/{task_id}")
async def task_status(task_id: str):
    task = compute_scores.AsyncResult(task_id)
    return {"task_id": task.id, "status": task.state, "result": task.result}
