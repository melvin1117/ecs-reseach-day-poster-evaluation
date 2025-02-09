# Use Python 3.9 slim version for a smaller image size
FROM python:3.11.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy and install dependencies
COPY requirements.txt . 
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI and Celery worker inside the container
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port 8000 & celery -A celery_worker.celery_app worker --loglevel=info"]
