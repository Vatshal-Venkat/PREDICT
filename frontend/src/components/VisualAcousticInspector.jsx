import React, { useState } from 'react';
import { Camera, Volume2, Search, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';

export default function VisualAcousticInspector() {
  const [activeMode, setActiveMode] = useState('visual'); // 'visual' or 'acoustic'
  const [sampleId, setSampleId] = useState('sample_bearing_scan');
  const [inspectionResult, setInspectionResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const runInspection = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/multimodal/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspection_type: activeMode, sample_id: sampleId })
      });
      if (res.ok) {
        const json = await res.json();
        setInspectionResult(json.result);
      }
    } catch (err) {
      console.error('Error running multimodal inspection:', err);
    }
    setIsScanning(false);
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', color: '#f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: '#38bdf8' }}>
            <Camera size={22} />
            Multimodal Visual & Acoustic Defect Inspector
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Computer vision optical part defect scanning & microphone audio acoustic spectrogram diagnostics.
          </p>
        </div>

        {/* Mode Selector Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', background: '#1e293b', padding: '4px', borderRadius: '8px', border: '1px solid #334155' }}>
          <button
            onClick={() => { setActiveMode('visual'); setInspectionResult(null); }}
            style={{
              background: activeMode === 'visual' ? '#0284c7' : 'transparent',
              color: '#f8fafc',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Camera size={14} />
            Optical Part Defect Scanner
          </button>
          <button
            onClick={() => { setActiveMode('acoustic'); setInspectionResult(null); }}
            style={{
              background: activeMode === 'acoustic' ? '#0284c7' : 'transparent',
              color: '#f8fafc',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Volume2 size={14} />
            Acoustic Noise Diagnostics
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Inspection Configuration Controls */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: '0 0 1rem 0' }}>
            Select Inspection Target
          </h3>

          {activeMode === 'visual' ? (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
                Optical Part Sample Scan:
              </label>
              <select
                value={sampleId}
                onChange={(e) => setSampleId(e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', borderRadius: '6px', padding: '8px', fontSize: '0.85rem' }}
              >
                <option value="sample_bearing_scan">SKF 6205 Bearing Race Scan (Spalling Defect)</option>
                <option value="sample_hose_scan">High-Pressure Hydraulic Hose (Surface Abrasion)</option>
                <option value="sample_tool_scan">Carbide Cutter Insert (Tool Wear Chipping)</option>
                <option value="sample_clean_scan">Nominal Part Surface Finish (No Defects)</option>
              </select>
            </div>
          ) : (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
                Microphone Audio Recording:
              </label>
              <select
                value={sampleId}
                onChange={(e) => setSampleId(e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', borderRadius: '6px', padding: '8px', fontSize: '0.85rem' }}
              >
                <option value="motor_hum_anomaly">Motor Suction Cavitation Whine (Anomalous)</option>
                <option value="motor_hum_normal">Smooth Induction Motor Resonance (Normal)</option>
              </select>
            </div>
          )}

          <button
            onClick={runInspection}
            disabled={isScanning}
            style={{
              width: '100%',
              background: '#0284c7',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '1rem'
            }}
          >
            <Search size={16} />
            {isScanning ? 'Processing Deep Learning Inference...' : `Run ${activeMode === 'visual' ? 'Visual Vision' : 'Acoustic'} Inspection`}
          </button>
        </div>

        {/* Inspection Inference Results Panel */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: '0 0 1rem 0' }}>
            Inference & Diagnostic Results
          </h3>

          {inspectionResult ? (
            activeMode === 'visual' ? (
              <div>
                <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: inspectionResult.defect_detected ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {inspectionResult.defect_detected ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                      {inspectionResult.defect_details.defect_type}
                    </span>
                    <span style={{ fontSize: '0.75rem', background: '#334155', padding: '2px 6px', borderRadius: '4px', color: '#38bdf8' }}>
                      Confidence: {(inspectionResult.defect_details.confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0 0 0.5rem 0' }}>
                    {inspectionResult.defect_details.description}
                  </p>

                  <div style={{ background: '#1e293b', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: '#f8fafc', borderLeft: '3px solid #0284c7' }}>
                    <strong>Prescriptive Action:</strong> {inspectionResult.defect_details.recommended_action}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: inspectionResult.anomaly_score > 0.5 ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {inspectionResult.anomaly_score > 0.5 ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                      {inspectionResult.acoustic_status}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#f8fafc' }}>
                      Decibels: {inspectionResult.decibel_level_db} dB
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0 0 0.5rem 0' }}>
                    Identified Acoustic Profile: <strong>{inspectionResult.identified_sound}</strong>
                  </p>

                  <div style={{ background: '#1e293b', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: '#f8fafc', borderLeft: '3px solid #0284c7' }}>
                    <strong>Prescriptive Guidance:</strong> {inspectionResult.recommendation}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              Select a target sample and click 'Run Inspection' to execute vision/acoustic AI inference.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
