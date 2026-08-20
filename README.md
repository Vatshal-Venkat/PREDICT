# 🏭 AI Predictive Maintenance Platform for Manufacturing

An industrial-grade, decoupled **Multi-Agent AI System** engineered for **Predictive Maintenance (PdM)** in manufacturing environments. Features a **FastAPI backend** (Python) and a **React.js frontend** (Vite + Tailwind CSS + Recharts + Lucide Icons).

The platform ingests real-time multi-sensor telemetry, detects operational anomalies, diagnoses root-cause mechanical faults, forecasts Remaining Useful Life (RUL), generates prescriptive work orders, and calculates financial risk ROI savings.

---

## 🌟 Key Features

- **Decoupled Modern Architecture**:
  - **Backend**: FastAPI REST server providing OpenAPI documentation, CORS middleware, and asynchronous model serving.
  - **Frontend**: React.js SPA built with Vite, Tailwind CSS, Recharts time-series graphs, and Lucide React icons.
- **Multi-Sensor Telemetry Simulator & Fault Injector**: Simulates physical machinery data (Vibration RMS/Kurtosis, Bearing Temperature, Hydraulic Pressure, Acoustic Emissions, Motor Current, RPM) with fault degradation curves.
- **Physics-Informed Anomaly Detection**: Combines unsupervised **Isolation Forest** machine learning with hard rule boundaries to flag out-of-spec operational behavior.
- **Prognostic RUL Engine**: Multi-feature regression (XGBoost / Random Forest) to calculate **Remaining Useful Life (RUL)** in operational hours and dynamically score **Machine Health Index (0-100%)**.
- **Multi-Class Fault Classifier**: Identifies specific failure modes:
  - *Bearing Inner/Outer Race Fatigue*
  - *Hydraulic Pressure Leak / Cavitation*
  - *Motor Winding Overheating*
  - *Mechanical Tool Wear / Cutter Degradation*
  - *Shaft & Spindle Misalignment*
- **Prescriptive Maintenance & Work Order Dispatch**: Automatically generates structured work order tickets with step-by-step repair guides, required spare parts, technician skill requirements, and downtime cost vs. repair savings calculations.
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
   |     FastAPI Backend API      |             |  Operational Chat Assistant  |
   |  (REST Endpoints, JSON State) |             | (Natural Language Interface  |
   |                              |             |   for Fleet Equipment)       |
   +--------------+---------------+             +---------------+--------------+
                  |                                             |
                  +----------------------+----------------------+
                                         |
                                         v
                       +-----------------+-----------------+
                       |    React.js Industrial Dashboard  |
                       |  (Vite + Tailwind + Recharts)     |
                       +-----------------------------------+
```

---

## 📁 Repository Structure

```
Predictive/
├── backend/                        # Python FastAPI Backend
│   ├── app.py                      # FastAPI Web Server (REST Endpoints & Simulation Runner)
│   ├── main.py                     # CLI Runner & Server Launcher
│   ├── config.py                   # Machine profiles, baseline thresholds, fault definitions
│   ├── requirements.txt            # Python dependencies (fastapi, uvicorn, scikit-learn, xgboost)
│   ├── data/
│   │   ├── generator.py            # Industrial sensor simulator & fault injector
│   │   └── dataset.py              # Rolling window feature engineering pipeline
│   ├── models/
│   │   ├── anomaly.py              # Isolation Forest anomaly detector
│   │   ├── classifier.py           # Multi-class fault mode classifier
│   │   ├── rul.py                  # RUL regression model
│   │   └── trainer.py              # Model training pipeline
│   ├── agents/                     # Multi-Agent supervisory architecture
│   │   ├── base.py
│   │   ├── telemetry_agent.py
│   │   ├── diagnostic_agent.py
│   │   ├── prognostic_agent.py
│   │   ├── prescriptive_agent.py
│   │   ├── llm_assistant.py
│   │   └── orchestrator.py
│   └── tests/                      # Pytest & unittest test suite
│
├── frontend/                       # React.js SPA Application
│   ├── package.json                # React dependencies (vite, recharts, lucide-react)
│   ├── vite.config.js              # Vite configuration & backend proxy
│   ├── index.html                  # HTML template
│   └── src/
│       ├── components/
│       │   ├── Header.jsx          # Top navbar & backend status badge
│       │   ├── FleetOverview.jsx   # Fleet metric KPI cards & health matrix
│       │   ├── FaultInjector.jsx   # Interactive simulation fault sandbox
│       │   ├── TelemetryChart.jsx  # Recharts multi-channel waveform graph
│       │   ├── WorkOrderCenter.jsx # Prescriptive work order ticket center
│       │   └── ChatAssistant.jsx   # AI Operational Assistant chat tab
│       ├── App.jsx                 # Main layout & tab router
│       ├── main.jsx                # React entrypoint
│       └── index.css               # Industrial dark theme styling
│
└── README.md                       # Complete documentation
```

---

## 🚀 Quick Start Guide

### 1. Launch FastAPI Backend
```bash
cd backend
python -m pip install -r requirements.txt
python main.py --server --port 8000
```
* Interactive API Documentation will be available at: `http://localhost:8000/docs`

### 2. Launch React.js Frontend
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
* Industrial Dashboard will be available at: `http://localhost:5173`

---

## 📦 Manufacturing Parts & Predictive Datasets

For real-world manufacturing datasets to train models or benchmark defect detection:

1. **AI4I 2020 Predictive Maintenance Dataset (UCI Machine Learning Repository)** *(Best overall match for tabular telemetry)*:
   - Contains 10,000 real industrial tool wear & operational readings (air temp, process temp, rotational speed, torque, tool wear) labeled with failure modes (Tool Wear, Heat Dissipation, Power Failure, Overstrain).
   - [UCI AI4I Dataset Link](https://archive.ics.uci.edu/dataset/601/ai4i+2020+predictive+maintenance+dataset)

2. **IMS Bearing Dataset (NASA / University of Cincinnati)** *(Best for vibration signal analysis)*:
   - High-frequency vibration sensor data collected from bearing run-to-failure experiments. Ideal for prognostic RUL modeling.
   - [NASA PHM Data Portal](https://www.nasa.gov/intelligent-systems-division/discovery-and-systems-health/pdm-data-portal/)

3. **MVTec AD (Anomaly Detection Dataset)** *(Best for computer vision / visual parts defect inspection)*:
   - 5,350+ high-resolution images of 15 industrial manufacturing part categories (screws, metal nuts, tiles, cables, grids, capsules) with pixel-precise ground truth defect annotations.
   - [MVTec AD Website](https://www.mvtec.com/company/research/datasets/mvtec-ad)

4. **ABC Dataset (A Big CAD Dataset)** *(Best for 3D engineering parts)*:
   - Over 1 Million 3D CAD models of mechanical components and manufacturing parts.
   - [ABC Dataset Website](https://deep-geometry.github.io/abc-dataset/)
