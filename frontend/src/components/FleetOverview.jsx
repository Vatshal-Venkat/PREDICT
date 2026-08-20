import React from 'react';
import { Cpu, ShieldCheck, AlertTriangle, AlertOctagon, DollarSign, Activity, Wrench, Clock } from 'lucide-react';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 5-Column Grid KPI Cards */}
      <div className="grid-5">
        <div className="card flex-gap-3">
          <div className="icon-box" style={{ background: '#1e293b', color: '#60a5fa' }}>
            <Cpu size={22} />
          </div>
          <div>
            <div className="kpi-val">{summary.total_machines || 0}</div>
            <div className="kpi-lbl">Fleet Machines</div>
          </div>
        </div>

        <div className="card flex-gap-3">
          <div className="icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="kpi-val" style={{ color: '#34d399' }}>{summary.healthy_count || 0}</div>
            <div className="kpi-lbl">Healthy</div>
          </div>
        </div>

        <div className="card flex-gap-3">
          <div className="icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="kpi-val" style={{ color: '#fbbf24' }}>{summary.warning_count || 0}</div>
            <div className="kpi-lbl">Warning</div>
          </div>
        </div>

        <div className="card flex-gap-3">
          <div className="icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
            <AlertOctagon size={22} />
          </div>
          <div>
            <div className="kpi-val" style={{ color: '#f87171' }}>{summary.critical_count || 0}</div>
            <div className="kpi-lbl">Critical</div>
          </div>
        </div>

        <div className="card flex-gap-3">
          <div className="icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(165, 180, 252, 0.2)' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div className="kpi-val" style={{ color: '#a5b4fc' }}>${(summary.total_savings_usd || 0).toLocaleString()}</div>
            <div className="kpi-lbl">Risk Savings</div>
          </div>
        </div>
      </div>

      {/* Machine Fleet Cards 3-Column Grid */}
      <div>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} style={{ color: '#60a5fa' }} />
            Machine Fleet Health Matrix
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click any machine card to analyze real-time telemetry</span>
        </div>

        <div className="grid-3">
          {machines.map((m) => {
            const isSelected = m.machine_id === selectedMachineId;

            return (
              <div
                key={m.machine_id}
                onClick={() => onSelectMachine(m.machine_id)}
                className={`card ${isSelected ? 'card-selected' : ''}`}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>{m.machine_id}</span>
                      <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: '#1e293b', color: 'var(--text-muted)' }}>
                        {m.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{m.location}</div>
                  </div>
                  <span className={getBadgeClass(m.health_status)}>
                    {m.health_status}
                  </span>
                </div>

                {/* Health Index Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div className="flex-between" style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Health Index</span>
                    <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>{m.health_index}%</span>
                  </div>
                  <div className="progress-bg">
                    <div
                      className={getProgressClass(m.health_index)}
                      style={{ width: `${Math.max(5, m.health_index)}%` }}
                    />
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid-2" style={{ background: '#0f172a', padding: '0.6rem', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} style={{ color: '#60a5fa' }} />
                      Est. RUL
                    </div>
                    <div style={{ fontWeight: '700', color: '#f8fafc', marginTop: '2px', fontFamily: 'monospace' }}>
                      {m.predicted_rul_hours} hrs
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Wrench size={12} style={{ color: '#fbbf24' }} />
                      Diagnosed Fault
                    </div>
                    <div style={{ fontWeight: '700', color: '#f8fafc', marginTop: '2px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.diagnosed_fault}>
                      {m.diagnosed_fault}
                    </div>
                  </div>
                </div>

                <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid #1e293b' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }} title={m.recommendation}>{m.recommendation}</span>
                  <span style={{ color: '#60a5fa', fontWeight: '600' }}>Inspect &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
