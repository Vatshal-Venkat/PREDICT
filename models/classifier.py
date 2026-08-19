"""
Multi-Class Fault Mode Classification Model.
Identifies mechanical and electrical failure modes from telemetry features.
"""

import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report

try:
    from xgboost import XGBClassifier
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

from sklearn.ensemble import RandomForestClassifier
from config import FAULT_MODES


class FaultClassifier:
    """Multi-class fault classifier for root cause identification."""

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.label_encoder = LabelEncoder()
        
        if HAS_XGBOOST:
            self.model = XGBClassifier(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.08,
                random_state=self.random_state,
                eval_metric="mlogloss"
            )
        else:
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=8,
                random_state=self.random_state
            )
            
        self.is_fitted = False
        self.feature_names: List[str] = []

    def fit(self, X: pd.DataFrame, y_fault: pd.Series) -> Dict[str, Any]:
        """Trains the fault classification model."""
        self.feature_names = list(X.columns)
        y_encoded = self.label_encoder.fit_transform(y_fault)

        self.model.fit(X, y_encoded)
        self.is_fitted = True

        y_pred = self.model.predict(X)
        acc = float(accuracy_score(y_encoded, y_pred))

        return {
            "accuracy": round(acc, 4),
            "classes": list(self.label_encoder.classes_)
        }

    def predict_fault(self, X_input: pd.DataFrame) -> Tuple[str, float, Dict[str, float]]:
        """
        Predicts fault category, top fault confidence score, and probability distribution across all failure modes.
        """
        if not self.is_fitted:
            return "NORMAL", 1.0, {"NORMAL": 1.0}

        # Align columns
        missing_cols = [c for c in self.feature_names if c not in X_input.columns]
        X_aligned = X_input.copy()
        for c in missing_cols:
            X_aligned[c] = 0.0
        X_aligned = X_aligned[self.feature_names]

        probs = self.model.predict_proba(X_aligned)[0]
        top_idx = int(np.argmax(probs))
        top_class = str(self.label_encoder.classes_[top_idx])
        top_prob = float(probs[top_idx])

        prob_dict = {
            str(cls): round(float(p), 4)
            for cls, p in zip(self.label_encoder.classes_, probs)
        }

        return top_class, round(top_prob, 4), prob_dict
