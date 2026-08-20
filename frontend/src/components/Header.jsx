import React from 'react';
import { Activity, Factory, RefreshCw, Server } from 'lucide-react';

export default function Header({ apiStatus, onReset, isResetting }) {
  return (
    <header className="card header-bar" style={{ marginBottom: '1.5rem' }}>
      <div className="flex-gap-3">
        <div className="icon-box" style={{ background: 'rgba(37, 99, 235, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}>
          <Factory size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            AI Predictive Maintenance Platform
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', fontFamily: 'monospace' }}>
              v2.0 Decoupled
            </span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Multi-Agent Autonomous Telemetry Ingestion • Fault Diagnostics • RUL Forecasting • Prescriptive Work Orders
          </p>
        </div>
      </div>

      <div className="flex-gap-3">
        <div className="flex-gap-2" style={{ background: '#0f172a', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '0.8rem' }}>
          <Server size={14} style={{ color: apiStatus === 'online' ? '#34d399' : '#fbbf24' }} />
          <span style={{ color: 'var(--text-muted)' }}>Backend API:</span>
          <span style={{ fontWeight: '700', color: apiStatus === 'online' ? '#34d399' : '#fbbf24' }}>
            {apiStatus.toUpperCase()}
          </span>
        </div>

        <button onClick={onReset} disabled={isResetting} className="btn-secondary">
          <RefreshCw size={14} style={{ animation: isResetting ? 'spin 1s linear infinite' : 'none' }} />
          Reset Simulation
        </button>
      </div>
    </header>
  );
}
