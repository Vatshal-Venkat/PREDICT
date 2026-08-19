"""
Unit tests for data generation and telemetry simulation using unittest.
"""

import unittest
from data.generator import IndustrialDataGenerator


class TestIndustrialDataGenerator(unittest.TestCase):

    def setUp(self):
        self.generator = IndustrialDataGenerator(seed=42)

    def test_single_reading_generation(self):
        reading = self.generator.generate_single_reading(
            machine_id="CNC-MILL-01",
            timestamp_idx=1,
            fault_mode="NORMAL",
            degradation_severity=0.0
        )
        self.assertEqual(reading["machine_id"], "CNC-MILL-01")
        self.assertIn("vibration_rms", reading)
        self.assertIn("temperature", reading)
        self.assertIn("pressure", reading)
        self.assertEqual(reading["fault_mode"], "NORMAL")

    def test_fault_injection_effects(self):
        normal_reading = self.generator.generate_single_reading("CNC-MILL-01", 1, "NORMAL", 0.0)
        faulty_reading = self.generator.generate_single_reading("CNC-MILL-01", 100, "BEARING_FATIGUE", 0.9)

        self.assertGreater(faulty_reading["vibration_rms"], normal_reading["vibration_rms"])
        self.assertGreater(faulty_reading["vibration_kurtosis"], normal_reading["vibration_kurtosis"])

    def test_fleet_dataset_generation(self):
        df_fleet = self.generator.generate_fleet_training_dataset(samples_per_fault=1)

        self.assertFalse(df_fleet.empty)
        self.assertIn("RUL", df_fleet.columns)
        self.assertIn("fault_mode", df_fleet.columns)
        self.assertGreater(len(df_fleet["machine_id"].unique()), 1)


if __name__ == "__main__":
    unittest.main()
