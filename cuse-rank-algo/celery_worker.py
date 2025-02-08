from celery import Celery
import time
import random

celery_app = Celery(
    "celery_worker",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0"
)

@celery_app.task
def run_ml_task():
    """Simulate an ML-based mapping task."""
    time.sleep(10)
    return {"mapping": random.sample(range(1, 101), 10)}