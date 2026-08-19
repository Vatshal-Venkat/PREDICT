"""
Unit tests for multi-agent workflows and fleet orchestrator using unittest.
"""

import unittest
from data.generator import IndustrialDataGenerator
from models.trainer import train_all_models
from agents.orchestrator import FleetOrchestrator


class TestMultiAgentOrchestrator(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        bundle = train_all_models(samples_per_fault=1, save_bundle=False)
        cls.orchestrator = FleetOrchestrator(model_bundle=bundle)
        cls.generator = IndustrialDataGenerator(seed=42)

    def test_normal_telemetry_flow(self):
        normal_frame = self.generator.generate_single_reading("CNC-MILL-01", 1, "NORMAL", 0.0)
        res = self.orchestrator.process_telemetry_frame(normal_frame)
        self.assertEqual(res["status"], "NORMAL")

    def test_anomalous_telemetry_flow(self):
        anom_frame = self.generator.generate_single_reading("CNC-MILL-01", 100, "BEARING_FATIGUE", 0.9)
        res = self.orchestrator.process_telemetry_frame(anom_frame)

        self.assertEqual(res["status"], "ANOMALY_PROCESSED")
        self.assertIn("diagnosis", res)
        self.assertIn("prognosis", res)
        self.assertIn("work_order", res)

        wo = res["work_order"]
        self.assertIn(wo["priority"], ["CRITICAL", "HIGH", "MEDIUM"])
        self.assertGreater(len(wo["step_by_step_instructions"]), 0)
        self.assertGreaterEqual(wo["financial_impact"]["net_financial_savings"], 0.0)

    def test_assistant_query_handling(self):
        reply = self.orchestrator.query_assistant("Show me status for CNC Machine #1")
        self.assertTrue(any(term in reply for term in ["CNC", "Machine", "Health Index", "Operational"]))


if __name__ == "__main__":
    unittest.main()
