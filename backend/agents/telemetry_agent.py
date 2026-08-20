"""
Telemetry Ingestion & Real-Time Monitoring Agent.
Processes continuous multi-sensor streams and flags operational anomalies.
"""

from typing import Dict, Any, List
from agents.base import BaseAgent
from models.trainer import PredictiveModelBundle


class TelemetryAgent(BaseAgent):
    """Monitors live sensor streams, calculates rolling metrics, and triggers anomaly alerts."""

    def __init__(self, model_bundle: PredictiveModelBundle):
        super().__init__(
            agent_id="telemetry_agent",
            name="Telemetry Stream Monitor Agent",
            role="Real-time multi-sensor telemetry ingestion, statistical windowing, and threshold anomaly detection."
        )
        self.bundle = model_bundle
        self.history: List[Dict[str, Any]] = []

    def process(self, telemetry_frame: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes incoming sensor reading frame.
        """
        self.history.append(telemetry_frame)
        if len(self.history) > 100:
            self.history.pop(0)

        # Run Anomaly Detector
        is_anomaly, composite_score, details = self.bundle.anomaly_detector.predict_single(telemetry_frame)

        result = {
            "machine_id": telemetry_frame.get("machine_id"),
            "timestamp_idx": telemetry_frame.get("timestamp_idx"),
            "telemetry": telemetry_frame,
            "is_anomaly": is_anomaly,
            "anomaly_score": composite_score,
            "anomaly_details": details
        }

        if is_anomaly:
            self.send_message(
                recipient="diagnostic_agent",
                topic="ANOMALY_DETECTED",
                payload=result
            )

        return result
