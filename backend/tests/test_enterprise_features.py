"""
Unit test suite for Enterprise Enhancements (FFT, SHAP, Multimodal, Inventory, CMMS, OEE, RAG, Auth).
"""

import unittest
from database import init_db
from models.fft_analyzer import compute_fft_spectrum
from models.explainability import calculate_shap_contributions
from models.multimodal import analyze_visual_part_image, analyze_acoustic_audio
from models.inventory import get_inventory_status, auto_requisition_part
from models.cmms_exporter import export_to_sap_pm_schema, export_to_maximo_schema
from models.oee import calculate_machine_oee, calculate_fleet_oee_summary
from agents.rag_engine import search_oem_manuals
from agents.llm_assistant import LLMAssistantAgent
from auth import create_mock_jwt_token, verify_role_permission

class TestEnterpriseFeatures(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()

    def test_fft_analyzer(self):
        vib_data = [1.2, 1.5, 2.1, 1.8, 2.5, 3.1, 2.8, 3.5, 4.0, 3.2]
        res = compute_fft_spectrum(vib_data)
        self.assertIn("dominant_frequency_hz", res)
        self.assertIn("spectral_energy_density", res)
        self.assertIn("band_classification", res)

    def test_shap_explainability(self):
        telemetry = {"vibration_rms": 4.5, "bearing_temp_c": 92.0}
        shap = calculate_shap_contributions(telemetry, health_index=35.0)
        self.assertTrue(len(shap) > 0)
        self.assertIn("contribution_pct", shap[0])

    def test_multimodal_inspection(self):
        visual = analyze_visual_part_image("sample_bearing_scan")
        self.assertIn("defect_details", visual)
        acoustic = analyze_acoustic_audio("motor_hum_anomaly")
        self.assertIn("acoustic_status", acoustic)

    def test_inventory_and_cmms(self):
        items = get_inventory_status()
        self.assertTrue(len(items) > 0)
        
        sample_wo = {
            "work_order_id": "WO-999",
            "machine_id": "CNC-MILL-01",
            "fault_type": "BEARING_OUTER_RACE_FATIGUE",
            "priority": "HIGH"
        }
        sap_payload = export_to_sap_pm_schema(sample_wo)
        self.assertIn("sap_pm_header", sap_payload)

    def test_oee_metrics(self):
        oee = calculate_machine_oee(health_index=95.0, diagnosed_fault="NORMAL")
        self.assertTrue(oee["oee_percentage"] > 80.0)

    def test_rag_assistant(self):
        manuals = search_oem_manuals("SKF 6205 torque")
        self.assertTrue(len(manuals) > 0)
        
        agent = LLMAssistantAgent()
        resp = agent.process({"query": "Show OEM torque specs for SKF 6205 bearing replacement"})
        self.assertIn("RAG Engine Retrieval", resp["response"])

    def test_auth_rbac(self):
        token = create_mock_jwt_token("eng_user", "Engineer")
        self.assertIn("Engineer", token)
        self.assertTrue(verify_role_permission("Manager", "export_cmms"))
        self.assertFalse(verify_role_permission("Operator", "export_cmms"))

if __name__ == "__main__":
    unittest.main()
