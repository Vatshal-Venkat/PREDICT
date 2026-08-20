"""
Physics-Informed Industrial Telemetry Simulator & Fault Injector.
Simulates realistic multi-sensor telemetry for manufacturing equipment.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from config import MACHINE_PROFILES, FAULT_MODES


class IndustrialDataGenerator:
    """Generates synthetic telemetry streams and historical run-to-failure datasets."""

    def __init__(self, seed: int = 42):
        self.rng = np.random.default_rng(seed)

    def generate_single_reading(
        self,
        machine_id: str,
        timestamp_idx: int,
        fault_mode: str = "NORMAL",
        degradation_severity: float = 0.0
    ) -> Dict[str, Any]:
        """
        Generates a single telemetry frame for a given machine profile.
        
        :param machine_id: Identifier of the machine profile in MACHINE_PROFILES
        :param timestamp_idx: Operating step/hour count
        :param fault_mode: Type of fault active (from FAULT_MODES)
        :param degradation_severity: Progression scale from 0.0 (healthy) to 1.0 (imminent failure)
        """
        profile = MACHINE_PROFILES.get(machine_id, MACHINE_PROFILES["CNC-MILL-01"])
        baseline = profile["baseline"]

        # Gaussian sensor noise standard deviations
        vib_noise = 0.03
        temp_noise = 0.5
        press_noise = 0.1
        ae_noise = 0.8
        pwr_noise = 0.4
        rpm_noise = 5.0

        # Baseline reading + natural operating noise
        vibration_rms = max(0.1, baseline["vibration_rms"] + self.rng.normal(0, vib_noise))
        vibration_kurtosis = max(1.5, baseline["vibration_kurtosis"] + self.rng.normal(0, 0.1))
        temperature = baseline["temperature"] + self.rng.normal(0, temp_noise)
        pressure = max(0.5, baseline["pressure"] + self.rng.normal(0, press_noise))
        acoustic_emission = baseline["acoustic_emission"] + self.rng.normal(0, ae_noise)
        power_draw = max(1.0, baseline["power_draw"] + self.rng.normal(0, pwr_noise))
        rpm = baseline["rpm"] + self.rng.normal(0, rpm_noise)

        # Apply Physics-informed Fault Degradation Effects
        severity = min(max(degradation_severity, 0.0), 1.0)

        if fault_mode == "BEARING_FATIGUE":
            # Vibration RMS & Kurtosis increase exponentially, temperature rises
            vibration_rms += 2.5 * (severity ** 1.8)
            vibration_kurtosis += 4.5 * (severity ** 1.5)
            temperature += 25.0 * (severity ** 1.2)
            acoustic_emission += 20.0 * severity

        elif fault_mode == "HYDRAULIC_LEAK":
            # Pressure drops sharply, acoustic noise increases, mild temperature increase
            pressure -= (baseline["pressure"] * 0.45) * (severity ** 1.2)
            acoustic_emission += 30.0 * (severity ** 1.5)
            temperature += 15.0 * severity
            power_draw += 8.0 * severity

        elif fault_mode == "MOTOR_OVERHEATING":
            # Rapid temperature rise, increased current/power draw
            temperature += 45.0 * (severity ** 1.3)
            power_draw += (baseline["power_draw"] * 0.5) * severity
            vibration_rms += 0.8 * severity

        elif fault_mode == "TOOL_DEGRADATION":
            # Increased active cutting power, higher acoustic emissions, moderate vibration
            power_draw += (baseline["power_draw"] * 0.4) * (severity ** 1.4)
            acoustic_emission += 25.0 * severity
            vibration_rms += 1.2 * severity

        elif fault_mode == "SPINDLE_MISALIGNMENT":
            # Harmonic vibration, RPM instability, moderate heating
            vibration_rms += 1.8 * (severity ** 1.3)
            vibration_kurtosis += 2.5 * severity
            rpm += self.rng.normal(0, 45.0 * severity)
            temperature += 18.0 * severity

        return {
            "timestamp_idx": timestamp_idx,
            "machine_id": machine_id,
            "machine_name": profile["name"],
            "machine_type": profile["type"],
            "vibration_rms": round(float(vibration_rms), 4),
            "vibration_kurtosis": round(float(vibration_kurtosis), 4),
            "temperature": round(float(temperature), 2),
            "pressure": round(float(pressure), 2),
            "acoustic_emission": round(float(acoustic_emission), 2),
            "power_draw": round(float(power_draw), 2),
            "rpm": round(float(rpm), 2),
            "fault_mode": fault_mode,
            "degradation_severity": round(float(severity), 4)
        }

    def generate_run_to_failure_trajectory(
        self,
        machine_id: str,
        total_steps: int = 250,
        fault_mode: str = "BEARING_FATIGUE",
        healthy_ratio: float = 0.5
    ) -> pd.DataFrame:
        """
        Generates a complete run-to-failure lifecycle trajectory for a machine.
        Useful for training RUL regression and fault classification models.
        """
        records = []
        healthy_steps = int(total_steps * healthy_ratio)
        degrading_steps = total_steps - healthy_steps

        for step in range(total_steps):
            if step < healthy_steps:
                mode = "NORMAL"
                severity = 0.0
            else:
                mode = fault_mode
                # Progressive exponential degradation profile
                progress = (step - healthy_steps) / degrading_steps
                severity = float(progress ** 1.5)

            # Remaining Useful Life (RUL) in operational cycles/hours
            rul = max(0, total_steps - 1 - step)

            reading = self.generate_single_reading(
                machine_id=machine_id,
                timestamp_idx=step,
                fault_mode=mode,
                degradation_severity=severity
            )
            reading["RUL"] = rul
            records.append(reading)

        return pd.DataFrame(records)

    def generate_fleet_training_dataset(
        self,
        samples_per_fault: int = 5
    ) -> pd.DataFrame:
        """
        Generates a comprehensive multi-machine, multi-fault historical fleet dataset.
        """
        all_trajectories = []
        machine_ids = list(MACHINE_PROFILES.keys())
        fault_list = [m for m in FAULT_MODES.keys() if m != "NORMAL"]

        for machine_id in machine_ids:
            for fault_mode in fault_list:
                for idx in range(samples_per_fault):
                    total_steps = self.rng.integers(180, 320)
                    healthy_ratio = self.rng.uniform(0.4, 0.6)

                    df_traj = self.generate_run_to_failure_trajectory(
                        machine_id=machine_id,
                        total_steps=total_steps,
                        fault_mode=fault_mode,
                        healthy_ratio=healthy_ratio
                    )
                    df_traj["run_id"] = f"{machine_id}_{fault_mode}_{idx}"
                    all_trajectories.append(df_traj)

        fleet_df = pd.concat(all_trajectories, ignore_index=True)
        return fleet_df
