# 🏭 AI Predictive Maintenance Platform for Manufacturing

An industrial-grade Multi-Agent AI system engineered for **Predictive Maintenance (PdM)** in manufacturing environments. The system processes real-time multi-sensor telemetry, detects operational anomalies, diagnoses root-cause mechanical faults, forecasts Remaining Useful Life (RUL), and generates prescriptive work orders with financial risk analysis.

---

## 🌟 Key Features

- **Multi-Sensor Telemetry Simulator & Fault Injector**: Simulates physical equipment data (Vibration RMS/Kurtosis, Bearing Temperature, Hydraulic Pressure, Acoustic Emissions, Motor Current, RPM) with realistic fault degradation curves.
- **Physics-Informed Anomaly Detection**: Combines unsupervised **Isolation Forest** machine learning with hard rule boundaries to flag out-of-spec operational behavior.
- **Prognostic RUL Engine**: Multi-feature regression (XGBoost / Random Forest) to calculate **Remaining Useful Life (RUL)** in operational hours and dynamically score **Machine Health Index (0-100%)**.
- **Multi-Class Fault Classifier**: Identifies specific failure modes:
  - *Bearing Inner/Outer Race Fatigue*
  - *Hydraulic Pressure Leak / Cavitation*
  - *Motor Winding Overheating*
  - *Mechanical Tool Wear / Cutter Degradation*
  - *Shaft & Spindle Misalignment*
- **Prescriptive Maintenance & Work Order Dispatch**: Automatically generates structured work order tickets with step-by-step repair guides, required spare parts, technician skill requirements, and downtime cost vs. repair savings calculations.
- **Interactive Streamlit Web Dashboard**: Live fleet health grid, Plotly telemetry charts, interactive fault injection sandbox, work order center, and natural language AI maintenance chatbot.
- **Autonomous Multi-Agent Architecture**: Decoupled agent system (`TelemetryAgent`, `DiagnosticAgent`, `PrognosticAgent`, `PrescriptiveAgent`, `LLMAssistantAgent`, `FleetOrchestrator`).

---

## 🏗 System Architecture

```
                       +-----------------------------------+
                       |   Multi-Sensor Telemetry Stream   |
                       | (Vibration, Temp, Pressure, RPM)  |
                       +-----------------+-----------------+
                                         |
                                         v
                       +-----------------+-----------------+
                       |         Telemetry Agent           |
                       | (Windowing, Isolation Forest)    |
                       +-----------------+-----------------+
                                         |
                  +----------------------+----------------------+
                  |                                             |
                  v                                             v
   +--------------+---------------+             +---------------+--------------+
   |       Diagnostic Agent       |             |       Prognostic Agent       |
   | (Fault Mode Classification & |             | (Remaining Useful Life (RUL) |
   |     Root-Cause Analysis)     |             | & Health Index 0-100%)       |
   +--------------+---------------+             +---------------+--------------+
                  |                                             |
                  +----------------------+----------------------+
                                         |
                                         v
                       +-----------------+-----------------+
                       |   Prescriptive Action Agent       |
                       | (Work Orders, Cost Optimization,  |
                       |  Spare Part Recommendations)     |
                       +-----------------+-----------------+
                                         |
                  +----------------------+----------------------+
                  |                                             |
                  v                                             v
   +--------------+---------------+             +---------------+--------------+
   |   Streamlit Web Dashboard    |             |  Operational Chat Assistant  |
   |  (Live Telemetry, Charts,    |             | (Natural Language Interface  |
   |   Fault Injection Sandbox)   |             |   for Fleet Equipment)       |
   +------------------------------+             +------------------------------+
```

---

## 📁 Repository Structure

```
Predictive/
├── app.py                          # Streamlit Interactive Web Application & Fleet Operations Dashboard
├── main.py                         # Unified CLI (Training, Simulation, Terminal Chat)
├── config.py                       # Machine profiles, baseline thresholds, fault definitions
├── requirements.txt                # Python dependencies
├── README.md                       # Documentation & Architecture Overview
├── data/
│   ├── generator.py                # Synthetic Industrial Sensor Telemetry Simulator & Fault Injector
│   └── dataset.py                  # Rolling window feature engineering pipeline
├── models/
│   ├── anomaly.py                  # Isolation Forest & physics threshold anomaly detector
│   ├── rul.py                      # Remaining Useful Life (RUL) regression model
│   ├── classifier.py               # Multi-class Fault Mode Classifier
│   └── trainer.py                  # Automated model training and persistence pipeline
├── agents/
│   ├── base.py                     # Agent base class and message protocol
│   ├── telemetry_agent.py          # Data Ingestion & Monitoring Agent
│   ├── diagnostic_agent.py         # Root Cause Analysis Agent
│   ├── prognostic_agent.py         # Health Index & RUL Estimation Agent
│   ├── prescriptive_agent.py       # Prescriptive Work Order Agent
│   ├── llm_assistant.py            # Natural Language Operational Chat Assistant
│   └── orchestrator.py             # Multi-Agent Supervisor & Fleet State Manager
└── tests/
    ├── test_generator.py           # Unit tests for data generation
    ├── test_models.py              # Unit tests for ML models
    └── test_agents.py              # Unit tests for multi-agent workflows
```

---

## 🚀 Quick Start Guide

### 1. Installation

Ensure Python 3.9+ is installed. Clone the repository and install dependencies:

```bash
pip install -r requirements.txt
```

### 2. Run Automated Unit Tests

Verify system integrity by running the test suite:

```bash
python -m pytest tests/
```

### 3. Model Training (Optional - Automated on first run)

Train the ML models on synthetic run-to-failure historical data:

```bash
python main.py --train
```

### 4. Run Terminal Telemetry Simulation

Execute a live multi-agent simulation with fault injection directly in the terminal:

```bash
python main.py --simulate --machine CNC-MILL-01 --fault BEARING_FATIGUE
```

### 5. Launch Interactive Web Dashboard

Launch the Streamlit web application:

```bash
streamlit run app.py
```

Open your browser at `http://localhost:8501`.

---

## 🎮 Web Dashboard Capabilities

1. **Fleet Overview Grid**: Monitor health status cards across CNC Mills, Hydraulic Pumps, Industrial Compressors, and Robotic Arms.
2. **Interactive Telemetry Graphs**: Plotly time-series plots for Vibration, Temperature, Pressure, Acoustic Emission, and Power Draw.
3. **Fault Injection Sandbox**: Interactively inject component breakdowns (e.g. *Bearing Fatigue on CNC Mill #1* or *Hydraulic Leak*) and observe real-time agent alerting and diagnosis.
4. **Prescriptive Work Orders**: Review generated work order tickets detailing step-by-step repair guides, assigned technician level, spare part lists, and financial savings.
5. **AI Operational Chatbot**: Ask questions in natural language like *"What is the status of Hydraulic Pump #2?"* or *"Show me all critical work orders"*.
