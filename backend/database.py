"""
Database Persistence Layer using SQLAlchemy for SQLite.
Stores persistent machine health history, work orders, inventory, alert logs, and users.
"""

from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
import datetime
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "predictive.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class MachineRecord(Base):
    __tablename__ = "machines"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    location = Column(String, nullable=False)
    health_index = Column(Float, default=100.0)
    health_status = Column(String, default="Healthy")
    predicted_rul_hours = Column(Float, default=1000.0)
    diagnosed_fault = Column(String, default="NORMAL")
    confidence = Column(Float, default=1.0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class TelemetryLogRecord(Base):
    __tablename__ = "telemetry_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    machine_id = Column(String, ForeignKey("machines.id"), nullable=False)
    timestamp_idx = Column(Integer, nullable=False)
    vibration_rms = Column(Float, nullable=False)
    bearing_temp_c = Column(Float, nullable=False)
    hydraulic_pressure_psi = Column(Float, nullable=False)
    acoustic_emission_db = Column(Float, nullable=False)
    motor_current_amp = Column(Float, nullable=False)
    spindle_rpm = Column(Float, nullable=False)
    fault_mode = Column(String, default="NORMAL")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WorkOrderRecord(Base):
    __tablename__ = "work_orders"

    id = Column(String, primary_key=True)
    machine_id = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    fault_type = Column(String, nullable=False)
    status = Column(String, default="OPEN")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    guide_steps = Column(Text, nullable=True)
    required_parts = Column(Text, nullable=True)
    financial_savings = Column(Float, default=0.0)

class InventoryItemRecord(Base):
    __tablename__ = "inventory"

    part_number = Column(String, primary_key=True)
    part_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    stock_quantity = Column(Integer, default=0)
    reorder_threshold = Column(Integer, default=5)
    unit_cost_usd = Column(Float, default=0.0)
    supplier = Column(String, default="Industrial Parts Co.")
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

class AlertLogRecord(Base):
    __tablename__ = "alert_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    machine_id = Column(String, nullable=False)
    severity = Column(String, nullable=False) # CRITICAL, WARNING, INFO
    message = Column(String, nullable=False)
    channel = Column(String, default="Slack / Webhook")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class UserRecord(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Engineer") # Operator, Engineer, Manager
    full_name = Column(String, nullable=False)

def init_db():
    Base.metadata.create_all(bind=engine)
    # Seed default inventory & demo user if empty
    db = SessionLocal()
    try:
        if db.query(InventoryItemRecord).count() == 0:
            default_items = [
                InventoryItemRecord(part_number="SKF-6205-2RSH", part_name="Deep Groove Ball Bearing 6205", category="Bearings", stock_quantity=12, reorder_threshold=4, unit_cost_usd=45.0, supplier="SKF Bearings"),
                InventoryItemRecord(part_number="HYD-SEAL-P102", part_name="High-Pressure Viton Hydraulic Seal", category="Hydraulics", stock_quantity=2, reorder_threshold=5, unit_cost_usd=85.0, supplier="Parker Hannifin"),
                InventoryItemRecord(part_number="MTR-COIL-37KW", part_name="37kW Stator Winding Insulation Kit", category="Electrical", stock_quantity=3, reorder_threshold=2, unit_cost_usd=320.0, supplier="Siemens Industry"),
                InventoryItemRecord(part_number="CNC-CUT-CARB", part_name="Carbide Milling Insert Set (10x)", category="Tooling", stock_quantity=15, reorder_threshold=5, unit_cost_usd=150.0, supplier="Sandvik Coromant"),
                InventoryItemRecord(part_number="SPD-ALGN-SHIM", part_name="Precision Laser Alignment Shim Pack", category="Mechanical", stock_quantity=8, reorder_threshold=3, unit_cost_usd=65.0, supplier="Fluke Industrial"),
            ]
            db.add_all(default_items)
            db.commit()

        if db.query(UserRecord).count() == 0:
            demo_users = [
                UserRecord(username="operator", hashed_password="hashed_op_secret", role="Operator", full_name="Alex Rivera (Plant Tech)"),
                UserRecord(username="engineer", hashed_password="hashed_eng_secret", role="Engineer", full_name="Sarah Chen (Reliability Eng)"),
                UserRecord(username="manager", hashed_password="hashed_mgr_secret", role="Manager", full_name="Marcus Vance (Plant Operations Mgr)"),
            ]
            db.add_all(demo_users)
            db.commit()
    finally:
        db.close()
