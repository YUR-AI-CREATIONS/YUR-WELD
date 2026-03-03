import asyncio
import datetime
import os
import subprocess
from typing import Optional

from trinity_intelligence_cloud.autoscaler.strategies import (
    scale_by_queue_length,
    scale_by_wait_time,
)
from trinity_intelligence_cloud.queue.redis_queue import RedisQueue


class LocalAutoscaler:
    """Autoscaler used for local or docker-compose deployments."""

    MIN_WORKERS = int(os.getenv("TIC_MIN_WORKERS", 1))
    MAX_WORKERS = int(os.getenv("TIC_MAX_WORKERS", 10))
    SCALE_INTERVAL = int(os.getenv("TIC_SCALE_INTERVAL", 10))

    def __init__(self) -> None:
        self.queue = RedisQueue()
        self.current_workers = self.MIN_WORKERS

    async def _get_queue_length(self) -> int:
        return await self.queue.redis.xlen(self.queue.stream)

    async def _get_average_wait(self) -> Optional[float]:
        # placeholder: integrate once job latency metrics are persisted
        return None

    async def run(self) -> None:
        print("🚀 TIC Local Autoscaler started.")
        await self.queue.initialize()

        while True:
            queue_length = await self._get_queue_length()
            avg_wait = await self._get_average_wait()
            print(
                f"[{datetime.datetime.utcnow().isoformat()}] Queue length={queue_length} "
                f"workers={self.current_workers} wait={avg_wait}"
            )

            desired = scale_by_queue_length(queue_length, self.current_workers)
            if avg_wait is not None:
                desired = scale_by_wait_time(avg_wait, desired)

            desired = max(self.MIN_WORKERS, min(desired, self.MAX_WORKERS))

            if desired > self.current_workers:
                self._scale_up(desired)
            elif desired < self.current_workers:
                self._scale_down(desired)

            self.current_workers = desired
            await asyncio.sleep(self.SCALE_INTERVAL)

    def _scale_up(self, target: int) -> None:
        diff = target - self.current_workers
        for _ in range(diff):
            print(f"⬆️ Scaling up worker (target={target})")
            subprocess.Popen(["python", "-m", "trinity_intelligence_cloud.queue.worker"])

    def _scale_down(self, target: int) -> None:
        diff = self.current_workers - target
        print(f"⬇️ Scaling down by {diff} workers (target={target}).")
        print("Local workers must be stopped manually or via dev_clean script.")


def run_autoscaler() -> None:
    autoscaler = LocalAutoscaler()
    asyncio.run(autoscaler.run())
