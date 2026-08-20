import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, Clock, Wrench, DollarSign, UserCheck, Package, Share2, ShoppingCart } from 'lucide-react';

export default function WorkOrderCenter({ workOrders }) {
  const [activeSubTab, setActiveSubTab] = useState('tickets'); // 'tickets' or 'inventory'
  const [inventory, setInventory] = useState([]);
  const [exportedCmms, setExportedCmms] = useState(null);
  const [loadingRequisition, setLoadingRequisition] = useState(false);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const json = await res.json();
        setInventory(json.inventory || []);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleExportCmms = async (woId) => {
    try {
      const res = await fetch(`/api/cmms/export/${woId}`);
      if (res.ok) {
        const json = await res.json();
        setExportedCmms(json);
      }
    } catch (err) {
      console.error('Error exporting CMMS:', err);
    }
  };

  const handleRequisition = async (partNum) => {
    setLoadingRequisition(true);
    try {
      const res = await fetch('/api/inventory/requisition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ part_number: partNum, quantity: 10 })
      });
      if (res.ok) {
        await fetchInventory();
      }
    } catch (err) {
      console.error('Error auto-requisitioning part:', err);
    }
    setLoadingRequisition(false);
  };

  const getPriorityBadgeStyle = (priority) => {
    if (priority === 'CRITICAL_IMMEDIATE' || priority === 'CRITICAL') {
      return { background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.25)' };
    }
    if (priority === 'HIGH_PRIORITY' || priority === 'HIGH') {
      return { background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.25)' };
    }
    return { background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.25)' };
  };

  return (
    <div className="card" style={{ background: '#080d1a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div className="flex-between" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: '#38bdf8' }}>
            <FileText size={20} />
            Prescriptive Work Order Dispatch & Enterprise CMMS ERP Sync
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '3px 0 0 0' }}>
            Automatically generated prescriptive tickets, warehouse spare parts tracking, and SAP PM / Maximo ERP export integration.
          </p>
        </div>

        {/* Subtab Segmented Controls */}
        <div style={{ display: 'flex', gap: '0.4rem', background: '#050811', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={() => setActiveSubTab('tickets')}
            style={{
              background: activeSubTab === 'tickets' ? 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
              color: '#f8fafc',
              border: activeSubTab === 'tickets' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <FileText size={14} />
            Work Order Tickets ({workOrders.length})
          </button>

          <button
            onClick={() => setActiveSubTab('inventory')}
            style={{
              background: activeSubTab === 'inventory' ? 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
              color: '#f8fafc',
              border: activeSubTab === 'inventory' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Package size={14} />
            Warehouse Spare Parts Inventory
          </button>
        </div>
      </div>

      {activeSubTab === 'tickets' ? (
        workOrders.length === 0 ? (
          <div className="flex-center" style={{ padding: '3rem', flexDirection: 'column', gap: '0.75rem', textAlign: 'center', background: '#050811', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <CheckCircle2 size={42} style={{ color: '#34d399', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>All Monitored Equipment Operating Normally</h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '420px', margin: 0 }}>
              No active maintenance work orders required. Inject simulated mechanical faults to generate prescriptive repair tickets.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="grid-2">
              {workOrders.map((wo, idx) => {
                const impact = wo.financial_impact || {};

                return (
                  <div key={wo.work_order_id || idx} style={{ background: '#050811', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                        <div>
                          <div className="flex-gap-2">
                            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>{wo.work_order_id}</span>
                            <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: '#080d1a', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.08)' }}>{wo.machine_id}</span>
                          </div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>{wo.action_title}</h4>
                        </div>
                        <span className="badge" style={getPriorityBadgeStyle(wo.priority)}>
                          {wo.priority}
                        </span>
                      </div>

                      <div className="grid-2" style={{ background: '#080d1a', padding: '0.65rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '0.85rem', fontSize: '0.73rem' }}>
                        <div className="flex-gap-2">
                          <UserCheck size={14} style={{ color: '#38bdf8' }} />
                          <div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Assigned Specialist</div>
                            <div style={{ fontWeight: 700, color: '#f8fafc' }}>{wo.required_skill}</div>
                          </div>
                        </div>
                        <div className="flex-gap-2">
                          <Clock size={14} style={{ color: '#fbbf24' }} />
                          <div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Est. Downtime</div>
                            <div style={{ fontWeight: 700, color: '#f8fafc' }}>{wo.estimated_repair_time_hours} Hours</div>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: '0.85rem' }}>
                        <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                          <Package size={14} style={{ color: '#818cf8' }} /> Required Spare Parts
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {(wo.required_spare_parts || []).map((part, pIdx) => (
                            <span key={pIdx} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#080d1a', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#cbd5e1' }}>
                              {part}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                          <Wrench size={14} style={{ color: '#34d399' }} /> Prescriptive Repair Guide
                        </div>
                        <ol style={{ fontSize: '0.73rem', color: '#94a3b8', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {(wo.step_by_step_guide || []).map((step, sIdx) => (
                            <li key={sIdx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', display: 'block', fontFamily: 'monospace' }}>
                          +${(impact.net_financial_savings || 0).toLocaleString()} Cost Avoided
                        </span>
                      </div>
                      <button
                        onClick={() => handleExportCmms(wo.work_order_id)}
                        className="btn-primary"
                        style={{ padding: '5px 10px', fontSize: '0.73rem' }}
                      >
                        <Share2 size={12} /> Export SAP PM Schema
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CMMS Payload Export Drawer */}
            {exportedCmms && (
              <div style={{ background: '#050811', border: '1px solid #38bdf8', borderRadius: '8px', padding: '1.25rem', color: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Share2 size={15} /> Standardized SAP PM & IBM Maximo JSON Export Payload
                  </h4>
                  <button onClick={() => setExportedCmms(null)} className="btn-secondary" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Close Payload</button>
                </div>
                <pre style={{ background: '#080d1a', padding: '1rem', borderRadius: '6px', fontSize: '0.73rem', color: '#34d399', overflowX: 'auto', maxHeight: '240px', fontFamily: 'monospace' }}>
                  {JSON.stringify(exportedCmms.sap_pm, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )
      ) : (
        /* Spare Parts Warehouse Inventory Table View */
        <div style={{ background: '#050811', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginBottom: '1rem' }}>
            Warehouse Spare Parts Stock & Auto-Requisition Engine
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#64748b' }}>
                <th style={{ padding: '8px' }}>Part Number</th>
                <th style={{ padding: '8px' }}>Part Name</th>
                <th style={{ padding: '8px' }}>Category</th>
                <th style={{ padding: '8px' }}>Stock Quantity</th>
                <th style={{ padding: '8px' }}>Unit Cost</th>
                <th style={{ padding: '8px' }}>Inventory Status</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Requisition Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '10px 8px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>{item.part_number}</td>
                  <td style={{ padding: '10px 8px', fontWeight: 600, color: '#f8fafc' }}>{item.part_name}</td>
                  <td style={{ padding: '10px 8px', color: '#94a3b8' }}>{item.category}</td>
                  <td style={{ padding: '10px 8px', fontWeight: 700, color: item.is_low_stock ? '#ef4444' : '#34d399', fontFamily: 'monospace' }}>{item.stock_quantity} units</td>
                  <td style={{ padding: '10px 8px', color: '#f8fafc' }}>${item.unit_cost_usd}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: item.is_low_stock ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', color: item.is_low_stock ? '#ef4444' : '#34d399', border: item.is_low_stock ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(52, 211, 153, 0.25)', fontWeight: 600 }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleRequisition(item.part_number)}
                      disabled={loadingRequisition}
                      className="btn-primary"
                      style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                    >
                      <ShoppingCart size={12} /> Auto-Order +10
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
