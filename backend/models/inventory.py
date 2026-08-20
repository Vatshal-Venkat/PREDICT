"""
Spare Parts Inventory Management & Automatic Purchasing Engine.
Tracks stock levels, flags low inventory thresholds, and generates auto-requisitions.
"""

from typing import Dict, Any, List
from database import SessionLocal, InventoryItemRecord, datetime

def get_inventory_status() -> List[Dict[str, Any]]:
    """Fetches list of spare parts and stock levels."""
    db = SessionLocal()
    try:
        items = db.query(InventoryItemRecord).all()
        result = []
        for item in items:
            is_low = item.stock_quantity <= item.reorder_threshold
            result.append({
                "part_number": item.part_number,
                "part_name": item.part_name,
                "category": item.category,
                "stock_quantity": item.stock_quantity,
                "reorder_threshold": item.reorder_threshold,
                "unit_cost_usd": item.unit_cost_usd,
                "supplier": item.supplier,
                "status": "LOW STOCK - REORDER NEEDED" if is_low else "IN STOCK",
                "is_low_stock": is_low
            })
        return result
    finally:
        db.close()

def auto_requisition_part(part_number: str, add_quantity: int = 10) -> Dict[str, Any]:
    """Generates purchase requisition order to restock low spare parts."""
    db = SessionLocal()
    try:
        item = db.query(InventoryItemRecord).filter(InventoryItemRecord.part_number == part_number).first()
        if not item:
            return {"error": f"Part number {part_number} not found."}

        item.stock_quantity += add_quantity
        item.last_updated = datetime.datetime.utcnow()
        db.commit()

        return {
            "message": f"Successfully processed Purchase Requisition for {add_quantity} units of {item.part_name}.",
            "part_number": item.part_number,
            "new_stock_quantity": item.stock_quantity,
            "po_number": f"PO-2026-{random_po_num()}"
        }
    finally:
        db.close()

def random_po_num():
    import random
    return random.randint(10000, 99999)
