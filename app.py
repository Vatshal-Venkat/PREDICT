"""
Streamlit Web Application & Interactive Industrial Dashboard for Predictive Maintenance AI Agent System.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import time
from datetime import datetime

from data.generator import IndustrialDataGenerator
from models.trainer import get_or_train_bundle
from agents.orchestrator import FleetOrchestrator
from config import MACHINE_PROFILES, FAULT_MODES, HEALTH_LEVELS

# Streamlit Page Setup
st.set_page_config(
    page_title="AI Predictive Maintenance Platform",
    page_icon="🏭",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS Styling
st.markdown("""
<style>
    .main-header { font-size: 2.2rem; font-weight: 700; color: #1E293B; margin-bottom: 0.2rem; }
    .sub-header { font-size: 1.0rem; color: #64748B; margin-bottom: 1.5rem; }
    .card { background-color: #F8FAFC; border-radius: 8px; padding: 1.2rem; border: 1px solid #E2E8F0; margin-bottom: 1rem; }
    .metric-value { font-size: 1.8rem; font-weight: 700; color: #0F172A; }
    .metric-label { font-size: 0.85rem; color: #64748B; text-transform: uppercase; font-weight: 600; }
    .status-healthy { color: #166534; background-color: #DCFCE7; padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 0.85rem; }
    .status-warning { color: #854D0E; background-color: #FEF9C3; padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 0.85rem; }
    .status-critical { color: #991B1B; background-color: #FEE2E2; padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 0.85rem; }
</style>
""", unsafe_allow_html=True)


# Initialize Session State Orchestrator & Generator
@st.cache_resource
def load_system_core():
    bundle = get_or_train_bundle()
    orchestrator = FleetOrchestrator(model_bundle=bundle)
    generator = IndustrialDataGenerator(seed=42)
    return orchestrator, generator


orchestrator, generator = load_system_core()

if "history_logs" not in st.session_state:
    st.session_state.history_logs = {m_id: [] for m_id in MACHINE_PROFILES.keys()}

if "sim_step" not in st.session_state:
    st.session_state.sim_step = 0

if "chat_messages" not in st.session_state:
    st.session_state.chat_messages = [
        {"role": "assistant", "content": "Hello! I am your AI Maintenance Assistant. Ask me anything about plant fleet health, active anomalies, or work orders."}
    ]


# Header Banner
st.markdown("<div class='main-header'>🏭 Advanced Predictive Maintenance AI Agent Platform</div>", unsafe_allow_html=True)
st.markdown("<div class='sub-header'>Real-Time Telemetry Ingestion • Multi-Agent Fault Diagnostics • RUL Forecasting • Prescriptive Work Orders</div>", unsafe_allow_html=True)

# Sidebar Controls & Fault Injector
with st.sidebar:
    st.image("https://img.icons8.com/color/96/factory.png", width=70)
    st.header("⚙️ Simulation Sandbox")
    
    selected_machine = st.selectbox(
        "Target Machine",
        options=list(MACHINE_PROFILES.keys()),
        format_func=lambda x: f"{x} - {MACHINE_PROFILES[x]['type']}"
    )

    selected_fault = st.selectbox(
        "Fault Mode to Inject",
        options=list(FAULT_MODES.keys()),
        format_func=lambda x: f"{x} ({FAULT_MODES[x]})"
    )

    degradation_severity = st.slider(
        "Fault Degradation Severity",
        min_value=0.0,
        max_value=1.0,
        value=0.6,
        step=0.1,
        help="0.0 = Healthy baseline, 1.0 = Imminent failure breakdown"
    )

    col_btn1, col_btn2 = st.columns(2)
    with col_btn1:
        run_single = st.button("⚡ Inject Telemetry", type="primary", use_container_width=True)
    with col_btn2:
        auto_run = st.button("▶ Auto Stream (5x)", use_container_width=True)

    st.divider()
    st.markdown("### 🤖 Active AI Agents")
    st.markdown("• `TelemetryAgent`: Sensor Ingestion")
    st.markdown("• `DiagnosticAgent`: Root Cause Isolation")
    st.markdown("• `PrognosticAgent`: RUL Regression")
    st.markdown("• `PrescriptiveAgent`: Work Order Dispatch")
    st.markdown("• `LLMAssistant`: Operational Chat")


# Execute Simulation Step Trigger
def execute_telemetry_step(m_id: str, fault: str, severity: float):
    st.session_state.sim_step += 1
    step_idx = st.session_state.sim_step

    frame = generator.generate_single_reading(
        machine_id=m_id,
        timestamp_idx=step_idx,
        fault_mode=fault,
        degradation_severity=severity if fault != "NORMAL" else 0.0
    )

    output = orchestrator.process_telemetry_frame(frame)
    st.session_state.history_logs[m_id].append(frame)

    if len(st.session_state.history_logs[m_id]) > 60:
        st.session_state.history_logs[m_id].pop(0)

    return output


if run_single:
    execute_telemetry_step(selected_machine, selected_fault, degradation_severity)

if auto_run:
    for _ in range(5):
        execute_telemetry_step(selected_machine, selected_fault, degradation_severity)
        time.sleep(0.1)


# Compute Fleet Summary Metrics
fleet_state = orchestrator.fleet_state
work_orders = orchestrator.work_orders

total_machines = len(fleet_state)
critical_count = sum(1 for m in fleet_state.values() if m["health_index"] < 40)
warning_count = sum(1 for m in fleet_state.values() if 40 <= m["health_index"] < 70)
healthy_count = sum(1 for m in fleet_state.values() if m["health_index"] >= 70)
total_savings = sum(wo.get("financial_impact", {}).get("net_financial_savings", 0) for wo in work_orders)

# Fleet Metric KPI Cards
kpi1, kpi2, kpi3, kpi4, kpi5 = st.columns(5)
kpi1.metric("Monitored Equipment", f"{total_machines} Units")
kpi2.metric("Healthy Status", f"{healthy_count} Units", delta="Optimal", delta_color="normal")
kpi3.metric("Warning Stage", f"{warning_count} Units", delta="-Attention" if warning_count > 0 else "0", delta_color="inverse")
kpi4.metric("Critical Alerts", f"{critical_count} Units", delta="-Critical" if critical_count > 0 else "0", delta_color="inverse")
kpi5.metric("Net Risk Savings", f"${total_savings:,.0f}", delta="Cost Protection")

st.divider()

# Main Tabs Layout
tab_overview, tab_diagnostics, tab_work_orders, tab_chat = st.tabs([
    "📊 Fleet Telemetry & Metrics",
    "🔬 AI Diagnostics & RUL",
    "📋 Prescriptive Work Orders",
    "💬 Operational AI Assistant"
])


# TAB 1: FLEET TELEMETRY & METRICS
with tab_overview:
    col_fleet_left, col_fleet_right = st.columns([1, 2])

    with col_fleet_left:
        st.subheader("🖥️ Machine Status Fleet Grid")
        for m_id, state in fleet_state.items():
            hi = state["health_index"]
            cat = state["health_category"]
            rul = state["estimated_rul_hours"]
            fault = state["fault_code"]
            
            if hi >= 70:
                badge = f"<span class='status-healthy'>HEALTHY ({hi}%)</span>"
            elif hi >= 40:
                badge = f"<span class='status-warning'>WARNING ({hi}%)</span>"
            else:
                badge = f"<span class='status-critical'>CRITICAL ({hi}%)</span>"

            st.markdown(f"""
            <div class='card'>
                <div style='display: flex; justify-content: space-between; align-items: center;'>
                    <strong>{state['machine_name']}</strong>
                    {badge}
                </div>
                <div style='font-size: 0.85rem; color: #475569; margin-top: 6px;'>
                    • Type: {MACHINE_PROFILES[m_id]['type']}<br>
                    • Est. RUL: <strong>{rul} hrs</strong> | Fault: <em>{FAULT_MODES.get(fault, fault)}</em>
                </div>
            </div>
            """, unsafe_allow_html=True)

    with col_fleet_right:
        st.subheader(f"📈 Real-Time Telemetry Stream for {selected_machine}")
        logs = st.session_state.history_logs[selected_machine]

        if logs:
            df_logs = pd.DataFrame(logs)
            
            fig_vib = px.line(
                df_logs, x="timestamp_idx", y=["vibration_rms", "vibration_kurtosis"],
                title="Vibration Profile (RMS mm/s & Kurtosis)",
                labels={"timestamp_idx": "Operating Cycle / Step", "value": "Magnitude"},
                color_discrete_sequence=["#0284C7", "#E11D48"]
            )
            fig_vib.update_layout(height=220, margin=dict(l=20, r=20, t=40, b=20))
            st.plotly_chart(fig_vib, use_container_width=True)

            fig_temp_press = px.line(
                df_logs, x="timestamp_idx", y=["temperature", "pressure", "power_draw"],
                title="Thermal (°C), Pressure (bar), & Power (kW) Telemetry",
                labels={"timestamp_idx": "Operating Cycle / Step", "value": "Sensor Value"},
                color_discrete_sequence=["#D97706", "#059669", "#7C3AED"]
            )
            fig_temp_press.update_layout(height=220, margin=dict(l=20, r=20, t=40, b=20))
            st.plotly_chart(fig_temp_press, use_container_width=True)

        else:
            st.info("No telemetry history recorded yet. Click 'Inject Telemetry' in the sidebar to stream sensor data.")


# TAB 2: DIAGNOSTICS & RUL
with tab_diagnostics:
    st.subheader(f"🔬 Deep-Dive Diagnostic & Prognostic Analysis: {selected_machine}")
    
    current_state = fleet_state[selected_machine]
    latest_telemetry = current_state.get("telemetry", {})

    col_diag1, col_diag2 = st.columns([1, 1])

    with col_diag1:
        st.markdown("### 🎯 Fault Mode Probability Distribution")
        
        # Run classifier on current telemetry
        df_single = pd.DataFrame([latest_telemetry])
        X_feat, _, _ = orchestrator.bundle.feature_engineer.prepare_model_matrices(df_single)
        top_fault, top_conf, prob_dist = orchestrator.bundle.fault_classifier.predict_fault(X_feat)

        if prob_dist:
            df_probs = pd.DataFrame([
                {"Fault Mode": FAULT_MODES.get(k, k), "Probability": v * 100.0}
                for k, v in prob_dist.items()
            ]).sort_values(by="Probability", ascending=True)

            fig_bar = px.bar(
                df_probs, x="Probability", y="Fault Mode", orientation="h",
                title="AI Fault Classification Confidence (%)",
                color="Probability", color_continuous_scale="Reds",
                range_x=[0, 100]
            )
            fig_bar.update_layout(height=300, margin=dict(l=20, r=20, t=40, b=20))
            st.plotly_chart(fig_bar, use_container_width=True)

    with col_diag2:
        st.markdown("### ⏱️ Remaining Useful Life (RUL) & Health Index")
        hi = current_state["health_index"]
        rul = current_state["estimated_rul_hours"]

        fig_gauge = go.Figure(go.Indicator(
            mode="gauge+number",
            value=hi,
            title={'text': "Equipment Health Index (%)"},
            gauge={
                'axis': {'range': [0, 100]},
                'bar': {'color': "#0F172A"},
                'steps': [
                    {'range': [0, 40], 'color': "#FEE2E2"},
                    {'range': [40, 70], 'color': "#FEF9C3"},
                    {'range': [70, 100], 'color': "#DCFCE7"}
                ],
                'threshold': {
                    'line': {'color': "red", 'width': 4},
                    'thickness': 0.75,
                    'value': 40
                }
            }
        ))
        fig_gauge.update_layout(height=260, margin=dict(l=20, r=20, t=30, b=20))
        st.plotly_chart(fig_gauge, use_container_width=True)

        st.markdown(f"**Forecasted Remaining Useful Life**: `{rul} Operational Hours`")


# TAB 3: PRESCRIPTIVE WORK ORDERS
with tab_work_orders:
    st.subheader("📋 Automated Prescriptive Maintenance Work Orders")
    
    if work_orders:
        for wo in work_orders:
            priority_color = {
                "CRITICAL": "#991B1B",
                "HIGH": "#C2410C",
                "MEDIUM": "#D97706",
                "LOW": "#15803D"
            }.get(wo["priority"], "#1E293B")

            with st.expander(f"🎫 {wo['work_order_id']} | {wo['machine_name']} [{wo['priority']}] - {wo['action_title']}", expanded=True):
                col_w1, col_w2 = st.columns([2, 1])

                with col_w1:
                    st.markdown(f"**Target Machine**: `{wo['machine_name']}` ({wo['location']})")
                    st.markdown(f"**Identified Fault**: *{wo['fault_name']}* | Health Index: `{wo['health_index']}%` | Est. RUL: `{wo['estimated_rul_hours']} hrs`")
                    st.markdown(f"**Recommended Timeframe**: `{wo['recommended_timeframe']}`")
                    st.markdown(f"**Assigned Specialist**: `{wo['technician_role']}`")
                    
                    st.markdown("##### 🛠️ Step-by-Step Maintenance Protocol:")
                    for idx, step in enumerate(wo['step_by_step_instructions'], 1):
                        st.markdown(f"{idx}. {step}")

                with col_w2:
                    st.markdown("##### 📦 Required Spare Parts:")
                    for part in wo['required_spare_parts']:
                        st.markdown(f"• `{part}`")

                    st.markdown("##### 💰 Financial Risk Analysis:")
                    fi = wo['financial_impact']
                    st.markdown(f"• Unplanned Failure Risk: **${fi['unplanned_catastrophic_risk_cost']:,.2f}**")
                    st.markdown(f"• Planned Maintenance: **${fi['planned_intervention_cost']:,.2f}**")
                    st.markdown(f"• **Net Financial Savings**: <span style='color:green; font-weight:bold;'>${fi['net_financial_savings']:,.2f}</span>", unsafe_allow_html=True)
    else:
        st.info("No active maintenance work orders generated yet. All machines are operating within baseline parameters.")


# TAB 4: OPERATIONAL AI CHATBOT
with tab_chat:
    st.subheader("💬 Plant Maintenance Natural Language Assistant")
    st.caption("Ask questions about machine status, root-cause diagnostics, or recommended maintenance schedules.")

    for msg in st.session_state.chat_messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    if prompt := st.chat_input("Ask a question (e.g. 'What is the fleet status?' or 'Show critical work orders')..."):
        st.session_state.chat_messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        # Process with LLMAssistantAgent via Orchestrator
        response = orchestrator.query_assistant(prompt)

        st.session_state.chat_messages.append({"role": "assistant", "content": response})
        with st.chat_message("assistant"):
            st.markdown(response)
