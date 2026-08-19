"""
Remaining Useful Life (RUL) Regression Model for Machinery Degradation Forecasting.
"""

import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List
try:
    from xgboost import XGBRegressor
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score


class RULRegressor:
    """Predicts Remaining Useful Life (RUL) in operational hours or cycles."""

    def __init__(self, n_estimators: int = 150, random_state: int = 42):
        self.n_estimators = n_estimators
        self.random_state = random_state
        if HAS_XGBOOST:
            self.model = XGBRegressor(
                n_estimators=self.n_estimators,
                learning_rate=0.05,
                max_depth=6,
                random_state=self.random_state
            )
        else:
            self.model = RandomForestRegressor(
                n_estimators=self.n_estimators,
                max_depth=10,
                random_state=self.random_state
            )
        self.is_fitted = False
        self.feature_names: List[str] = []

    def fit(self, X: pd.DataFrame, y_rul: pd.Series) -> Dict[str, float]:
        """Trains the RUL regression model on historical run-to-failure telemetry."""
        self.feature_names = list(X.columns)
        self.model.fit(X, y_rul)
        self.is_fitted = True

        y_pred = self.model.predict(X)
        mae = float(mean_absolute_error(y_rul, y_pred))
        r2 = float(r2_score(y_rul, y_pred))

        return {"mae": round(mae, 2), "r2": round(r2, 4)}

    def predict_rul(self, X_input: pd.DataFrame) -> np.ndarray:
        """Predicts RUL for given feature matrix."""
        if not self.is_fitted:
            # Fallback heuristic if unfitted
            return np.full(len(X_input), 150.0)

        # Align columns
        missing_cols = [c for c in self.feature_names if c not in X_input.columns]
        X_aligned = X_input.copy()
        for c in missing_cols:
            X_aligned[c] = 0.0
        X_aligned = X_aligned[self.feature_names]

        predictions = self.model.predict(X_aligned)
        return np.maximum(0.0, predictions)

    def predict_single_reading(self, reading_features: pd.DataFrame) -> Tuple[float, float]:
        """
        Predicts RUL and computes a dynamic Machine Health Index (0% - 100%).
        """
        rul_pred = float(self.predict_rul(reading_features)[0])
        
        # Max operational lifespan benchmark ~ 250 hours
        max_benchmark = 250.0
        health_index = max(0.0, min(100.0, (rul_pred / max_benchmark) * 100.0))

        return round(rul_pred, 1), round(health_index, 1)
