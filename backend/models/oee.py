"""
OEE (Overall Equipment Effectiveness) Calculation Engine.
Computes Availability, Performance, and Quality metrics for manufacturing assets.
"""

from typing import Dict, Any, List

def calculate_machine_oee(health_index: float, diagnosed_fault: str) -> Dict[str, Any]:
    """
    Computes Overall Equipment Effectiveness (OEE) metrics.
    OEE = Availability * Performance * Quality
    """
    if health_index >= 85.0:
        availability = 0.98
        performance = 0.95
        quality = 0.99
    elif 60.0 <= health_index < 85.0:
        availability = 0.88
        performance = 0.82
        quality = 0.95
    else: # Critical
        availability = 0.65
        performance = 0.55
        quality = 0.88

    if diagnosed_fault != "NORMAL":
        performance -= 0.05

    oee_val = round(availability * performance * quality * 100.0, 1)

    return {
        "oee_percentage": oee_val,
        "availability_pct": round(availability * 100.0, 1),
        "performance_pct": round(performance * 100.0, 1),
        "quality_pct": round(quality * 100.0, 1),
        "oee_grade": "World Class (>85%)" if oee_val >= 85 else ("Acceptable (70-85%)" if oee_val >= 70 else "Sub-Optimal (<70%)")
    }

def calculate_fleet_oee_summary(machines: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Computes plant-wide average OEE score across all fleet assets."""
    if not machines:
        return {"fleet_oee_pct": 92.5, "oee_grade": "World Class"}

    total_oee = 0.0
    for m in machines:
        m_oee = calculate_machine_oee(m.get("health_index", 100.0), m.get("diagnosed_fault", "NORMAL"))
        total_oee += m_oee["oee_percentage"]

    avg_oee = round(total_oee / len(machines), 1)

    return {
        "fleet_oee_pct": avg_oee,
        "oee_grade": "World Class (>85%)" if avg_oee >= 85 else ("Acceptable (70-85%)" if avg_oee >= 70 else "Needs Attention (<70%)"),
        "target_oee_pct": 85.0
    }
