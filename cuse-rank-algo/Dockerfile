# Use Python 3.9 slim version for a smaller image size
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy and install only required dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
