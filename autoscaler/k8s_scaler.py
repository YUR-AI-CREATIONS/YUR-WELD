import asyncio
import os

from kubernetes import client, config

from trinity_intelligence_cloud.autoscaler.strategies import scale_by_queue_length
from trinity_intelligence_cloud.queue.redis_queue import RedisQueue


class KubernetesAutoscaler:
    """Adjusts worker Deployment replicas inside a Kubernetes cluster."""

    def __init__(
        self,
        namespace: str | None = None,
        deployment: str | None = None,
        *,
        stream_name: str | None = None,
    ) -> None:
        if os.getenv("KUBERNETES_SERVICE_HOST"):
            config.load_incluster_config()
        else:
            config.load_kube_config()

        self.apps_api = client.AppsV1Api()
        self.namespace = namespace or "tic"
        self.deployment = deployment or "tic-worker"
        self.stream_name = stream_name or "tic_jobs"
        self.queue = RedisQueue()
        self.min_workers = int(os.getenv("TIC_MIN_WORKERS", 1))
        self.max_workers = int(os.getenv("TIC_MAX_WORKERS", 50))
        self.scale_interval = int(os.getenv("TIC_SCALE_INTERVAL", 15))

    async def run(self) -> None:
        await self.queue.initialize()
        while True:
            queue_length = await self.queue.redis.xlen(self.stream_name)
            current = self._get_current_replicas()
            desired = scale_by_queue_length(queue_length, current)
            desired = max(self.min_workers, min(desired, self.max_workers))

            if desired != current:
                self._scale(desired)

            await asyncio.sleep(self.scale_interval)

    def _get_current_replicas(self) -> int:
        deploy = self.apps_api.read_namespaced_deployment(self.deployment, self.namespace)
        return deploy.spec.replicas or 1

    def _scale(self, replicas: int) -> None:
        print(f"🔧 Scaling deployment {self.deployment} to {replicas} replicas")
        body = {"spec": {"replicas": replicas}}
        self.apps_api.patch_namespaced_deployment(
            name=self.deployment,
            namespace=self.namespace,
            body=body,
        )
