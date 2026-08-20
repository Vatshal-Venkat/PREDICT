"""
Enterprise CMMS (Computerized Maintenance Management System) & SAP PM Exporter.
Converts predictive work orders into standardized SAP PM and Maximo JSON schemas.
"""

from typing import Dict, Any

def export_to_sap_pm_schema(work_order: Dict[str, Any]) -> Dict[str, Any]:
    """Formats a prescriptive work order into SAP PM (Plant Maintenance) Notification & Order payload."""
    m_id = work_order.get("machine_id", "UNKNOWN")
    wo_id = work_order.get("work_order_id", "WO-000")
    fault = work_order.get("fault_type", "General Defect")
    prio = work_order.get("priority", "HIGH")

    sap_priority_map = {
        "CRITICAL": "1-Very High",
        "HIGH": "2-High",
        "MEDIUM": "3-Medium",
        "LOW": "4-Low"
    }

    return {
        "sap_pm_header": {
            "notification_type": "M1 (Predictive Maintenance Alert)",
            "order_type": "PM02 (Preventive & Predictive Work Order)",
            "equipment_id": f"EQ-SAP-{m_id}",
            "functional_location": f"FL-PLANT1-{m_id.split('-')[0]}",
            "planner_group": "PG-RELIABILITY-01",
            "work_center": "WC-MAINT-MECH",
            "priority": sap_priority_map.get(prio, "2-High")
        },
        "order_details": {
            "order_number": f"SAP-{wo_id}",
            "short_text": f"PdM Action Required: {fault} on {m_id}",
            "estimated_duration_hours": work_order.get("maintenance_guide", {}).get("estimated_downtime_hours", 2.5),
            "required_parts": work_order.get("maintenance_guide", {}).get("required_parts", []),
            "operations": [
                {
                    "step_number": idx + 1,
                    "description": step,
                    "work_center": "WC-MAINT-MECH"
                }
                for idx, step in enumerate(work_order.get("maintenance_guide", {}).get("steps", []))
            ]
        },
        "financial_costing": work_order.get("financial_impact", {}),
        "exported_at": "2026-08-20T21:35:00Z"
    }

def export_to_maximo_schema(work_order: Dict[str, Any]) -> Dict[str, Any]:
    """Formats a work order into IBM Maximo Integration Framework (MIF) payload."""
    wo_id = work_order.get("work_order_id", "WO-000")
    m_id = work_order.get("machine_id", "UNKNOWN")

    return {
        "maximo_work_order": {
            "wonum": f"MX-{wo_id}",
            "assetnum": m_id,
            "siteid": "PLANT-01",
            "orgid": "MFG-CORP",
            "description": f"AI Predictive Dispatch: {work_order.get('fault_type')}",
            "status": "APPR (Approved for Execution)",
            "wopriority": 1 if work_order.get("priority") == "CRITICAL" else 2,
            "targetstart": "2026-08-21T08:00:00Z",
            "targetfinish": "2026-08-21T12:00:00Z"
        }
    }
