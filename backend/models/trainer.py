"""
Model Trainer Pipeline. Trains and persists predictive maintenance ML models.
"""

import os
import pickle
import pandas as pd
from typing import Dict, Any, Tuple
from data.generator import IndustrialDataGenerator
from data.dataset import FeatureEngineer
from models.anomaly import AnomalyDetector
from models.rul import RULRegressor
from models.classifier import FaultClassifier

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
BUNDLE_PATH = os.path.join(MODEL_DIR, "trained_bundle.pkl")


class PredictiveModelBundle:
    """Encapsulates all trained predictive models for easy inference across agents."""

    def __init__(
        self,
        anomaly_detector: AnomalyDetector,
        rul_regressor: RULRegressor,
        fault_classifier: FaultClassifier,
        feature_engineer: FeatureEngineer
    ):
        self.anomaly_detector = anomaly_detector
        self.rul_regressor = rul_regressor
        self.fault_classifier = fault_classifier
        self.feature_engineer = feature_engineer

    def save(self, filepath: str = BUNDLE_PATH):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "wb") as f:
            pickle.dump(self, f)

    @classmethod
    def load(cls, filepath: str = BUNDLE_PATH) -> "PredictiveModelBundle":
        with open(filepath, "rb") as f:
            return pickle.load(f)


def train_all_models(samples_per_fault: int = 5, save_bundle: bool = True) -> PredictiveModelBundle:
    """Runs data generation, feature engineering, and model training pipeline."""
    print("[INFO] Generating Synthetic Historical Fleet Dataset...")
    generator = IndustrialDataGenerator(seed=42)
    fleet_df = generator.generate_fleet_training_dataset(samples_per_fault=samples_per_fault)
    
    print(f"[DATA] Fleet dataset generated: {len(fleet_df)} telemetry samples across machines & faults.")

    engineer = FeatureEngineer(window_size=5)
    X, y_rul, y_fault = engineer.prepare_model_matrices(fleet_df)

    # 1. Train Anomaly Detector on Healthy Subset
    print("[TRAIN] Training Isolation Forest Anomaly Detector...")
    normal_df = fleet_df[fleet_df["fault_mode"] == "NORMAL"]
    anomaly_detector = AnomalyDetector(contamination=0.08)
    anomaly_detector.fit(normal_df)

    # 2. Train RUL Regressor
    print("[TRAIN] Training RUL Regressor...")
    rul_regressor = RULRegressor(n_estimators=100)
    rul_metrics = rul_regressor.fit(X, y_rul)
    print(f"       RUL Model Trained -> MAE: {rul_metrics['mae']} hours, R2: {rul_metrics['r2']}")

    # 3. Train Fault Classifier
    print("[TRAIN] Training Fault Mode Classifier...")
    fault_classifier = FaultClassifier()
    clf_metrics = fault_classifier.fit(X, y_fault)
    print(f"       Fault Classifier Trained -> Accuracy: {clf_metrics['accuracy'] * 100:.2f}%")

    bundle = PredictiveModelBundle(
        anomaly_detector=anomaly_detector,
        rul_regressor=rul_regressor,
        fault_classifier=fault_classifier,
        feature_engineer=engineer
    )

    if save_bundle:
        bundle.save(BUNDLE_PATH)
        print(f"[SAVE] Model Bundle saved to {BUNDLE_PATH}")

    return bundle


def get_or_train_bundle() -> PredictiveModelBundle:
    """Loads pre-trained model bundle or trains a new one if missing."""
    if os.path.exists(BUNDLE_PATH):
        try:
            return PredictiveModelBundle.load(BUNDLE_PATH)
        except Exception:
            pass
    return train_all_models(samples_per_fault=4, save_bundle=True)
