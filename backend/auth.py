"""
Authentication and Role-Based Access Control (RBAC) module.
Handles JWT token generation, role verification, and mock login.
"""

from typing import Dict, Any, Optional
import time

SECRET_KEY = "predictive-industrial-ai-secret-key"

ROLES = {
    "Operator": {
        "description": "Plant floor machine operator with view and telemetry injection rights.",
        "permissions": ["view_dashboard", "inject_telemetry", "view_work_orders"]
    },
    "Engineer": {
        "description": "Reliability engineer with diagnostic, signal analysis, and manual retrieval rights.",
        "permissions": ["view_dashboard", "inject_telemetry", "view_work_orders", "analyze_signals", "query_assistant", "run_multimodal"]
    },
    "Manager": {
        "description": "Plant Manager with full operational control, inventory approval, CMMS export, and user management.",
        "permissions": ["view_dashboard", "inject_telemetry", "view_work_orders", "analyze_signals", "query_assistant", "run_multimodal", "manage_inventory", "export_cmms", "reset_sim"]
    }
}

def create_mock_jwt_token(username: str, role: str) -> str:
    """Generate mock token for front-end authentication representation."""
    expiry = int(time.time()) + 86400
    return f"eyJhbGciOiJIUzI1NiJ9.user_{username}_role_{role}_exp_{expiry}.mock_sig"

def verify_role_permission(role: str, permission: str) -> bool:
    """Check if the given user role possesses a specific permission."""
    user_permissions = ROLES.get(role, {}).get("permissions", [])
    return permission in user_permissions
