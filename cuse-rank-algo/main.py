from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from celery.result import AsyncResult
from celery_worker import celery_app
from task_service import TaskService

app = FastAPI()

class TaskRequest(BaseModel):
    event_id: str
    username: str
    password: str

@app.post("/start-task/")
def start_task(request: TaskRequest):
    """Trigger a Celery background task with authentication."""
    try:
        response = TaskService.start_task(request.event_id, request.username, request.password)
        return response
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/task-status/{task_id}")
def get_task_status(task_id: str, username: str, password: str):
    """Check the status of a task with authentication."""
    try:
        response = TaskService.get_task_status(task_id, username, password)
        return response
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
