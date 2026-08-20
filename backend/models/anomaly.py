"""
Anomaly Detector combining Isolation Forest machine learning with physics threshold rules.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, Tuple
from config import MACHINE_PROFILES


class AnomalyDetector:
    """Detects telemetry anomalies using Isolation Forest and domain boundary rules."""

    def __init__(self, contamination: float = 0.05, random_state: int = 42):
        self.contamination = contamination
        self.model = IsolationForest(
            contamination=self.contamination,
            random_state=random_state,
            n_estimators=100
        )
        self.is_fitted = False
        self.feature_cols = [
            "vibration_rms", "vibration_kurtosis", "temperature",
            "pressure", "acoustic_emission", "power_draw", "rpm"
        ]

    def fit(self, df_normal: pd.DataFrame) -> "AnomalyDetector":
        """Fits the Isolation Forest on healthy / normal baseline operational data."""
        valid_cols = [c for c in self.feature_cols if c in df_normal.columns]
        if not valid_cols:
            raise ValueError("Dataframe must contain valid sensor columns.")

        X = df_normal[valid_cols].fillna(0)
        self.model.fit(X)
        self.is_fitted = True
        return self

    def predict_single(self, reading: Dict[str, Any]) -> Tuple[bool, float, Dict[str, Any]]:
        """
        Evaluates a single sensor frame.
        Returns:
            is_anomaly (bool): True if flagged as anomalous
            anomaly_score (float): Score between 0.0 (normal) and 1.0 (highly anomalous)
            details (dict): Rule breaches and metric anomalies
        """
        machine_id = reading.get("machine_id", "CNC-MILL-01")
        profile = MACHINE_PROFILES.get(machine_id, MACHINE_PROFILES["CNC-MILL-01"])
        limits = profile["critical_limits"]

        rule_breaches = []
        
        # Check rule-based physics limits
        if reading.get("vibration_rms", 0) > limits.get("vibration_rms_max", 999):
            rule_breaches.append(f"Vibration RMS high ({reading['vibration_rms']} mm/s > {limits['vibration_rms_max']})")
        
        if reading.get("vibration_kurtosis", 0) > limits.get("vibration_kurtosis_max", 999):
            rule_breaches.append(f"Vibration Kurtosis elevated ({reading['vibration_kurtosis']})")

        if reading.get("temperature", 0) > limits.get("temperature_max", 999):
            rule_breaches.append(f"Temperature threshold exceeded ({reading['temperature']} °C > {limits['temperature_max']} °C)")

        if reading.get("pressure", 999) < limits.get("pressure_min", 0):
            rule_breaches.append(f"Pressure drop below minimum ({reading['pressure']} bar < {limits['pressure_min']} bar)")

        if reading.get("acoustic_emission", 0) > limits.get("acoustic_emission_max", 999):
            rule_breaches.append(f"Acoustic noise elevated ({reading['acoustic_emission']} dB)")

        if reading.get("power_draw", 0) > limits.get("power_draw_max", 999):
            rule_breaches.append(f"Power draw surge ({reading['power_draw']} kW)")

        # Evaluate Isolation Forest decision_function (>0 for normal inliers, <0 for outliers)
        if self.is_fitted:
            df_feat = pd.DataFrame([[reading.get(col, 0.0) for col in self.feature_cols]], columns=self.feature_cols)
            dec_score = float(self.model.decision_function(df_feat)[0])
            ml_anomaly_score = max(0.0, min(1.0, 0.5 - (dec_score * 2.0)))
        else:
            ml_anomaly_score = 0.5 if len(rule_breaches) > 0 else 0.0

        # Combine ML score and rule violations
        has_rule_breach = len(rule_breaches) > 0
        is_anomaly = has_rule_breach or (ml_anomaly_score > 0.55)
        
        composite_score = max(ml_anomaly_score, 0.85 if has_rule_breach else 0.1)

        details = {
            "rule_breaches": rule_breaches,
            "ml_anomaly_score": round(ml_anomaly_score, 4),
            "composite_score": round(composite_score, 4)
        }

        return is_anomaly, composite_score, details
