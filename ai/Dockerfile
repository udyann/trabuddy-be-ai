# Use lightweight Python image
FROM python:3.11-slim

# Set working dir
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose FastAPI port
EXPOSE 8001

# Run app with uvicorn
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8001"]
