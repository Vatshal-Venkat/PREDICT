import React, { useState } from 'react';
import { Sliders, Zap, Play, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function FaultInjector({ config, selectedMachineId, onInject, isInjecting }) {
  const [machineId, setMachineId] = useState(selectedMachineId || 'CNC-MILL-01');
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
    <div className="card" style={{ height: '100%', background: '#080d1a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div>
        <div className="flex-between" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <div className="flex-gap-2">
            <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
              <Sliders size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.01em' }}>Synthetic Anomaly Injector Console</h3>
              <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>Inject degradation signals & trigger multi-agent analysis</p>
            </div>
          </div>
          <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: '#050811', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)', fontFamily: 'monospace' }}>
            HW Testbench Mode
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Target Monitored Machine</label>
          <select value={machineId} onChange={(e) => setMachineId(e.target.value)} className="form-select">
            {Object.keys(profiles).map((mId) => (
              <option key={mId} value={mId} style={{ background: '#0c1322' }}>
                {mId} — {profiles[mId].type} ({profiles[mId].location})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Mechanical Fault Mode</label>
          <select value={faultMode} onChange={(e) => setFaultMode(e.target.value)} className="form-select">
            {Object.keys(faults).map((fKey) => (
              <option key={fKey} value={fKey} style={{ background: '#0c1322' }}>
                {fKey} ({faults[fKey]})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <div className="flex-between" style={{ marginBottom: '0.4rem' }}>
            <label className="form-label" style={{ margin: 0 }}>Degradation Severity Level</label>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: faultMode === 'NORMAL' ? '#34d399' : '#fbbf24', fontWeight: '700' }}>
              {faultMode === 'NORMAL' ? '0.0 (Nominal)' : severity.toFixed(1)}
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
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
          <div className="flex-between" style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px' }}>
            <span>0.0 (Healthy)</span>
            <span>0.5 (Moderate)</span>
            <span>1.0 (Critical Failure)</span>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '0.6rem' }}>
          <button onClick={() => handleInject(1)} disabled={isInjecting} className="btn-primary">
            <Zap size={14} /> Inject 1 Reading Step
          </button>
          <button onClick={() => handleInject(5)} disabled={isInjecting} className="btn-amber">
            <Play size={14} /> Stream 5 Failure Steps
          </button>
        </div>
      </div>

      {lastMessage && (
        <div style={{ marginTop: '1rem', padding: '0.65rem 0.85rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(52, 211, 153, 0.25)', color: '#34d399', fontSize: '0.73rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastMessage}</span>
        </div>
      )}
    </div>
  );
}
