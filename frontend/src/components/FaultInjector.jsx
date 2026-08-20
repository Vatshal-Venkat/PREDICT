import React, { useState } from 'react';
import { Sliders, Zap, Play, CheckCircle2 } from 'lucide-react';

export default function FaultInjector({ config, selectedMachineId, onInject, isInjecting }) {
  const [machineId, setMachineId] = useState(selectedMachineId || 'PUMP-101');
  const [faultMode, setFaultMode] = useState('NORMAL');
  const [severity, setSeverity] = useState(0.6);
  const [lastMessage, setLastMessage] = useState('');

  // Keep state synced if parent changes selectedMachineId
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
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Sliders className="text-amber-400" size={20} />
        <div>
          <h3 className="font-bold text-white text-base">Fault Injection Sandbox</h3>
          <p className="text-xs text-slate-400">Simulate synthetic telemetry signals & trigger multi-agent analysis</p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1">Target Machine</label>
          <select
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {Object.keys(profiles).map((mId) => (
              <option key={mId} value={mId}>
                {mId} — {profiles[mId].type} ({profiles[mId].location})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">Fault Mode</label>
          <select
            value={faultMode}
            onChange={(e) => setFaultMode(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {Object.keys(faults).map((fKey) => (
              <option key={fKey} value={fKey}>
                {fKey} ({faults[fKey]})
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between mb-1 font-medium">
            <label className="text-slate-300">Degradation Severity</label>
            <span className="font-mono text-amber-400">{faultMode === 'NORMAL' ? '0.0 (Baseline)' : severity.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.1"
            disabled={faultMode === 'NORMAL'}
            value={severity}
            onChange={(e) => setSeverity(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-30"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0.0 (Healthy)</span>
            <span>0.5 (Moderate)</span>
            <span>1.0 (Critical)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => handleInject(1)}
            disabled={isInjecting}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition disabled:opacity-50"
          >
            <Zap size={14} />
            Inject 1 Step
          </button>

          <button
            onClick={() => handleInject(5)}
            disabled={isInjecting}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition disabled:opacity-50"
          >
            <Play size={14} />
            Stream 5 Steps
          </button>
        </div>

        {lastMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 flex items-center gap-2 mt-2">
            <CheckCircle2 size={14} className="shrink-0" />
            <span className="truncate">{lastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
