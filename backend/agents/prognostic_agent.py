"""
Prognostic & Remaining Useful Life (RUL) Agent.
Forecasts equipment time-to-failure (TTF) and evaluates Machine Health Index.
"""

import pandas as pd
from typing import Dict, Any
from agents.base import BaseAgent
from models.trainer import PredictiveModelBundle
from config import HEALTH_LEVELS


class PrognosticAgent(BaseAgent):
    """Forecasts remaining operational lifespan and updates overall equipment health state."""

    def __init__(self, model_bundle: PredictiveModelBundle):
        super().__init__(
            agent_id="prognostic_agent",
            name="Prognostic & RUL Agent",
            role="Remaining Useful Life (RUL) regression, health index scoring, and degradation trajectory tracking."
        )
        self.bundle = model_bundle

    def process(self, diagnosis_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates RUL forecast and overall health index for a given machine telemetry snapshot.
        """
        telemetry = diagnosis_payload.get("telemetry_snapshot", {})
        machine_id = diagnosis_payload.get("machine_id", "CNC-MILL-01")

        df_single = pd.DataFrame([telemetry])
        X_feat, _, _ = self.bundle.feature_engineer.prepare_model_matrices(df_single)

        # Predict RUL & Health Index
        rul_hours, health_index = self.bundle.rul_regressor.predict_single_reading(X_feat)

        # Adjust RUL downwards if severe fault is active
        fault_code = diagnosis_payload.get("fault_code", "NORMAL")
        confidence = diagnosis_payload.get("confidence", 50.0) / 100.0

        if fault_code != "NORMAL":
            severity_factor = (1.0 - (0.5 * confidence))
            rul_hours = round(max(2.0, rul_hours * severity_factor), 1)
            health_index = round(max(5.0, health_index * severity_factor), 1)

        # Determine Health Category
        health_category = "EXCELLENT"
        for cat, (min_val, max_val) in HEALTH_LEVELS.items():
            if min_val <= health_index <= max_val:
                health_category = cat
                break

        prognosis = {
            "machine_id": machine_id,
            "machine_name": diagnosis_payload.get("machine_name", machine_id),
            "estimated_rul_hours": rul_hours,
            "health_index": health_index,
            "health_category": health_category,
            "fault_code": fault_code,
            "diagnosis_summary": diagnosis_payload,
            "telemetry_snapshot": telemetry
        }

        self.send_message(
            recipient="prescriptive_agent",
            topic="PROGNOSIS_COMPLETE",
            payload=prognosis
        )

        return prognosis
