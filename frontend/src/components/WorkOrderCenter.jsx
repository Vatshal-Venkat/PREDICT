import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, Clock, Wrench, DollarSign, UserCheck, Package, Download, Share2, ShoppingCart } from 'lucide-react';

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
      return { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.3)' };
    }
    if (priority === 'HIGH_PRIORITY' || priority === 'HIGH') {
      return { background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' };
    }
    return { background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.3)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="flex-between">
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} style={{ color: '#fbbf24' }} />
            Prescriptive Work Order Dispatch & CMMS ERP Inventory
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Automatically generated prescriptive tickets, warehouse spare parts tracking, and SAP PM export integration.
          </p>
        </div>

        {/* Subtab Toggle Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', background: '#1e293b', padding: '4px', borderRadius: '8px', border: '1px solid #334155' }}>
          <button
            onClick={() => setActiveSubTab('tickets')}
            style={{
              background: activeSubTab === 'tickets' ? '#0284c7' : 'transparent',
              color: '#f8fafc',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
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
              background: activeSubTab === 'inventory' ? '#0284c7' : 'transparent',
              color: '#f8fafc',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
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
          <div className="card flex-center" style={{ padding: '3rem', flexDirection: 'column', gap: '0.75rem', textAlign: 'center' }}>
            <CheckCircle2 size={48} style={{ color: '#34d399', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>All Machinery Operating Normally</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
              No active maintenance work orders required. Inject simulated mechanical faults to generate prescriptive repair tickets.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="grid-2">
              {workOrders.map((wo, idx) => {
                const impact = wo.financial_impact || {};

                return (
                  <div key={wo.work_order_id || idx} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                        <div>
                          <div className="flex-gap-2">
                            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: '700', color: '#60a5fa' }}>{wo.work_order_id}</span>
                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: '#1e293b', color: '#e2e8f0' }}>{wo.machine_id}</span>
                          </div>
                          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>{wo.action_title}</h4>
                        </div>
                        <span className="badge" style={getPriorityBadgeStyle(wo.priority)}>
                          {wo.priority}
                        </span>
                      </div>

                      <div className="grid-2" style={{ background: '#0f172a', padding: '0.6rem', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                        <div className="flex-gap-2">
                          <UserCheck size={14} style={{ color: '#60a5fa' }} />
                          <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Assigned Technician</div>
                            <div style={{ fontWeight: '700', color: '#f8fafc' }}>{wo.required_skill}</div>
                          </div>
                        </div>
                        <div className="flex-gap-2">
                          <Clock size={14} style={{ color: '#fbbf24' }} />
                          <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Est. Repair Time</div>
                            <div style={{ fontWeight: '700', color: '#f8fafc' }}>{wo.estimated_repair_time_hours} Hours</div>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                          <Package size={14} style={{ color: '#818cf8' }} /> Required Spare Parts
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {(wo.required_spare_parts || []).map((part, pIdx) => (
                            <span key={pIdx} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#0f172a', border: '1px solid #1e293b', color: '#e2e8f0' }}>
                              {part}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                          <Wrench size={14} style={{ color: '#34d399' }} /> Step-by-Step Repair Guide
                        </div>
                        <ol style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {(wo.step_by_step_guide || []).map((step, sIdx) => (
                            <li key={sIdx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#34d399', display: 'block' }}>
                          +${(impact.net_financial_savings || 0).toLocaleString()} Risk Cost Saved
                        </span>
                      </div>
                      <button
                        onClick={() => handleExportCmms(wo.work_order_id)}
                        style={{ background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Share2 size={12} /> Export SAP PM Schema
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CMMS Payload Export Output Modal */}
            {exportedCmms && (
              <div style={{ background: '#0f172a', border: '1px solid #38bdf8', borderRadius: '8px', padding: '1.25rem', color: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Share2 size={16} /> Standardized SAP PM & IBM Maximo JSON Export Payload
                  </h4>
                  <button onClick={() => setExportedCmms(null)} style={{ background: '#334155', color: '#f8fafc', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer' }}>Close</button>
                </div>
                <pre style={{ background: '#020617', padding: '1rem', borderRadius: '6px', fontSize: '0.75rem', color: '#34d399', overflowX: 'auto', maxHeight: '240px' }}>
                  {JSON.stringify(exportedCmms.sap_pm, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )
      ) : (
        /* Inventory Table View */
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '1rem' }}>
            Warehouse Spare Parts Stock & Auto-Requisition Engine
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '8px' }}>Part Number</th>
                <th style={{ padding: '8px' }}>Part Name</th>
                <th style={{ padding: '8px' }}>Category</th>
                <th style={{ padding: '8px' }}>Stock Quantity</th>
                <th style={{ padding: '8px' }}>Unit Cost</th>
                <th style={{ padding: '8px' }}>Status</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Requisition Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '10px 8px', fontFamily: 'monospace', color: '#38bdf8' }}>{item.part_number}</td>
                  <td style={{ padding: '10px 8px', fontWeight: 600, color: '#f8fafc' }}>{item.part_name}</td>
                  <td style={{ padding: '10px 8px', color: '#94a3b8' }}>{item.category}</td>
                  <td style={{ padding: '10px 8px', fontWeight: 700, color: item.is_low_stock ? '#ef4444' : '#10b981' }}>{item.stock_quantity} units</td>
                  <td style={{ padding: '10px 8px', color: '#f8fafc' }}>${item.unit_cost_usd}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: item.is_low_stock ? '#ef444422' : '#10b98122', color: item.is_low_stock ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleRequisition(item.part_number)}
                      disabled={loadingRequisition}
                      style={{ background: '#0284c7', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
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
