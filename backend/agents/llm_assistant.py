"""
Operational Maintenance Chat Assistant Agent.
Provides natural language querying, diagnostic summary generation, and interactive plant fleet guidance.
"""

from typing import Dict, Any, List
from agents.base import BaseAgent
from config import MACHINE_PROFILES, FAULT_MODES


class LLMAssistantAgent(BaseAgent):
    """Natural language operational assistant for maintenance engineers and plant managers."""

    def __init__(self):
        super().__init__(
            agent_id="llm_assistant",
            name="Plant Maintenance Operational Assistant",
            role="Answers natural language queries about machine health, active maintenance tickets, risk schedules, and diagnostics."
        )

    def process(self, query_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes a natural language query using fleet state context.
        """
        user_query = query_payload.get("query", "").strip()
        fleet_state = query_payload.get("fleet_state", {})
        active_work_orders = query_payload.get("work_orders", [])

        response_text = self._generate_response(user_query, fleet_state, active_work_orders)

        return {
            "query": user_query,
            "response": response_text,
            "agent": self.name
        }

    def _generate_response(
        self,
        query: str,
        fleet_state: Dict[str, Any],
        work_orders: List[Dict[str, Any]]
    ) -> str:
        """Parses intent and constructs structured, informative response."""
        q_lower = query.lower()

        # 1. Summary of overall fleet health
        if any(w in q_lower for w in ["fleet", "overview", "summary", "status", "all machines"]):
            if not fleet_state:
                return "The fleet monitor is currently initializing. All machine telemetry systems are coming online."

            total = len(fleet_state)
            critical = [m for m, data in fleet_state.items() if data.get("health_index", 100) < 40]
            warning = [m for m, data in fleet_state.items() if 40 <= data.get("health_index", 100) < 70]
            healthy = [m for m, data in fleet_state.items() if data.get("health_index", 100) >= 70]

            lines = [
                "### Industrial Fleet Status Summary",
                f"- Total Monitored Equipment: {total}",
                f"- Healthy: {len(healthy)} machine(s)",
                f"- Warning Stage: {len(warning)} machine(s)",
                f"- Critical Risk: {len(critical)} machine(s)",
                ""
            ]

            if critical:
                lines.append("[WARNING] CRITICAL ATTENTION REQUIRED:")
                for m_id in critical:
                    info = fleet_state[m_id]
                    lines.append(f"  - {info.get('machine_name', m_id)}: Health Index '{info.get('health_index')}%', RUL '{info.get('estimated_rul_hours')} hrs', Active Fault: {FAULT_MODES.get(info.get('fault_code'), info.get('fault_code'))}")
            else:
                lines.append("[OK] All machines are operating within acceptable parameters.")

            return "\n".join(lines)

        # 2. Specific machine query
        for m_id, info in fleet_state.items():
            m_name = info.get("machine_name", m_id).lower()
            if m_id.lower() in q_lower or m_name in q_lower or m_id.replace("-", "").lower() in q_lower:
                fault_name = FAULT_MODES.get(info.get("fault_code"), info.get("fault_code"))
                return (
                    f"### Operational Status for {info.get('machine_name', m_id)}\n"
                    f"- Health Index: '{info.get('health_index', 100)}%' ({info.get('health_category', 'NORMAL')})\n"
                    f"- Estimated Remaining Useful Life (RUL): '{info.get('estimated_rul_hours', 'N/A')} hours'\n"
                    f"- Active Diagnostic Status: {fault_name}\n"
                    f"- Latest Anomaly Score: '{info.get('anomaly_score', 0.0)}' (Threshold: 0.45)\n"
                    f"- Key Telemetry: Vibration RMS: '{info.get('telemetry', {}).get('vibration_rms')} mm/s', Temp: '{info.get('telemetry', {}).get('temperature')} deg C', Pressure: '{info.get('telemetry', {}).get('pressure')} bar'\n"
                    f"- Recommended Action: Refer to generated work orders for step-by-step procedures."
                )

        # 3. Work Orders query
        if any(w in q_lower for w in ["work order", "ticket", "task", "repair", "maintenance plan"]):
            if not work_orders:
                return "No active maintenance work orders have been dispatched. All machinery is healthy or awaiting anomaly detection events."

            lines = [f"### Active Work Orders ({len(work_orders)} Pending)\n"]
            for wo in work_orders[:5]:
                lines.append(
                    f"Ticket '{wo.get('work_order_id')}' [{wo.get('priority')}]\n"
                    f"- Target Unit: {wo.get('machine_name')}\n"
                    f"- Procedure: {wo.get('action_title')}\n"
                    f"- Timeframe: {wo.get('recommended_timeframe')}\n"
                    f"- Financial Savings: ${wo.get('financial_impact', {}).get('net_financial_savings', 0):,.2f}\n"
                )
            return "\n".join(lines)

        # 4. Fallback helpful response
        return (
            "I am your AI Predictive Maintenance Operational Assistant. You can ask me:\n"
            "- 'What is the overall fleet status?'\n"
            "- 'Show me status for CNC Machine #1 or Hydraulic Pump #2'\n"
            "- 'What work orders are active?'\n"
            "- 'Which machines are at risk of failure in the next 24 hours?'"
        )
