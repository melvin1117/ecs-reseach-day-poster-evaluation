import requests
from celery.result import AsyncResult
from celery_worker import celery_app
from auth_service import AuthService

class TaskService:
    BASE_URL = "http://localhost:5000"  

    @staticmethod
    def start_task(event_id: str, username: str, password: str):
        """Start a background Celery task with authentication."""
        headers = AuthService.get_headers(username, password)
        response = requests.post(f"{TaskService.BASE_URL}/start-task/", json={"event_id": event_id}, headers=headers)
        return response.json()

    @staticmethod
    def get_task_status(task_id: str, username: str, password: str):
        """Check the status of a background Celery task with authentication."""
        headers = AuthService.get_headers(username, password)
        response = requests.get(f"{TaskService.BASE_URL}/task-status/{task_id}", headers=headers)
        return response.json()
