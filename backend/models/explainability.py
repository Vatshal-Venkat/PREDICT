"""
Explainable AI (XAI) Feature Importance Engine.
Calculates SHAP-style percentage contributions of telemetry parameters to anomaly score.
"""

from typing import Dict, Any, List

FEATURE_BASELINES = {
    "vibration_rms": {"nominal": 1.2, "weight": 0.35, "label": "Vibration RMS"},
    "bearing_temp_c": {"nominal": 55.0, "weight": 0.25, "label": "Bearing Temperature"},
    "hydraulic_pressure_psi": {"nominal": 2000.0, "weight": 0.15, "label": "Hydraulic Pressure"},
    "acoustic_emission_db": {"nominal": 45.0, "weight": 0.15, "label": "Acoustic Emission"},
    "motor_current_amp": {"nominal": 22.0, "weight": 0.10, "label": "Motor Current"}
}

def calculate_shap_contributions(last_telemetry: Dict[str, float], health_index: float) -> List[Dict[str, Any]]:
    """
    Computes SHAP-like attribution breakdown for current machine health score.
    Returns list of features with their magnitude deviation, risk weight, and % contribution.
    """
    raw_deviations = {}
    total_weighted_dev = 0.0

    for feat_key, meta in FEATURE_BASELINES.items():
        val = last_telemetry.get(feat_key, meta["nominal"])
        nom = meta["nominal"]
        weight = meta["weight"]

        # Percent deviation from nominal baseline
        dev = abs(val - nom) / (nom if nom != 0 else 1.0)
        weighted_dev = dev * weight
        raw_deviations[feat_key] = {
            "label": meta["label"],
            "current_value": round(val, 2),
            "nominal_value": nom,
            "weighted_dev": weighted_dev
        }
        total_weighted_dev += weighted_dev

    contributions = []
    if total_weighted_dev == 0.0 or health_index >= 90.0:
        # Uniform healthy distribution
        for feat_key, item in raw_deviations.items():
            contributions.append({
                "feature": item["label"],
                "key": feat_key,
                "current_value": item["current_value"],
                "contribution_pct": 20.0,
                "impact": "Low / Nominal"
            })
    else:
        for feat_key, item in raw_deviations.items():
            pct = round((item["weighted_dev"] / total_weighted_dev) * 100.0, 1)
            impact = "Critical Driver" if pct > 35 else ("Moderate Driver" if pct > 15 else "Minor Driver")
            contributions.append({
                "feature": item["label"],
                "key": feat_key,
                "current_value": item["current_value"],
                "contribution_pct": pct,
                "impact": impact
            })

    # Sort descending by contribution percentage
    contributions.sort(key=lambda x: x["contribution_pct"], reverse=True)
    return contributions
