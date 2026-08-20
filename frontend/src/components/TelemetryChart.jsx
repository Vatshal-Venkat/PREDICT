import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Activity, Flame, Wind, Zap, Gauge as RpmIcon } from 'lucide-react';

export default function TelemetryChart({ machineId, history }) {
  const [activeSensor, setActiveSensor] = useState('vibration_rms');

  const sensors = [
    { key: 'vibration_rms', label: 'Vibration RMS (mm/s)', color: '#38bdf8', icon: Activity },
    { key: 'bearing_temp_c', label: 'Bearing Temp (°C)', color: '#ef4444', icon: Flame },
    { key: 'hydraulic_pressure_psi', label: 'Hydraulic Pressure (PSI)', color: '#818cf8', icon: Wind },
    { key: 'motor_current_amp', label: 'Motor Current (A)', color: '#f59e0b', icon: Zap },
    { key: 'spindle_rpm', label: 'Spindle Speed (RPM)', color: '#10b981', icon: RpmIcon },
  ];

  const currentSensor = sensors.find((s) => s.key === activeSensor) || sensors[0];

  return (
    <div className="card" style={{ height: '100%', background: '#080d1a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div className="flex-between" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
        <div className="flex-gap-2">
          <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <Activity size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.01em' }}>Real-Time Sensor Telemetry — {machineId}</h3>
            <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>Live multi-channel sensor waveform monitoring ({history.length} frames ingested)</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: '#050811', padding: '4px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {sensors.map((s) => {
            const Icon = s.icon;
            const isActive = activeSensor === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActiveSensor(s.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.73rem',
                  fontWeight: '600',
                  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  border: isActive ? `1px solid ${s.color}66` : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={12} style={{ color: s.color }} />
                <span>{s.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ height: '310px', width: '100%', paddingTop: '0.5rem' }}>
        {history && history.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
              <XAxis dataKey="timestamp_idx" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Telemetry Step', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#080d1a',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  fontSize: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.6)'
                }}
              />
              <Legend verticalAlign="top" height={32} />
              <Line
                type="monotone"
                dataKey={activeSensor}
                name={`${currentSensor.label}`}
                stroke={currentSensor.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: currentSensor.color, stroke: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex-center" style={{ height: '100%', color: '#64748b', fontSize: '0.82rem' }}>
            No telemetry history available. Inject telemetry steps to generate signals.
          </div>
        )}
      </div>
    </div>
  );
}
