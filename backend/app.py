"""
FastAPI Application & REST/WebSocket Backend for AI Predictive Maintenance Platform.
Features: Telemetry, Diagnostics, RUL, WebSockets, FFT/SHAP XAI, Multimodal Inspection, CMMS Export, OEE & Persistence.
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import asyncio
import json
import time

from data.generator import IndustrialDataGenerator
from data.mqtt_adapter import MQTTTelemetryAdapter
from models.trainer import get_or_train_bundle
from models.fft_analyzer import compute_fft_spectrum
from models.explainability import calculate_shap_contributions
from models.multimodal import analyze_visual_part_image, analyze_acoustic_audio
from models.inventory import get_inventory_status, auto_requisition_part
from models.cmms_exporter import export_to_sap_pm_schema, export_to_maximo_schema
from models.oee import calculate_machine_oee, calculate_fleet_oee_summary
from services.alerting import dispatch_alert_event, get_recent_alerts
from database import init_db, SessionLocal, MachineRecord, WorkOrderRecord, TelemetryLogRecord, datetime
from auth import create_mock_jwt_token, verify_role_permission, ROLES
from agents.orchestrator import FleetOrchestrator
from config import MACHINE_PROFILES, FAULT_MODES, HEALTH_LEVELS

# Initialize SQLite Database
init_db()

app = FastAPI(
    title="Enterprise AI Predictive Maintenance API",
    description="Multi-Agent Predictive Maintenance System with WebSockets, FFT, SHAP XAI, Multimodal & CMMS Integration",
    version="2.5.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket Connections Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

ws_manager = ConnectionManager()
mqtt_adapter = MQTTTelemetryAdapter()

# Global Core Container
class SystemCore:
    def __init__(self):
        self.bundle = get_or_train_bundle()
        self.orchestrator = FleetOrchestrator(model_bundle=self.bundle)
        self.generator = IndustrialDataGenerator(seed=42)
        self.history_logs: Dict[str, List[Dict[str, Any]]] = {
            m_id: [] for m_id in MACHINE_PROFILES.keys()
        }
        self.sim_step = 0
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

# Pydantic Request Schemas
class TelemetryInjectRequest(BaseModel):
    machine_id: str
    fault_mode: str
    degradation_severity: float = Field(default=0.6, ge=0.0, le=1.0)
    steps: int = Field(default=1, ge=1, le=20)

class ChatRequest(BaseModel):
    message: str

class LoginRequest(BaseModel):
    username: str
    password: str
    role: str = "Engineer"

class RequisitionRequest(BaseModel):
    part_number: str
    quantity: int = 10

class MultimodalRequest(BaseModel):
    inspection_type: str = "visual" # "visual" or "acoustic"
    sample_id: str = "sample_bearing_scan"

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Enterprise AI Predictive Maintenance Platform API",
        "version": "2.5.0",
        "ws_streaming": "/ws/telemetry",
        "docs_url": "/docs"
    }

@app.get("/api/config")
def get_config():
    return {
        "machine_profiles": MACHINE_PROFILES,
        "fault_modes": FAULT_MODES,
        "health_levels": HEALTH_LEVELS,
        "roles": ROLES
    }

@app.get("/api/fleet")
def get_fleet_status():
    fleet_state = core.orchestrator.fleet_state
    work_orders = core.orchestrator.work_orders

    machines_list = []
    for m_id, state in fleet_state.items():
        h_idx = round(state.get("health_index", 100.0), 1)
        
        # Derive consistent health status category
        if h_idx < 40.0:
            h_status = "Critical"
        elif h_idx < 70.0:
            h_status = "Degraded / Warning"
        else:
            h_status = "Healthy"

        # Derive consistent RUL hours
        rul = state.get("predicted_rul_hours", state.get("estimated_rul_hours", 1000.0))
        if h_idx < 80.0 and (rul >= 1000.0 or rul > h_idx * 10):
            rul = round(max(5.0, (h_idx / 100.0) * 500.0), 1)

        # Derive diagnosed fault name
        fault_name = state.get("diagnosed_fault", state.get("fault_code", state.get("active_fault", "NORMAL")))
        if fault_name == "NORMAL" and h_idx < 70.0:
            fault_name = state.get("active_fault", "DEGRADED_OPERATION")

        recommendation = state.get("recommendation", "Nominal Operation" if h_idx >= 70 else f"Action Required: Repair {fault_name}")
        oee_data = calculate_machine_oee(h_idx, fault_name)

        machines_list.append({
            "machine_id": m_id,
            "type": state.get("type", MACHINE_PROFILES.get(m_id, {}).get("type", "Unknown")),
            "location": state.get("location", MACHINE_PROFILES.get(m_id, {}).get("location", "Plant Floor")),
            "health_index": h_idx,
            "health_status": h_status,
            "predicted_rul_hours": round(rul, 1),
            "diagnosed_fault": fault_name,
            "confidence": round(state.get("confidence", 0.95 if h_idx < 70 else 1.0) * 100, 1),
            "recommendation": recommendation,
            "last_telemetry": state.get("telemetry", state.get("last_telemetry", {})),
            "oee": oee_data
        })

    total_machines = len(fleet_state)
    critical_count = sum(1 for m in machines_list if m["health_index"] < 40)
    warning_count = sum(1 for m in machines_list if 40 <= m["health_index"] < 70)
    healthy_count = sum(1 for m in machines_list if m["health_index"] >= 70)
    total_savings = sum(wo.get("financial_impact", {}).get("net_financial_savings", 0) for wo in work_orders)
    fleet_oee = calculate_fleet_oee_summary(machines_list)

    return {
        "summary": {
            "total_machines": total_machines,
            "healthy_count": healthy_count,
            "warning_count": warning_count,
            "critical_count": critical_count,
            "total_work_orders": len(work_orders),
            "total_savings_usd": round(total_savings, 2),
            "fleet_oee": fleet_oee
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

        # Broadcast over MQTT simulation adapter
        mqtt_adapter.publish_frame(req.machine_id, frame)
        outputs.append(output)

        # Trigger automatic emergency webhook if critical
        if output.get("prognosis", {}).get("health_index", 100.0) < 40.0:
            dispatch_alert_event(
                machine_id=req.machine_id,
                severity="CRITICAL",
                message=f"Critical Health Alert: {req.machine_id} diagnosed with {req.fault_mode}. RUL < 100 hours!"
            )

    return {
        "message": f"Successfully injected {req.steps} telemetry step(s) for {req.machine_id}",
        "latest_output": outputs[-1] if outputs else None,
        "fleet": get_fleet_status()
    }

@app.get("/api/signal/xai/{machine_id}")
def get_signal_and_xai(machine_id: str):
    target_id = machine_id if machine_id in core.history_logs else list(MACHINE_PROFILES.keys())[0]
    history = core.history_logs.get(target_id, [])
    vib_history = [f.get("vibration_rms", 1.0) for f in history]
    last_frame = history[-1] if history else {}
    machine_state = core.orchestrator.fleet_state.get(target_id, {})
    health_index = machine_state.get("health_index", 100.0)

    fft_result = compute_fft_spectrum(vib_history)
    shap_result = calculate_shap_contributions(last_frame, health_index)

    return {
        "machine_id": target_id,
        "fft_spectrum": fft_result,
        "shap_contributions": shap_result
    }

@app.post("/api/multimodal/inspect")
def inspect_multimodal(req: MultimodalRequest):
    if req.inspection_type == "visual":
        result = analyze_visual_part_image(req.sample_id)
    else:
        result = analyze_acoustic_audio(req.sample_id)
    return {"inspection_type": req.inspection_type, "result": result}

@app.get("/api/inventory")
def get_inventory():
    return {"inventory": get_inventory_status()}

@app.post("/api/inventory/requisition")
def process_requisition(req: RequisitionRequest):
    return auto_requisition_part(req.part_number, req.quantity)

@app.get("/api/work-orders")
def get_work_orders():
    return {"work_orders": core.orchestrator.work_orders}

@app.get("/api/cmms/export/{work_order_id}")
def export_cmms(work_order_id: str):
    target_wo = None
    for wo in core.orchestrator.work_orders:
        if wo.get("work_order_id") == work_order_id:
            target_wo = wo
            break
    if not target_wo and core.orchestrator.work_orders:
        target_wo = core.orchestrator.work_orders[0]

    if not target_wo:
        raise HTTPException(status_code=404, detail="No active work orders to export.")

    sap_payload = export_to_sap_pm_schema(target_wo)
    maximo_payload = export_to_maximo_schema(target_wo)

    return {
        "work_order_id": work_order_id,
        "sap_pm": sap_payload,
        "ibm_maximo": maximo_payload
    }

@app.get("/api/alerts")
def get_alerts():
    return {"alerts": get_recent_alerts(15)}

@app.post("/api/auth/login")
def login(req: LoginRequest):
    token = create_mock_jwt_token(req.username, req.role)
    role_info = ROLES.get(req.role, ROLES["Engineer"])
    return {
        "token": token,
        "username": req.username,
        "role": req.role,
        "permissions": role_info["permissions"],
        "description": role_info["description"]
    }

@app.post("/api/chat")
def chat_with_assistant(req: ChatRequest):
    response_text = core.orchestrator.query_assistant(req.message)
    return {"response": response_text}

@app.post("/api/reset")
def reset_simulation():
    core.orchestrator.reset_fleet()
    core.sim_step = 0
    core.history_logs = {m_id: [] for m_id in MACHINE_PROFILES.keys()}
    core._initialize_baseline_history()
    return {"message": "Simulation and fleet state reset successfully."}

# WebSocket Endpoint for Real-Time Telemetry Ticker
@app.websocket("/ws/telemetry")
async def websocket_telemetry_stream(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            core.sim_step += 1
            sample_m_id = list(MACHINE_PROFILES.keys())[core.sim_step % len(MACHINE_PROFILES)]
            frame = core.generator.generate_single_reading(
                machine_id=sample_m_id,
                timestamp_idx=core.sim_step,
                fault_mode="NORMAL",
                degradation_severity=0.0
            )
            output = core.orchestrator.process_telemetry_frame(frame)
            core.history_logs[sample_m_id].append(frame)
            if len(core.history_logs[sample_m_id]) > 60:
                core.history_logs[sample_m_id].pop(0)

            ws_payload = {
                "type": "telemetry_update",
                "machine_id": sample_m_id,
                "timestamp_idx": core.sim_step,
                "frame": frame,
                "fleet_summary": get_fleet_status()["summary"]
            }
            await websocket.send_json(ws_payload)
            await asyncio.sleep(2.0)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)
