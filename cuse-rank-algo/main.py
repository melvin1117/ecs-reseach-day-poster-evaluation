from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from celery.result import AsyncResult
from celery_worker import celery_app

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins. Change this to restrict allowed origins.
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

@app.post("/start-task/")
def start_task(event_id: str):
    """Trigger a Celery background task"""
    task = celery_app.send_task("process_event", args=[event_id])
    return {"task_id": task.id, "status": "Task Started"}

@app.get("/task-status/{task_id}")
def get_task_status(task_id: str):
    """Check the status of a task"""
    task_result = AsyncResult(task_id, app=celery_app)
    return {
        "task_id": task_id,
        "status": task_result.status,
        "result": task_result.result if task_result.ready() else "Task is still running",
    }
