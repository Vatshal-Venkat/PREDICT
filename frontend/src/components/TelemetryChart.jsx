import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Activity, Gauge, Flame, Wind, Zap, Gauge as RpmIcon } from 'lucide-react';

export default function TelemetryChart({ machineId, history }) {
  const [activeSensor, setActiveSensor] = useState('vibration_rms');

  const sensors = [
    { key: 'vibration_rms', label: 'Vibration RMS (mm/s)', color: '#3b82f6', icon: Activity, unit: 'mm/s' },
    { key: 'temperature', label: 'Bearing Temp (°C)', color: '#ef4444', icon: Flame, unit: '°C' },
    { key: 'pressure', label: 'Hydraulic Pressure (PSI)', color: '#06b6d4', icon: Wind, unit: 'PSI' },
    { key: 'motor_current', label: 'Motor Current (A)', color: '#f59e0b', icon: Zap, unit: 'A' },
    { key: 'rpm', label: 'Spindle Speed (RPM)', color: '#10b981', icon: RpmIcon, unit: 'RPM' },
  ];

  const currentSensor = sensors.find((s) => s.key === activeSensor) || sensors[0];

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-400" size={20} />
          <div>
            <h3 className="font-bold text-white text-base">Real-Time Sensor Telemetry — {machineId}</h3>
            <p className="text-xs text-slate-400">Live multi-channel sensor waveform monitoring ({history.length} frames ingested)</p>
          </div>
        </div>

        {/* Sensor selector tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {sensors.map((s) => {
            const Icon = s.icon;
            const isActive = activeSensor === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActiveSensor(s.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={14} style={{ color: s.color }} />
                <span>{s.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-[280px] w-full pt-2">
        {history && history.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timestamp_idx" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Simulation Step', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey={activeSensor}
                name={`${currentSensor.label}`}
                stroke={currentSensor.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            No telemetry history available. Inject telemetry steps to generate signals.
          </div>
        )}
      </div>
    </div>
  );
}
