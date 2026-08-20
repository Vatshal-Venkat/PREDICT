import React from 'react';
import { Factory, RefreshCw, Server, User, Shield } from 'lucide-react';

export default function Header({ apiStatus, onReset, isResetting, userRole, onRoleChange }) {
  return (
    <header className="card header-bar" style={{ marginBottom: '1.5rem' }}>
      <div className="flex-gap-3">
        <div className="icon-box" style={{ background: 'rgba(37, 99, 235, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}>
          <Factory size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Enterprise AI Predictive Maintenance Platform
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', fontFamily: 'monospace' }}>
              v2.5 Enterprise
            </span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Multi-Agent Telemetry • WebSockets • 3D Digital Twin • FFT/SHAP XAI • RAG Manual Retrieval • Multimodal Inspection • CMMS Sync
          </p>
        </div>
      </div>

      <div className="flex-gap-3">
        {/* User Role Switcher */}
        <div style={{ background: '#0f172a', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
          <Shield size={14} style={{ color: '#38bdf8' }} />
          <span style={{ color: 'var(--text-muted)' }}>Role:</span>
          <select
            value={userRole}
            onChange={(e) => onRoleChange(e.target.value)}
            style={{ background: '#1e293b', border: 'none', color: '#f8fafc', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', borderRadius: '4px', padding: '2px 6px' }}
          >
            <option value="Operator">Operator</option>
            <option value="Engineer">Engineer (Reliability)</option>
            <option value="Manager">Plant Manager</option>
          </select>
        </div>

        <div className="flex-gap-2" style={{ background: '#0f172a', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '0.8rem' }}>
          <Server size={14} style={{ color: apiStatus === 'online' ? '#34d399' : '#fbbf24' }} />
          <span style={{ color: 'var(--text-muted)' }}>API:</span>
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
