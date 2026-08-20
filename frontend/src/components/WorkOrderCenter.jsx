import React from 'react';
import { FileText, CheckCircle2, Clock, Wrench, DollarSign, UserCheck, Package } from 'lucide-react';

export default function WorkOrderCenter({ workOrders }) {
  const getPriorityBadgeStyle = (priority) => {
    if (priority === 'CRITICAL_IMMEDIATE') {
      return { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.3)' };
    }
    if (priority === 'HIGH_PRIORITY') {
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
            Prescriptive Maintenance Work Order Dispatch Center
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Automatically generated prescriptive tickets with repair steps, spare parts, technician role & financial savings
          </p>
        </div>
        <span style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: '12px', background: '#1e293b', color: '#e2e8f0', fontFamily: 'monospace' }}>
          {workOrders.length} Active Ticket(s)
        </span>
      </div>

      {workOrders.length === 0 ? (
        <div className="card flex-center" style={{ padding: '3rem', flexDirection: 'column', gap: '0.75rem', textAlign: 'center' }}>
          <CheckCircle2 size={48} style={{ color: '#34d399', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>All Machinery Operating Normally</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
            No active maintenance work orders required. Inject simulated mechanical faults to generate prescriptive repair tickets.
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {workOrders.map((wo, idx) => {
            const impact = wo.financial_impact || {};

            return (
              <div key={wo.work_order_id || idx} className="card" style={{ display: 'flex', flexDirection: 'column', justify: 'space-between', gap: '1rem' }}>
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

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.2)', fontSize: '0.75rem' }}>
                  <div className="flex-between" style={{ fontWeight: '700', color: '#34d399', marginBottom: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <DollarSign size={14} /> Financial Risk ROI
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      +${(impact.net_financial_savings || 0).toLocaleString()} Saved
                    </span>
                  </div>
                  <div className="flex-between" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', paddingTop: '4px', borderTop: '1px solid rgba(52, 211, 153, 0.15)' }}>
                    <span>Unplanned Failure: <strong style={{ color: '#f87171' }}>${(impact.unplanned_downtime_cost || 0).toLocaleString()}</strong></span>
                    <span>Planned Repair: <strong style={{ color: '#34d399' }}>${(impact.planned_repair_cost || 0).toLocaleString()}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
