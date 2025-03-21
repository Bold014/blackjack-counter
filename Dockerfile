FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy model and app files
COPY model.py server.py ./
COPY card_classifier_model.pth ./

# Expose port
EXPOSE 5000

# Run server
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "server:app"] 