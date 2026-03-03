#!/bin/bash
set -e

MODE=${TIC_AUTOSCALER_MODE:-local}

echo "[TIC AUTOSCALER] Starting..."
printenv TIC_SCALE_INTERVAL TIC_MIN_WORKERS TIC_MAX_WORKERS >/dev/null 2>&1 || true
echo "[TIC AUTOSCALER] Mode: ${MODE}"

declare -A CMD_MAP
CMD_MAP[local]="trinity_intelligence_cloud/autoscaler/local_scaler.py"
CMD_MAP[k8s]="trinity_intelligence_cloud/autoscaler/k8s_scaler.py"

if [ -z "${CMD_MAP[$MODE]}" ]; then
    echo "[TIC AUTOSCALER] Unknown mode '${MODE}'. Falling back to local mode."
    MODE="local"
fi

if [ "$MODE" = "k8s" ]; then
    echo "[TIC AUTOSCALER] Running Kubernetes autoscaler loop..."
else
    echo "[TIC AUTOSCALER] Running Local autoscaler loop..."
fi

exec python -u "${CMD_MAP[$MODE]}"
