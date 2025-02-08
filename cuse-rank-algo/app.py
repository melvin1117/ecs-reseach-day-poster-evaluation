from fastapi import FastAPI
from celery_worker import run_ml_task

app = FastAPI()

@app.post("/generate-mapping")
async def generate_mapping():
    """Trigger ML processing asynchronously."""
    task = run_ml_task.delay()
    return {"task_id": task.id, "status": "Processing"}

@app.get("/task-status/{task_id}")
async def task_status(task_id: str):
    """Check ML task status."""
    task = run_ml_task.AsyncResult(task_id)
    return {"task_id": task.id, "status": task.state, "result": task.result}
