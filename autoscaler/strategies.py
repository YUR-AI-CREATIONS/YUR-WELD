"""Scaling strategy helpers for Trinity Intelligence Cloud autoscalers."""

from __future__ import annotations

import os


MIN_WORKERS = int(os.getenv("TIC_MIN_WORKERS", 1))
MAX_WORKERS = int(os.getenv("TIC_MAX_WORKERS", 10))
SCALE_UP_THRESHOLD = int(os.getenv("TIC_SCALE_UP_THRESHOLD", 5))
SCALE_DOWN_THRESHOLD = float(os.getenv("TIC_SCALE_DOWN_THRESHOLD", 1))
SCALE_STEP = max(1, int(os.getenv("TIC_SCALE_STEP", 4)))


def scale_by_queue_length(queue_length: int, current_workers: int) -> int:
    """Aggressively push workers up/down based on queue backlog."""

    desired = current_workers
    if queue_length >= SCALE_UP_THRESHOLD:
        desired = min(MAX_WORKERS, current_workers + SCALE_STEP)
    else:
        jobs_per_worker = queue_length / max(1, current_workers)
        if jobs_per_worker <= SCALE_DOWN_THRESHOLD and current_workers > MIN_WORKERS:
            desired = max(MIN_WORKERS, current_workers - SCALE_STEP)

    return max(MIN_WORKERS, min(desired, MAX_WORKERS))


def scale_by_wait_time(avg_wait_seconds: float, current_workers: int) -> int:
    """Increase workers when waits stay high; shrink when consistently low."""
    if avg_wait_seconds > 20:
        return current_workers + 1
    if avg_wait_seconds < 5 and current_workers > 1:
        return current_workers - 1
    return current_workers
