import React, { useState } from 'react';
import { Sliders, Zap, Play, CheckCircle2 } from 'lucide-react';

export default function FaultInjector({ config, selectedMachineId, onInject, isInjecting }) {
  const [machineId, setMachineId] = useState(selectedMachineId || 'PUMP-101');
  const [faultMode, setFaultMode] = useState('NORMAL');
  const [severity, setSeverity] = useState(0.6);
  const [lastMessage, setLastMessage] = useState('');

  React.useEffect(() => {
    if (selectedMachineId) {
      setMachineId(selectedMachineId);
    }
  }, [selectedMachineId]);

  const handleInject = async (steps = 1) => {
    setLastMessage('');
    const res = await onInject({
      machine_id: machineId,
      fault_mode: faultMode,
      degradation_severity: faultMode === 'NORMAL' ? 0.0 : severity,
      steps: steps
    });
    if (res && res.message) {
      setLastMessage(res.message);
    }
  };

  const profiles = config?.machine_profiles || {};
  const faults = config?.fault_modes || {};

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
      <div>
        <div className="flex-gap-2" style={{ borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <Sliders style={{ color: '#fbbf24' }} size={20} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>Fault Injection Sandbox</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulate synthetic telemetry signals & trigger multi-agent analysis</p>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Target Machine</label>
          <select value={machineId} onChange={(e) => setMachineId(e.target.value)} className="form-select">
            {Object.keys(profiles).map((mId) => (
              <option key={mId} value={mId}>
                {mId} — {profiles[mId].type} ({profiles[mId].location})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Fault Mode</label>
          <select value={faultMode} onChange={(e) => setFaultMode(e.target.value)} className="form-select">
            {Object.keys(faults).map((fKey) => (
              <option key={fKey} value={fKey}>
                {fKey} ({faults[fKey]})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <div className="flex-between" style={{ marginBottom: '0.4rem' }}>
            <label className="form-label" style={{ margin: 0 }}>Degradation Severity</label>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#fbbf24', fontWeight: '700' }}>
              {faultMode === 'NORMAL' ? '0.0 (Baseline)' : severity.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.1"
            disabled={faultMode === 'NORMAL'}
            value={severity}
            onChange={(e) => setSeverity(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
          />
          <div className="flex-between" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>0.0 (Healthy)</span>
            <span>0.5 (Moderate)</span>
            <span>1.0 (Critical)</span>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '0.6rem' }}>
          <button onClick={() => handleInject(1)} disabled={isInjecting} className="btn-primary">
            <Zap size={14} /> Inject 1 Step
          </button>
          <button onClick={() => handleInject(5)} disabled={isInjecting} className="btn-amber">
            <Play size={14} /> Stream 5 Steps
          </button>
        </div>
      </div>

      {lastMessage && (
        <div style={{ marginTop: '1rem', padding: '0.6rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CheckCircle2 size={14} style={{ shrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastMessage}</span>
        </div>
      )}
    </div>
  );
}
