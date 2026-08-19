"""
Main Command-Line Interface (CLI) for Predictive Maintenance AI Agent System.
"""

import sys
import argparse
import time
from data.generator import IndustrialDataGenerator
from models.trainer import train_all_models, get_or_train_bundle
from agents.orchestrator import FleetOrchestrator
from config import MACHINE_PROFILES, FAULT_MODES


def run_training():
    print("[START] Starting Model Training Pipeline...")
    bundle = train_all_models(samples_per_fault=5, save_bundle=True)
    print("[SUCCESS] All Machine Learning Models Successfully Trained & Bundled!")


def run_simulation(steps: int = 30, fault_machine: str = "CNC-MILL-01", fault_mode: str = "BEARING_FATIGUE"):
    print("\n=======================================================")
    print(" STARTING LIVE MULTI-AGENT TELEMETRY SIMULATION")
    print(f" Target Machine: {fault_machine} | Injected Fault: {fault_mode}")
    print("=======================================================\n")

    bundle = get_or_train_bundle()
    orchestrator = FleetOrchestrator(model_bundle=bundle)
    generator = IndustrialDataGenerator()

    for step in range(steps):
        # Apply fault degradation in the second half of simulation
        if step >= (steps // 2):
            progress = (step - (steps // 2)) / (steps // 2)
            current_fault = fault_mode
            severity = float(progress ** 1.3)
        else:
            current_fault = "NORMAL"
            severity = 0.0

        frame = generator.generate_single_reading(
            machine_id=fault_machine,
            timestamp_idx=step,
            fault_mode=current_fault,
            degradation_severity=severity
        )

        res = orchestrator.process_telemetry_frame(frame)
        status = res["status"]

        if status == "ANOMALY_PROCESSED":
            diag = res["diagnosis"]
            prog = res["prognosis"]
            wo = res["work_order"]
            print(f"[ALERT] [Step {step:02d}] ANOMALY DETECTED on {fault_machine}!")
            print(f"   |-- Diagnosis: {diag['fault_description']} (Confidence: {diag['confidence']}%)")
            print(f"   |-- Prognosis: Health Index: {prog['health_index']}% | Est. RUL: {prog['estimated_rul_hours']} hrs")
            print(f"   +-- Action Ticket: {wo['work_order_id']} [{wo['priority']}] -> {wo['action_title']}\n")
        else:
            print(f"[OK] [Step {step:02d}] {fault_machine} operating normally (Temp: {frame['temperature']} deg C, Vib: {frame['vibration_rms']} mm/s)")

        time.sleep(0.05)

    print("\n-------------------------------------------------------")
    print(" Querying Operational AI Chatbot for Final Status...")
    print("-------------------------------------------------------")
    reply = orchestrator.query_assistant("Show me status for CNC Machine #1")
    print(reply)


def run_interactive_chat():
    print("[CHAT] Launching Interactive AI Maintenance Assistant...")
    bundle = get_or_train_bundle()
    orchestrator = FleetOrchestrator(model_bundle=bundle)

    print("Type your questions below (or 'exit' to quit):\n")
    while True:
        try:
            q = input("User > ")
            if q.strip().lower() in ["exit", "quit", "q"]:
                break
            ans = orchestrator.query_assistant(q)
            print(f"\nAI Agent > {ans}\n")
        except KeyboardInterrupt:
            break


def main():
    parser = argparse.ArgumentParser(description="Predictive Maintenance AI Agent System CLI")
    parser.add_argument("--train", action="store_true", help="Train predictive ML models")
    parser.add_argument("--simulate", action="store_true", help="Run terminal telemetry simulation")
    parser.add_argument("--query", action="store_true", help="Interactive terminal query assistant")
    parser.add_argument("--machine", type=str, default="CNC-MILL-01", help="Machine ID for simulation")
    parser.add_argument("--fault", type=str, default="BEARING_FATIGUE", help="Fault mode to inject")

    args = parser.parse_args()

    if args.train:
        run_training()
    elif args.simulate:
        run_simulation(steps=25, fault_machine=args.machine, fault_mode=args.fault)
    elif args.query:
        run_interactive_chat()
    else:
        # Default behavior: run quick simulation
        print("No flag specified. Defaulting to live simulation...")
        run_simulation(steps=25, fault_machine=args.machine, fault_mode=args.fault)


if __name__ == "__main__":
    main()
