"""
Prescriptive Action & Work Order Recommendation Agent.
Translates diagnostics and prognostics into actionable maintenance work orders with financial risk analysis.
"""

from typing import Dict, Any, List
from datetime import datetime, timedelta
from agents.base import BaseAgent
from config import MACHINE_PROFILES, FAULT_MODES


class PrescriptiveAgent(BaseAgent):
    """Generates optimal maintenance plans, spare part requests, and automated work orders."""

    def __init__(self):
        super().__init__(
            agent_id="prescriptive_agent",
            name="Prescriptive Action & Work Order Agent",
            role="Generates specific corrective actions, spare part dispatch orders, cost-benefit trade-offs, and maintenance tickets."
        )

    def process(self, prognosis_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates prescriptive maintenance recommendation & work order ticket.
        """
        machine_id = prognosis_payload.get("machine_id", "CNC-MILL-01")
        profile = MACHINE_PROFILES.get(machine_id, MACHINE_PROFILES["CNC-MILL-01"])
        
        fault_code = prognosis_payload.get("fault_code", "NORMAL")
        rul_hours = prognosis_payload.get("estimated_rul_hours", 100.0)
        health_index = prognosis_payload.get("health_index", 100.0)
        
        downtime_rate = profile.get("downtime_cost_per_hour", 1500.0)

        # Build Prescriptive Plan based on Fault Code
        prescriptive_plan = self._get_prescriptive_plan(fault_code, machine_id)
        
        # Calculate Priority
        if rul_hours < 12.0 or health_index < 30.0:
            priority = "CRITICAL"
            recommended_timeframe = "IMMEDIATE (Within 4-8 hours)"
            est_downtime_hours = 6.0
        elif rul_hours < 48.0 or health_index < 60.0:
            priority = "HIGH"
            recommended_timeframe = "Next Scheduled Shift (Within 24 hours)"
            est_downtime_hours = 4.0
        elif rul_hours < 120.0 or health_index < 80.0:
            priority = "MEDIUM"
            recommended_timeframe = "Weekly Maintenance Window (Within 5 days)"
            est_downtime_hours = 2.0
        else:
            priority = "LOW"
            recommended_timeframe = "Routine Monthly Audit"
            est_downtime_hours = 1.0

        # Financial Calculations
        unplanned_failure_cost = (est_downtime_hours * 2.5) * downtime_rate + prescriptive_plan["parts_cost"] * 1.8
        planned_maintenance_cost = est_downtime_hours * downtime_rate + prescriptive_plan["parts_cost"]
        financial_savings = max(0.0, unplanned_failure_cost - planned_maintenance_cost)

        work_order_id = f"WO-{machine_id}-{int(datetime.now().timestamp()) % 100000}"

        work_order = {
            "work_order_id": work_order_id,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "machine_id": machine_id,
            "machine_name": profile.get("name", machine_id),
            "location": profile.get("location", "Main Plant"),
            "priority": priority,
            "recommended_timeframe": recommended_timeframe,
            "fault_code": fault_code,
            "fault_name": FAULT_MODES.get(fault_code, fault_code),
            "health_index": health_index,
            "estimated_rul_hours": rul_hours,
            "action_title": prescriptive_plan["title"],
            "step_by_step_instructions": prescriptive_plan["steps"],
            "required_spare_parts": prescriptive_plan["spare_parts"],
            "technician_role": prescriptive_plan["technician_role"],
            "estimated_repair_time_hours": est_downtime_hours,
            "financial_impact": {
                "downtime_rate_per_hr": downtime_rate,
                "unplanned_catastrophic_risk_cost": round(unplanned_failure_cost, 2),
                "planned_intervention_cost": round(planned_maintenance_cost, 2),
                "net_financial_savings": round(financial_savings, 2)
            }
        }

        self.send_message(
            recipient="llm_assistant",
            topic="WORK_ORDER_GENERATED",
            payload=work_order
        )

        return work_order

    def _get_prescriptive_plan(self, fault_code: str, machine_id: str) -> Dict[str, Any]:
        """Maps fault codes to detailed industrial corrective action procedures."""
        plans = {
            "BEARING_FATIGUE": {
                "title": "Precision Spindle Bearing Assembly Replacement",
                "steps": [
                    "Isolate electrical main lock-out tag-out (LOTO) for the spindle motor.",
                    "Disassemble outer bearing housing and extract worn roller bearings.",
                    "Inspect shaft surface for fretting corrosion and measure runout tolerance (<0.005mm).",
                    "Press-fit new ceramic hybrid high-speed bearing set with ISO VG 32 synthetic grease.",
                    "Re-torque housing bolts to specified Nm and perform dynamic balancing check."
                ],
                "spare_parts": ["Ceramic Spindle Bearing Kit (SKF 7014-C)", "High-Temp Synthetic Grease (NLGI 2)"],
                "technician_role": "Level 3 Precision Mechanical Specialist",
                "parts_cost": 850.0
            },
            "HYDRAULIC_LEAK": {
                "title": "Hydraulic Pressure Seal Replacement & Cavitation Relief",
                "steps": [
                    "Depressurize main accumulator reservoir and lock out hydraulic pump motor.",
                    "Drain hydraulic oil reservoir and inspect fluid sample for particle contamination.",
                    "Replace high-pressure Viton O-rings and directional control valve seals.",
                    "Refill reservoir with clean ISO VG 46 anti-wear hydraulic oil using a 3-micron filter cart.",
                    "Bleed trapped air from relief valve block and pressure test at 160 bar."
                ],
                "spare_parts": ["Viton Hydraulic Seal Kit (Parker-04)", "ISO VG 46 Hydraulic Fluid (20L)"],
                "technician_role": "Certified Hydraulics Technician",
                "parts_cost": 420.0
            },
            "MOTOR_OVERHEATING": {
                "title": "Stator Winding Thermal Inspection & Cooling Duct Cleanout",
                "steps": [
                    "Perform LOTO on motor power feed and disconnect stator junction box.",
                    "Measure winding insulation resistance (Megger test target > 100 MΩ).",
                    "Inspect forced air cooling fan impeller for blockage or mechanical drag.",
                    "Clean heat sink cooling fins using dry compressed air / CO2 blast.",
                    "Verify thermal sensor RTD calibration and re-energize motor."
                ],
                "spare_parts": ["Auxiliary Cooling Fan Blower Assembly", "Motor Terminal Junction Gasket"],
                "technician_role": "Industrial Electrical Specialist",
                "parts_cost": 310.0
            },
            "TOOL_DEGRADATION": {
                "title": "Cutting Tool Insert Replacement & Calibration",
                "steps": [
                    "Stop machining cycle and retract Z-axis spindle head.",
                    "Remove worn carbide cutter inserts from tool holder.",
                    "Inspect tool shank for micro-cracks using dye penetrant test.",
                    "Install new TiAlN coated carbide inserts and torque mounting screws.",
                    "Perform automated tool length offset (TLO) laser probe calibration."
                ],
                "spare_parts": ["TiAlN Carbide Insert Pack (10x)", "Precision Tool Screw Set"],
                "technician_role": "CNC Machinist / Machine Operator",
                "parts_cost": 180.0
            },
            "SPINDLE_MISALIGNMENT": {
                "title": "Laser Spindle & Motor Shaft Realignment",
                "steps": [
                    "Mount laser alignment targets on motor drive shaft and spindle input hub.",
                    "Rotate shaft 360 degrees to measure parallel and angular misalignment.",
                    "Loosen motor base anchor bolts and insert precision stainless steel shims.",
                    "Tighten anchor bolts while monitoring live laser telemetry until alignment is < 0.02mm.",
                    "Verify vibration RMS at full operating RPM."
                ],
                "spare_parts": ["Precision Stainless Steel Shim Kit (0.05mm - 1.0mm)"],
                "technician_role": "Vibration & Precision Alignment Specialist",
                "parts_cost": 120.0
            }
        }

        default_plan = {
            "title": "General System Inspection & Maintenance Audit",
            "steps": [
                "Perform visual inspection of electrical cables and fluid hoses.",
                "Check lubrication levels and verify normal operating temperatures.",
                "Execute automated self-test diagnostics."
            ],
            "spare_parts": ["Standard Maintenance Inspection Kit"],
            "technician_role": "General Maintenance Technician",
            "parts_cost": 100.0
        }

        return plans.get(fault_code, default_plan)
