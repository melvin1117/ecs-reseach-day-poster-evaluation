from celery import Celery

# Use Redis inside Docker network
celery_app = Celery(
    "celery_worker",
    broker="redis://redis:6379/0",  # Change localhost to redis (Docker container name)
    backend="redis://redis:6379/0"
)

import process_task

if __name__ == "__main__":
    celery_app.start()
