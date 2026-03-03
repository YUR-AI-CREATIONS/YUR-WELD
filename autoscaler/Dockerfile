# -----------------------------------------------------------
# TRINITY INTELLIGENCE CLOUD AUTOSCALER
# -----------------------------------------------------------

FROM python:3.11-slim AS base

# Install system dependencies required for Python packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        libffi-dev \
        curl \
        && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy repository contents
COPY . .

# Install shared Python requirements
RUN pip install --no-cache-dir -r /app/requirements.txt

# Install autoscaler-specific dependencies
RUN pip install --no-cache-dir kubernetes redis

# Copy and configure entrypoint
COPY trinity_intelligence_cloud/autoscaler/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Default configuration for autoscaler behavior
ENV TIC_AUTOSCALER_MODE=k8s \
    TIC_SCALE_INTERVAL=10 \
    TIC_MIN_WORKERS=4 \
    TIC_MAX_WORKERS=32 \
    TIC_SCALE_UP_THRESHOLD=5 \
    TIC_SCALE_DOWN_THRESHOLD=1 \
    TIC_SCALE_STEP=4

ENTRYPOINT ["/entrypoint.sh"]
