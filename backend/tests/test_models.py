"""
Unit tests for Machine Learning models (anomaly, RUL, classifier) using unittest.
"""

import unittest
from data.generator import IndustrialDataGenerator
from data.dataset import FeatureEngineer
from models.anomaly import AnomalyDetector
from models.rul import RULRegressor
from models.classifier import FaultClassifier


class TestPredictiveModels(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        generator = IndustrialDataGenerator(seed=42)
        cls.sample_dataset = generator.generate_fleet_training_dataset(samples_per_fault=1)

    def test_anomaly_detector(self):
        normal_df = self.sample_dataset[self.sample_dataset["fault_mode"] == "NORMAL"]
        detector = AnomalyDetector()
        detector.fit(normal_df)

        healthy_sample = normal_df.iloc[0].to_dict()
        is_anom, score, details = detector.predict_single(healthy_sample)

        self.assertIsInstance(is_anom, bool)
        self.assertTrue(0.0 <= score <= 1.0)

    def test_rul_regressor(self):
        engineer = FeatureEngineer(window_size=3)
        X, y_rul, _ = engineer.prepare_model_matrices(self.sample_dataset)

        regressor = RULRegressor(n_estimators=20)
        metrics = regressor.fit(X, y_rul)

        self.assertIn("mae", metrics)
        self.assertGreaterEqual(metrics["mae"], 0.0)

        rul_pred, health_idx = regressor.predict_single_reading(X.iloc[:1])
        self.assertGreaterEqual(rul_pred, 0.0)
        self.assertTrue(0.0 <= health_idx <= 100.0)

    def test_fault_classifier(self):
        engineer = FeatureEngineer(window_size=3)
        X, _, y_fault = engineer.prepare_model_matrices(self.sample_dataset)

        clf = FaultClassifier()
        metrics = clf.fit(X, y_fault)

        self.assertGreater(metrics["accuracy"], 0.0)
        top_fault, conf, prob_dist = clf.predict_fault(X.iloc[:1])
        self.assertIn(top_fault, prob_dist)
        self.assertTrue(0.0 <= conf <= 1.0)


if __name__ == "__main__":
    unittest.main()
