FROM python:3.10-slim

WORKDIR /app

# Install system dependencies if any are needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy the rest of the backend files
COPY backend ./backend

# Expose port (default 5000)
EXPOSE 5000

# Set environment variables
ENV PORT=5000
ENV FLASK_DEBUG=false
ENV SQLITE_DB_PATH=/app/data/users.db

# Command to run Gunicorn
CMD ["gunicorn", "--chdir", "backend", "--bind", "0.0.0.0:5000", "app:app"]
