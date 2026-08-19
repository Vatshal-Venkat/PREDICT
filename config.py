"""
Industrial Configuration & Machine Profiles for Predictive Maintenance AI Agent System.
"""

from typing import Dict, Any

# Machine Types and standard baseline operational boundaries
MACHINE_PROFILES: Dict[str, Dict[str, Any]] = {
    "CNC-MILL-01": {
        "name": "CNC Milling Machine #1",
        "type": "CNC Mill",
        "location": "Bay A - Precision Tooling",
        "baseline": {
            "vibration_rms": 0.85,      # mm/s
            "vibration_kurtosis": 3.0,  # normal distribution baseline
            "temperature": 42.0,        # °C
            "pressure": 6.2,            # bar
            "acoustic_emission": 45.0,  # dB
            "power_draw": 12.5,         # kW
            "rpm": 3000.0               # RPM
        },
        "critical_limits": {
            "vibration_rms_max": 2.5,
            "vibration_kurtosis_max": 6.0,
            "temperature_max": 80.0,
            "pressure_min": 4.0,
            "acoustic_emission_max": 75.0,
            "power_draw_max": 20.0
        },
        "downtime_cost_per_hour": 1500.0,
        "primary_fault_risks": ["Bearing Fatigue", "Tool Degradation", "Spindle Misalignment"]
    },
    "HYD-PUMP-02": {
        "name": "Hydraulic Pump System #2",
        "type": "Hydraulic Unit",
        "location": "Bay B - Heavy Press Area",
        "baseline": {
            "vibration_rms": 0.60,
            "vibration_kurtosis": 2.9,
            "temperature": 50.0,
            "pressure": 150.0,
            "acoustic_emission": 52.0,
            "power_draw": 35.0,
            "rpm": 1750.0
        },
        "critical_limits": {
            "vibration_rms_max": 2.2,
            "vibration_kurtosis_max": 5.5,
            "temperature_max": 88.0,
            "pressure_min": 110.0,
            "acoustic_emission_max": 80.0,
            "power_draw_max": 50.0
        },
        "downtime_cost_per_hour": 2800.0,
        "primary_fault_risks": ["Hydraulic Cavitation/Leak", "Seal Failure", "Fluid Contamination"]
    },
    "IND-COMP-03": {
        "name": "Industrial Screw Compressor #3",
        "type": "Compressor",
        "location": "Utility Building 1",
        "baseline": {
            "vibration_rms": 1.10,
            "vibration_kurtosis": 3.1,
            "temperature": 65.0,
            "pressure": 8.5,
            "acoustic_emission": 60.0,
            "power_draw": 55.0,
            "rpm": 2400.0
        },
        "critical_limits": {
            "vibration_rms_max": 3.2,
            "vibration_kurtosis_max": 6.5,
            "temperature_max": 105.0,
            "pressure_min": 5.5,
            "acoustic_emission_max": 88.0,
            "power_draw_max": 75.0
        },
        "downtime_cost_per_hour": 2100.0,
        "primary_fault_risks": ["Bearing Fatigue", "Motor Overheating", "Valving Degradation"]
    },
    "ROB-ARM-04": {
        "name": "Robotic Assembly Arm #4",
        "type": "Articulated Robot",
        "location": "Bay C - Final Assembly Line",
        "baseline": {
            "vibration_rms": 0.45,
            "vibration_kurtosis": 2.8,
            "temperature": 38.0,
            "pressure": 5.0,
            "acoustic_emission": 40.0,
            "power_draw": 8.0,
            "rpm": 1200.0
        },
        "critical_limits": {
            "vibration_rms_max": 1.8,
            "vibration_kurtosis_max": 5.0,
            "temperature_max": 70.0,
            "pressure_min": 3.5,
            "acoustic_emission_max": 68.0,
            "power_draw_max": 14.0
        },
        "downtime_cost_per_hour": 3500.0,
        "primary_fault_risks": ["Joint Gearbox Wear", "Spindle Misalignment", "Motor Overheating"]
    }
}

# Supported Fault Modes and Diagnostic Rules
FAULT_MODES = {
    "NORMAL": "Normal Operation",
    "BEARING_FATIGUE": "Bearing Inner/Outer Race Fatigue",
    "HYDRAULIC_LEAK": "Hydraulic Fluid Leak / Cavitation",
    "MOTOR_OVERHEATING": "Motor Winding Insulation Overheating",
    "TOOL_DEGRADATION": "Mechanical Tool Wear / Dull Cutter",
    "SPINDLE_MISALIGNMENT": "Shaft & Spindle Misalignment"
}

# Machine Health Index Categories
HEALTH_LEVELS = {
    "EXCELLENT": (85, 100),
    "GOOD": (70, 84),
    "WARNING": (40, 69),
    "CRITICAL": (0, 39)
}
