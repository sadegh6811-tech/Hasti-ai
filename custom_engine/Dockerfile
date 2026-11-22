# syntax=docker/dockerfile:1
# =============================================================================
# Custom Engine — python:3.10-slim
# =============================================================================
FROM python:3.10-slim

# Install system deps needed by common scientific Python packages
# (keep minimal — this image is for an internal engine, not a web server)
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

EXPOSE 8001

# Run as a non-root user
RUN useradd --create-home app && chown -R app:app /app
USER app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
