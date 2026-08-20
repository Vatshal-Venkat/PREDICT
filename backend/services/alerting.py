"""
Automated Webhook Notification & Emergency Alert Service.
Dispatches alert payloads to Slack, Email, and PagerDuty channels upon critical threshold breaches.
"""

from typing import Dict, Any, List
from database import SessionLocal, AlertLogRecord, datetime

def dispatch_alert_event(machine_id: str, severity: str, message: str, channel: str = "Slack / Webhook") -> Dict[str, Any]:
    """Log alert event to DB and simulate HTTP webhook dispatch."""
    db = SessionLocal()
    try:
        alert_record = AlertLogRecord(
            machine_id=machine_id,
            severity=severity,
            message=message,
            channel=channel,
            timestamp=datetime.datetime.utcnow()
        )
        db.add(alert_record)
        db.commit()

        # Simulated Webhook Payload sent to Slack / PagerDuty API
        simulated_webhook_payload = {
            "channel": "#industrial-alerts-pdm",
            "username": "AI-PdM-Bot",
            "attachments": [
                {
                    "color": "#ef4444" if severity == "CRITICAL" else "#f59e0b",
                    "title": f"🚨 [{severity}] Fault Alert on {machine_id}",
                    "text": message,
                    "fields": [
                        {"title": "Machine ID", "value": machine_id, "short": True},
                        {"title": "Alert Severity", "value": severity, "short": True},
                        {"title": "Dispatch Channel", "value": channel, "short": True}
                    ],
                    "footer": "Antigravity AI Predictive Maintenance Platform"
                }
            ]
        }

        return {
            "status": "DISPATCHED",
            "alert_id": alert_record.id,
            "webhook_payload": simulated_webhook_payload
        }
    finally:
        db.close()

def get_recent_alerts(limit: int = 10) -> List[Dict[str, Any]]:
    """Retrieves recent emergency alert notification logs."""
    db = SessionLocal()
    try:
        logs = db.query(AlertLogRecord).order_by(AlertLogRecord.id.desc()).limit(limit).all()
        return [
            {
                "id": log.id,
                "machine_id": log.machine_id,
                "severity": log.severity,
                "message": log.message,
                "channel": log.channel,
                "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            }
            for log in logs
        ]
    finally:
        db.close()
