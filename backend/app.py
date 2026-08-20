"""
FastAPI Application & REST Backend for AI Predictive Maintenance Platform.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import time

from data.generator import IndustrialDataGenerator
from models.trainer import get_or_train_bundle
from agents.orchestrator import FleetOrchestrator
from config import MACHINE_PROFILES, FAULT_MODES, HEALTH_LEVELS

app = FastAPI(
    title="AI Predictive Maintenance API",
    description="Multi-Agent Predictive Maintenance System for Manufacturing Telemetry, Diagnostics & RUL",
    version="2.0.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State Container
class SystemCore:
    def __init__(self):
        self.bundle = get_or_train_bundle()
        self.orchestrator = FleetOrchestrator(model_bundle=self.bundle)
        self.generator = IndustrialDataGenerator(seed=42)
        self.history_logs: Dict[str, List[Dict[str, Any]]] = {
            m_id: [] for m_id in MACHINE_PROFILES.keys()
        }
        self.sim_step = 0
        
        # Populate initial baseline data (10 steps per machine)
        self._initialize_baseline_history()

    def _initialize_baseline_history(self):
        for step in range(1, 11):
            self.sim_step += 1
            for m_id in MACHINE_PROFILES.keys():
                frame = self.generator.generate_single_reading(
                    machine_id=m_id,
                    timestamp_idx=self.sim_step,
                    fault_mode="NORMAL",
                    degradation_severity=0.0
                )
                self.orchestrator.process_telemetry_frame(frame)
                self.history_logs[m_id].append(frame)

core = SystemCore()

# Pydantic Schemas
class TelemetryInjectRequest(BaseModel):
    machine_id: str
    fault_mode: str
    degradation_severity: float = Field(default=0.6, ge=0.0, le=1.0)
    steps: int = Field(default=1, ge=1, le=20)

class ChatRequest(BaseModel):
    message: str

# API Endpoints
@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI Predictive Maintenance Backend",
        "version": "2.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/config")
def get_config():
    return {
        "machine_profiles": MACHINE_PROFILES,
        "fault_modes": FAULT_MODES,
        "health_levels": HEALTH_LEVELS
    }

@app.get("/api/fleet")
def get_fleet_status():
    fleet_state = core.orchestrator.fleet_state
    work_orders = core.orchestrator.work_orders

    machines_list = []
    for m_id, state in fleet_state.items():
        machines_list.append({
            "machine_id": m_id,
            "type": state.get("type", "Unknown"),
            "location": state.get("location", "Plant Floor"),
            "health_index": round(state.get("health_index", 100.0), 1),
            "health_status": state.get("health_status", "Healthy"),
            "predicted_rul_hours": round(state.get("predicted_rul_hours", 1000.0), 1),
            "diagnosed_fault": state.get("diagnosed_fault", "NORMAL"),
            "confidence": round(state.get("confidence", 1.0) * 100, 1),
            "recommendation": state.get("recommendation", "Normal Operation"),
            "last_telemetry": state.get("last_telemetry", {})
        })

    total_machines = len(fleet_state)
    critical_count = sum(1 for m in machines_list if m["health_index"] < 40)
    warning_count = sum(1 for m in machines_list if 40 <= m["health_index"] < 70)
    healthy_count = sum(1 for m in machines_list if m["health_index"] >= 70)
    total_savings = sum(wo.get("financial_impact", {}).get("net_financial_savings", 0) for wo in work_orders)

    return {
        "summary": {
            "total_machines": total_machines,
            "healthy_count": healthy_count,
            "warning_count": warning_count,
            "critical_count": critical_count,
            "total_work_orders": len(work_orders),
            "total_savings_usd": round(total_savings, 2)
        },
        "machines": machines_list
    }

@app.get("/api/machine/{machine_id}/history")
def get_machine_history(machine_id: str):
    target_id = machine_id if machine_id in core.history_logs else list(MACHINE_PROFILES.keys())[0]
    return {
        "machine_id": target_id,
        "history": core.history_logs.get(target_id, [])
    }

@app.post("/api/telemetry/inject")
def inject_telemetry(req: TelemetryInjectRequest):
    if req.machine_id not in MACHINE_PROFILES:
        req.machine_id = list(MACHINE_PROFILES.keys())[0]
    if req.fault_mode not in FAULT_MODES:
        raise HTTPException(status_code=400, detail=f"Invalid fault_mode: {req.fault_mode}")

    outputs = []
    for _ in range(req.steps):
        core.sim_step += 1
        frame = core.generator.generate_single_reading(
            machine_id=req.machine_id,
            timestamp_idx=core.sim_step,
            fault_mode=req.fault_mode,
            degradation_severity=req.degradation_severity if req.fault_mode != "NORMAL" else 0.0
        )
        output = core.orchestrator.process_telemetry_frame(frame)
        core.history_logs[req.machine_id].append(frame)
        if len(core.history_logs[req.machine_id]) > 60:
            core.history_logs[req.machine_id].pop(0)
        outputs.append(output)

    return {
        "message": f"Successfully injected {req.steps} telemetry step(s) for {req.machine_id}",
        "latest_output": outputs[-1] if outputs else None,
        "fleet": get_fleet_status()
    }

@app.get("/api/work-orders")
def get_work_orders():
    return {
        "work_orders": core.orchestrator.work_orders
    }

@app.post("/api/chat")
def chat_with_assistant(req: ChatRequest):
    response_text = core.orchestrator.query_assistant(req.message)
    return {
        "response": response_text
    }

@app.post("/api/reset")
def reset_simulation():
    core.orchestrator.reset_fleet()
    core.sim_step = 0
    core.history_logs = {m_id: [] for m_id in MACHINE_PROFILES.keys()}
    core._initialize_baseline_history()
    return {"message": "Simulation and fleet state reset successfully."}
