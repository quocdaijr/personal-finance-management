# Use an official Python image as base
FROM python:3.13-slim

WORKDIR /app

# Install development dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install development packages
RUN pip install --no-cache-dir \
    black \
    flake8 \
    pytest \
    pytest-cov \
    debugpy

# No need to COPY . . as we'll use volume mounting
EXPOSE 8000
# Expose debugpy port
EXPOSE 5678

# Run the FastAPI application using Uvicorn in development mode with hot reload
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]