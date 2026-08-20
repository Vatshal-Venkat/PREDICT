"""
Dataset loader, feature engineering, and window transformation pipeline.
Includes native support for AI4I 2020 Predictive Maintenance Dataset.
"""

import os
import pandas as pd
import numpy as np
from typing import List, Tuple, Dict, Any, Optional

SENSOR_COLS = [
    "vibration_rms",
    "vibration_kurtosis",
    "temperature",
    "pressure",
    "acoustic_emission",
    "power_draw",
    "rpm"
]

AI4I_CSV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ai4i2020.csv")


def load_ai4i_dataset(filepath: str = AI4I_CSV_PATH) -> Optional[pd.DataFrame]:
    """
    Loads and normalizes the AI4I 2020 Predictive Maintenance CSV dataset into the system schema.
    """
    if not os.path.exists(filepath):
        return None

    df = pd.read_csv(filepath)

    # Column mapping to system telemetry schema
    df_mapped = pd.DataFrame()
    df_mapped["machine_id"] = df["Product ID"].apply(lambda x: f"AI4I-{x}")
    df_mapped["timestamp_idx"] = df["UDI"]
    
    # Map sensor columns
    # Air & Process temp averaged to C
    df_mapped["temperature"] = (df["Process temperature [K]"] - 273.15).round(2)
    df_mapped["rpm"] = df["Rotational speed [rpm]"]
    df_mapped["pressure"] = (df["Torque [Nm]"] * 1.5).round(2)
    df_mapped["power_draw"] = (df["Torque [Nm]"] * df["Rotational speed [rpm]"] / 9550 * 10).round(2)
    
    # Synthesize vibration metrics correlated with tool wear & failure
    tool_wear = df["Tool wear [min]"]
    is_failure = df["Machine failure"]
    
    df_mapped["vibration_rms"] = (1.5 + (tool_wear / 200.0) * 2.0 + is_failure * 3.5 + np.random.normal(0, 0.2, len(df))).clip(0.5, 12.0).round(2)
    df_mapped["vibration_kurtosis"] = (3.0 + (tool_wear / 200.0) * 1.5 + is_failure * 4.0 + np.random.normal(0, 0.3, len(df))).clip(2.0, 15.0).round(2)
    df_mapped["acoustic_emission"] = (45.0 + (tool_wear / 200.0) * 35.0 + is_failure * 40.0 + np.random.normal(0, 2.0, len(df))).clip(30.0, 140.0).round(2)

    # Calculate RUL: MAX tool wear capacity (250 mins) minus current wear
    df_mapped["RUL"] = (250.0 - tool_wear).clip(0, 250)

    # Map Fault Modes
    def map_fault(row):
        if row.get("TWF") == 1:
            return "TOOL_WEAR"
        if row.get("HDF") == 1:
            return "MOTOR_OVERHEAT"
        if row.get("PWF") == 1:
            return "HYDRAULIC_LEAK"
        if row.get("OSF") == 1:
            return "BEARING_FATIGUE"
        if row.get("RNF") == 1:
            return "SPINDLE_MISALIGNMENT"
        if row.get("Machine failure") == 1:
            return "TOOL_WEAR"
        return "NORMAL"

    df_mapped["fault_mode"] = df.apply(map_fault, axis=1)

    return df_mapped


class FeatureEngineer:
    """Computes time-domain, frequency-like, and rolling window features for ML models."""

    def __init__(self, window_size: int = 5):
        self.window_size = window_size

    def extract_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculates windowed statistical features for telemetry data."""
        df_feats = df.copy()
        
        if "run_id" in df_feats.columns:
            df_feats = df_feats.sort_values(by=["run_id", "timestamp_idx"])
            group_col = "run_id"
        else:
            df_feats = df_feats.sort_values(by=["machine_id", "timestamp_idx"])
            group_col = "machine_id"

        for col in SENSOR_COLS:
            if col in df_feats.columns:
                df_feats[f"{col}_roll_mean"] = (
                    df_feats.groupby(group_col)[col]
                    .transform(lambda x: x.rolling(window=self.window_size, min_periods=1).mean())
                )
                df_feats[f"{col}_roll_std"] = (
                    df_feats.groupby(group_col)[col]
                    .transform(lambda x: x.rolling(window=self.window_size, min_periods=1).std())
                    .fillna(0.0)
                )
                df_feats[f"{col}_diff"] = (
                    df_feats.groupby(group_col)[col]
                    .transform(lambda x: x.diff())
                    .fillna(0.0)
                )

        return df_feats

    def prepare_model_matrices(
        self,
        df: pd.DataFrame
    ) -> Tuple[pd.DataFrame, pd.Series, pd.Series]:
        """Prepares X (features), y_rul (Remaining Useful Life), and y_fault (Fault Classification Label)."""
        df_processed = self.extract_features(df)

        feature_cols = [c for c in df_processed.columns if any(s in c for s in SENSOR_COLS)]
        X = df_processed[feature_cols]
        y_rul = df_processed["RUL"] if "RUL" in df_processed.columns else pd.Series()
        y_fault = df_processed["fault_mode"] if "fault_mode" in df_processed.columns else pd.Series()

        return X, y_rul, y_fault
