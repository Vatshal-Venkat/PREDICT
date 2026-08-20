import React from 'react';
import { Cpu, ShieldCheck, AlertTriangle, AlertOctagon, DollarSign, Activity, Wrench, Clock, Zap, ChevronRight } from 'lucide-react';

export default function FleetOverview({ summary, machines, selectedMachineId, onSelectMachine }) {
  const getBadgeClass = (status) => {
    if (status === 'Healthy') return 'badge badge-healthy';
    if (status === 'Degraded / Warning') return 'badge badge-warning';
    return 'badge badge-critical';
  };

  const getProgressClass = (health) => {
    if (health >= 70) return 'progress-fill progress-healthy';
    if (health >= 40) return 'progress-fill progress-warning';
    return 'progress-fill progress-critical';
  };

  const fleetOee = summary?.fleet_oee?.fleet_oee_pct || 94.2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Executive 6-Column KPI Grid */}
      <div className="grid-6">
        <div className="kpi-card">
          <div className="icon-box" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <Cpu size={20} />
          </div>
          <div>
            <div className="kpi-val">{summary.total_machines || 0}</div>
            <div className="kpi-lbl">Monitored Assets</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="kpi-val" style={{ color: '#34d399' }}>{summary.healthy_count || 0}</div>
            <div className="kpi-lbl">Healthy State</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="kpi-val" style={{ color: '#fbbf24' }}>{summary.warning_count || 0}</div>
            <div className="kpi-lbl">Warning Stage</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
            <AlertOctagon size={20} />
          </div>
          <div>
            <div className="kpi-val" style={{ color: '#f87171' }}>{summary.critical_count || 0}</div>
            <div className="kpi-lbl">Critical Risk</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="icon-box" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <Zap size={20} />
          </div>
          <div>
            <div className="kpi-val" style={{ color: '#38bdf8' }}>{fleetOee}%</div>
            <div className="kpi-lbl">Fleet OEE Rating</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="icon-box" style={{ background: 'rgba(129, 140, 248, 0.1)', color: '#a5b4fc', border: '1px solid rgba(165, 180, 252, 0.2)' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <div className="kpi-val" style={{ color: '#a5b4fc' }}>${(summary.total_savings_usd || 0).toLocaleString()}</div>
            <div className="kpi-lbl">Risk Savings</div>
          </div>
        </div>
      </div>

      {/* Machine Fleet Matrix Grid */}
      <div>
        <div className="flex-between" style={{ marginBottom: '0.85rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.01em' }}>
            <Activity size={18} style={{ color: '#38bdf8' }} />
            Operational Fleet Health Matrix
          </h2>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Select any asset to inspect live telemetry and signal spectrum</span>
        </div>

        <div className="grid-3">
          {machines.map((m) => {
            const isSelected = m.machine_id === selectedMachineId;

            return (
              <div
                key={m.machine_id}
                onClick={() => onSelectMachine(m.machine_id)}
                className={`card ${isSelected ? 'card-selected' : ''}`}
                style={{ cursor: 'pointer', background: isSelected ? 'rgba(12, 19, 34, 0.95)' : '#080d1a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem' }}
              >
                <div>
                  <div className="flex-between" style={{ marginBottom: '0.65rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', fontFamily: 'monospace' }}>{m.machine_id}</span>
                        <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          {m.type}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{m.location}</div>
                    </div>
                    <span className={getBadgeClass(m.health_status)}>
                      {m.health_status}
                    </span>
                  </div>

                  {/* Health Index Bar */}
                  <div style={{ marginBottom: '0.85rem' }}>
                    <div className="flex-between" style={{ fontSize: '0.72rem', fontWeight: '600', marginBottom: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Machine Health Index</span>
                      <span style={{ color: m.health_index < 40 ? '#ef4444' : (m.health_index < 70 ? '#f59e0b' : '#10b981'), fontFamily: 'monospace', fontWeight: 700 }}>
                        {m.health_index}%
                      </span>
                    </div>
                    <div className="progress-bg">
                      <div
                        className={getProgressClass(m.health_index)}
                        style={{ width: `${Math.max(5, m.health_index)}%` }}
                      />
                    </div>
                  </div>

                  {/* Details Metric Box */}
                  <div className="grid-2" style={{ background: '#050811', padding: '0.65rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.73rem' }}>
                    <div>
                      <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} style={{ color: '#38bdf8' }} />
                        Forecast RUL
                      </div>
                      <div style={{ fontWeight: '700', color: m.predicted_rul_hours < 100 ? '#ef4444' : '#f8fafc', marginTop: '2px', fontFamily: 'monospace' }}>
                        {m.predicted_rul_hours} hrs
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Wrench size={12} style={{ color: '#fbbf24' }} />
                        Active Fault
                      </div>
                      <div style={{ fontWeight: '700', color: m.diagnosed_fault === 'NORMAL' ? '#34d399' : '#f87171', marginTop: '2px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.diagnosed_fault}>
                        {m.diagnosed_fault}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-between" style={{ fontSize: '0.72rem', color: '#64748b', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '210px' }} title={m.recommendation}>{m.recommendation}</span>
                  <span style={{ color: '#38bdf8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    Inspect <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
