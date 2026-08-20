"""
RAG (Retrieval-Augmented Generation) Engine for OEM Equipment Manuals & Maintenance SOPs.
Stores indexed technical manuals, torque specifications, replacement steps, and safety guides.
"""

from typing import Dict, Any, List

OEM_MANUAL_DOCUMENTS = [
    {
        "doc_id": "SOP-BEARING-6205",
        "title": "OEM Service Manual: SKF 6205 Deep Groove Ball Bearing Replacement",
        "machine_type": "CNC Mill / Spindle",
        "manual_ref": "SKF Maintenance Handbook Section 4.2, Page 118",
        "content": "Step 1: Isolate spindle main breaker and apply LOTO (Lockout/Tagout). Step 2: Use hydraulic puller to safely dismount worn outer race without scoring precision shaft. Step 3: Heat new SKF 6205 bearing to 110°C using induction heater before mounting. Step 4: Torques: Retaining ring bolts to 45 Nm using calibrated torque wrench."
    },
    {
        "doc_id": "SOP-HYD-CAVITATION",
        "title": "Troubleshooting & Repair Guide: Hydraulic Pump Cavitation & Pressure Drops",
        "machine_type": "Hydraulic Press",
        "manual_ref": "Parker Hannifin Hydraulic Systems Manual, Doc #PH-HYD-809, Page 45",
        "content": "Cavitation indicates air entrainment or suction line filter blockage. Procedure: Inspect suction strainer for metal shavings or varnish. Flush hydraulic reservoir with ISO VG 46 fluid. Replace Viton high-pressure seals (Part #HYD-SEAL-P102). Bleed air from manifold bleed valve at 5 bar operating pressure."
    },
    {
        "doc_id": "SOP-MOTOR-OVERHEAT",
        "title": "OEM Technical Manual: Siemens 37kW Motor Stator Winding Thermal Limits",
        "machine_type": "Industrial Conveyor / Compressor",
        "manual_ref": "Siemens Low Voltage Motor Maintenance Guide, Page 88",
        "content": "Class F insulation thermal limit is 155°C. Continuous operation above 110°C reduces insulation lifespan exponentially. Maintenance Action: Measure phase-to-phase winding resistance with Megohmmeter (min 100 M-Ohm). Clean motor cooling fins using dry compressed air at 4 bar. Check cooling fan impeller rotation."
    },
    {
        "doc_id": "SOP-TOOL-WEAR-CNC",
        "title": "Sandvik Coromant Milling Tool Insert Replacement SOP",
        "machine_type": "CNC Mill",
        "manual_ref": "Sandvik Machining Guide #SC-2025, Page 32",
        "content": "Flank wear (VB) > 0.3mm requires immediate insert rotation. Inspect tool holder pocket for chips before seating new Carbide Insert (Part #CNC-CUT-CARB). Torque Torx T15 clamping screws to exactly 3.5 Nm. Verify tool offset height on optical pre-setter before resuming automatic g-code execution."
    },
    {
        "doc_id": "SOP-ALIGNMENT-LASER",
        "title": "Precision Shaft & Spindle Laser Alignment Standard",
        "machine_type": "Multi-Axis Milling & Lathes",
        "manual_ref": "Fluke Industrial Alignment Guide, Doc #FLK-ALGN-202, Page 14",
        "content": "Angular & parallel misalignment produces 2X rotational harmonic vibration peaks (120 Hz @ 3600 RPM). Mount dual-laser alignment sensors on driver and driven hubs. Adjust stainless steel shim pack (Part #SPD-ALGN-SHIM) under motor feet until offset tolerance is under 0.05 mm across 360 degree rotation."
    }
]

def search_oem_manuals(query: str, limit: int = 2) -> List[Dict[str, Any]]:
    """Performs keyword/semantic match across indexed OEM manuals."""
    q_words = query.lower().split()
    scored_docs = []

    for doc in OEM_MANUAL_DOCUMENTS:
        text = f"{doc['title']} {doc['machine_type']} {doc['content']}".lower()
        score = sum(2 if w in doc['title'].lower() else (1 if w in text else 0) for w in q_words)
        if score > 0:
            scored_docs.append((score, doc))

    scored_docs.sort(key=lambda x: x[0], reverse=True)
    matches = [item[1] for item in scored_docs[:limit]]

    # If no specific keyword match, return top general manuals
    if not matches:
        matches = OEM_MANUAL_DOCUMENTS[:2]

    return matches
