"""
Fleet Multi-Agent Orchestrator. Coordinates agent workflows and fleet state.
"""

from typing import Dict, Any, List, Optional
from models.trainer import get_or_train_bundle, PredictiveModelBundle
from agents.telemetry_agent import TelemetryAgent
from agents.diagnostic_agent import DiagnosticAgent
from agents.prognostic_agent import PrognosticAgent
from agents.prescriptive_agent import PrescriptiveAgent
from agents.llm_assistant import LLMAssistantAgent
from config import MACHINE_PROFILES, FAULT_MODES


class FleetOrchestrator:
    """Supervises multi-agent communication, maintains live fleet state, and manages work orders."""

    def __init__(self, model_bundle: Optional[PredictiveModelBundle] = None):
        self.bundle = model_bundle or get_or_train_bundle()

        # Initialize Sub-Agents
        self.telemetry_agent = TelemetryAgent(self.bundle)
        self.diagnostic_agent = DiagnosticAgent(self.bundle)
        self.prognostic_agent = PrognosticAgent(self.bundle)
        self.prescriptive_agent = PrescriptiveAgent()
        self.assistant_agent = LLMAssistantAgent()

        # Fleet State & Active Ticket Repository
        self.fleet_state: Dict[str, Dict[str, Any]] = {}
        self.work_orders: List[Dict[str, Any]] = []
        self.alert_logs: List[Dict[str, Any]] = []

        # Initialize default baseline for each machine
        for m_id, profile in MACHINE_PROFILES.items():
            self.fleet_state[m_id] = {
                "machine_id": m_id,
                "machine_name": profile["name"],
                "health_index": 100.0,
                "health_status": "Healthy",
                "health_category": "EXCELLENT",
                "predicted_rul_hours": 1000.0,
                "estimated_rul_hours": 1000.0,
                "diagnosed_fault": "NORMAL",
                "fault_code": "NORMAL",
                "active_fault": "NORMAL",
                "anomaly_score": 0.0,
                "confidence": 1.0,
                "recommendation": "Nominal Operation",
                "telemetry": profile["baseline"]
            }

    def process_telemetry_frame(self, telemetry_frame: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes end-to-end multi-agent processing pipeline on a single telemetry frame.
        """
        machine_id = telemetry_frame.get("machine_id", "CNC-MILL-01")

        # 1. Telemetry Agent Monitors Reading
        telemetry_output = self.telemetry_agent.process(telemetry_frame)

        is_anomaly = telemetry_output.get("is_anomaly", False)
        anomaly_score = telemetry_output.get("anomaly_score", 0.0)

        # Update Live Telemetry in Fleet State
        self.fleet_state[machine_id]["telemetry"] = telemetry_frame
        self.fleet_state[machine_id]["anomaly_score"] = anomaly_score

        if is_anomaly or telemetry_frame.get("fault_mode", "NORMAL") != "NORMAL":
            # 2. Diagnostic Agent classifies failure mode
            diag_output = self.diagnostic_agent.process(telemetry_output)

            # 3. Prognostic Agent estimates RUL & Health Index
            prog_output = self.prognostic_agent.process(diag_output)

            h_idx = prog_output["health_index"]
            h_status = "Critical" if h_idx < 40 else ("Degraded / Warning" if h_idx < 70 else "Healthy")
            fault_code = prog_output["fault_code"]
            fault_name = FAULT_MODES.get(fault_code, fault_code)
            rul_hours = prog_output["estimated_rul_hours"]

            # Update Fleet State with unified prognostic results
            self.fleet_state[machine_id]["health_index"] = h_idx
            self.fleet_state[machine_id]["health_status"] = h_status
            self.fleet_state[machine_id]["health_category"] = prog_output["health_category"]
            self.fleet_state[machine_id]["predicted_rul_hours"] = rul_hours
            self.fleet_state[machine_id]["estimated_rul_hours"] = rul_hours
            self.fleet_state[machine_id]["diagnosed_fault"] = fault_name
            self.fleet_state[machine_id]["fault_code"] = fault_code
            self.fleet_state[machine_id]["active_fault"] = fault_name
            self.fleet_state[machine_id]["confidence"] = diag_output.get("confidence", 90.0) / 100.0
            self.fleet_state[machine_id]["recommendation"] = f"Action Required: Repair {fault_name}"

            # 4. Prescriptive Agent generates work order if priority warrants it
            work_order = self.prescriptive_agent.process(prog_output)
            
            # Record Work Order (deduplicate by machine & fault)
            existing_ids = [wo["machine_id"] for wo in self.work_orders if wo["priority"] in ["CRITICAL", "HIGH"]]
            if machine_id not in existing_ids:
                self.work_orders.insert(0, work_order)

            # Record Alert Log
            self.alert_logs.insert(0, {
                "timestamp": telemetry_frame.get("timestamp_idx", 0),
                "machine_id": machine_id,
                "fault_code": diag_output["fault_code"],
                "fault_name": diag_output["fault_description"],
                "confidence": diag_output["confidence"],
                "health_index": prog_output["health_index"],
                "rul_hours": prog_output["estimated_rul_hours"],
                "work_order_id": work_order["work_order_id"]
            })

            return {
                "status": "ANOMALY_PROCESSED",
                "telemetry": telemetry_output,
                "diagnosis": diag_output,
                "prognosis": prog_output,
                "work_order": work_order
            }

        else:
            # Healthy telemetry reading
            current_health = self.fleet_state[machine_id].get("health_index", 100.0)
            if current_health < 80.0:
                rec_health = min(100.0, current_health + 0.5)
                h_status = "Critical" if rec_health < 40 else ("Degraded / Warning" if rec_health < 70 else "Healthy")
                active_fault = self.fleet_state[machine_id].get("active_fault", "DEGRADED_OPERATION")
                rul_hours = round(max(5.0, (rec_health / 100.0) * 500.0), 1)

                self.fleet_state[machine_id]["health_index"] = round(rec_health, 1)
                self.fleet_state[machine_id]["health_status"] = h_status
                self.fleet_state[machine_id]["predicted_rul_hours"] = rul_hours
                self.fleet_state[machine_id]["estimated_rul_hours"] = rul_hours
                self.fleet_state[machine_id]["diagnosed_fault"] = active_fault if rec_health < 70 else "NORMAL"
                self.fleet_state[machine_id]["fault_code"] = active_fault if rec_health < 70 else "NORMAL"
                self.fleet_state[machine_id]["recommendation"] = f"Ongoing Recovery / Repair {active_fault}" if rec_health < 70 else "Nominal Operation"
            else:
                self.fleet_state[machine_id]["health_index"] = 100.0
                self.fleet_state[machine_id]["health_status"] = "Healthy"
                self.fleet_state[machine_id]["health_category"] = "EXCELLENT"
                self.fleet_state[machine_id]["predicted_rul_hours"] = 1000.0
                self.fleet_state[machine_id]["estimated_rul_hours"] = 1000.0
                self.fleet_state[machine_id]["diagnosed_fault"] = "NORMAL"
                self.fleet_state[machine_id]["fault_code"] = "NORMAL"
                self.fleet_state[machine_id]["recommendation"] = "Nominal Operation"

            return {
                "status": "NORMAL",
                "telemetry": telemetry_output
            }

    def reset_fleet(self):
        """Resets all fleet machine states back to 100% healthy baseline."""
        self.work_orders.clear()
        self.alert_logs.clear()
        for m_id, profile in MACHINE_PROFILES.items():
            self.fleet_state[m_id] = {
                "machine_id": m_id,
                "machine_name": profile["name"],
                "health_index": 100.0,
                "health_status": "Healthy",
                "health_category": "EXCELLENT",
                "predicted_rul_hours": 1000.0,
                "estimated_rul_hours": 1000.0,
                "diagnosed_fault": "NORMAL",
                "fault_code": "NORMAL",
                "active_fault": "NORMAL",
                "anomaly_score": 0.0,
                "confidence": 1.0,
                "recommendation": "Nominal Operation",
                "telemetry": profile["baseline"]
            }

    def query_assistant(self, query: str) -> str:
        """Proxies user natural language query to the LLM Operational Assistant Agent."""
        payload = {
            "query": query,
            "fleet_state": self.fleet_state,
            "work_orders": self.work_orders
        }
        res = self.assistant_agent.process(payload)
        return res.get("response", "No response generated.")
