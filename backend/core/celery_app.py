from celery import Celery
from celery.schedules import crontab
from backend.core.config import settings

celery_app = Celery(
    "scoutsphere_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

# Optional: configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    include=["backend.tasks.scout_tasks"]
)

# Schedule for Celery Beat
celery_app.conf.beat_schedule = {
    "run-scout-pipeline-every-hour": {
        "task": "backend.tasks.scout_tasks.run_scout_pipeline",
        "schedule": crontab(minute="0", hour="*"), # Runs every hour on the dot
    },
}
