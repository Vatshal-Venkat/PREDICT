import React from 'react';
import { Factory, RefreshCw, Server, Shield } from 'lucide-react';

export default function Header({ apiStatus, onReset, isResetting, userRole, onRoleChange }) {
  return (
    <header className="header-bar">
      <div className="flex-gap-3">
        <div className="icon-box" style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', color: '#38bdf8' }}>
          <Factory size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
              AI Predictive Maintenance Operations Platform
            </h1>
            <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.25)', fontFamily: 'monospace', fontWeight: 600 }}>
              v2.5 Enterprise
            </span>
          </div>
        </div>
      </div>

      <div className="flex-gap-3">
        {/* System Pulse Live Indicator */}
        <div style={{ background: '#070c17', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
          <span style={{ color: '#94a3b8' }}>Latency:</span>
          <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>12ms</span>
        </div>

        {/* User Role Switcher */}
        <div style={{ background: '#070c17', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
          <Shield size={14} style={{ color: '#38bdf8' }} />
          <span style={{ color: '#94a3b8' }}>Role:</span>
          <select
            value={userRole}
            onChange={(e) => onRoleChange(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#f8fafc', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
          >
            <option value="Operator" style={{ background: '#0c1322' }}>Operator</option>
            <option value="Engineer" style={{ background: '#0c1322' }}>Engineer (Reliability)</option>
            <option value="Manager" style={{ background: '#0c1322' }}>Plant Manager</option>
          </select>
        </div>

        {/* API Connection Indicator */}
        <div style={{ background: '#070c17', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
          <Server size={14} style={{ color: apiStatus === 'online' ? '#34d399' : '#fbbf24' }} />
          <span style={{ color: '#94a3b8' }}>Backend API:</span>
          <span style={{ fontWeight: '700', color: apiStatus === 'online' ? '#34d399' : '#fbbf24' }}>
            {apiStatus.toUpperCase()}
          </span>
        </div>

        {/* Reset Simulation Button */}
        <button onClick={onReset} disabled={isResetting} className="btn-secondary">
          <RefreshCw size={13} style={{ animation: isResetting ? 'spin 1s linear infinite' : 'none' }} />
          Reset Simulation
        </button>
      </div>
    </header>
  );
}
