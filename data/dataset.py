"""
Dataset loader, feature engineering, and window transformation pipeline.
"""

import pandas as pd
import numpy as np
from typing import List, Tuple, Dict, Any

SENSOR_COLS = [
    "vibration_rms",
    "vibration_kurtosis",
    "temperature",
    "pressure",
    "acoustic_emission",
    "power_draw",
    "rpm"
]


class FeatureEngineer:
    """Computes time-domain, frequency-like, and rolling window features for ML models."""

    def __init__(self, window_size: int = 5):
        self.window_size = window_size

    def extract_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculates windowed statistical features for telemetry data.
        """
        df_feats = df.copy()
        
        # Sort by run_id (if present) and timestamp_idx
        if "run_id" in df_feats.columns:
            df_feats = df_feats.sort_values(by=["run_id", "timestamp_idx"])
            group_col = "run_id"
        else:
            df_feats = df_feats.sort_values(by=["machine_id", "timestamp_idx"])
            group_col = "machine_id"

        for col in SENSOR_COLS:
            if col in df_feats.columns:
                # Rolling Mean
                df_feats[f"{col}_roll_mean"] = (
                    df_feats.groupby(group_col)[col]
                    .transform(lambda x: x.rolling(window=self.window_size, min_periods=1).mean())
                )
                # Rolling Std
                df_feats[f"{col}_roll_std"] = (
                    df_feats.groupby(group_col)[col]
                    .transform(lambda x: x.rolling(window=self.window_size, min_periods=1).std())
                    .fillna(0.0)
                )
                # Rate of change / Difference from prior reading
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
        """
        Prepares X (features), y_rul (Remaining Useful Life), and y_fault (Fault Classification Label).
        """
        df_processed = self.extract_features(df)

        feature_cols = [c for c in df_processed.columns if any(s in c for s in SENSOR_COLS)]
        X = df_processed[feature_cols]
        y_rul = df_processed["RUL"] if "RUL" in df_processed.columns else pd.Series()
        y_fault = df_processed["fault_mode"] if "fault_mode" in df_processed.columns else pd.Series()

        return X, y_rul, y_fault
