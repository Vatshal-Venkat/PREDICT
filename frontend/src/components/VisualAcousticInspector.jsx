import React, { useState } from 'react';
import { Camera, Volume2, Search, CheckCircle, AlertTriangle } from 'lucide-react';

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
    <div className="card" style={{ background: '#080d1a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div className="flex-between" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: '#38bdf8' }}>
            <Camera size={20} />
            Multimodal Visual & Acoustic Defect Inspector HUD
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '3px 0 0 0' }}>
            Computer vision optical part defect scanning & microphone audio acoustic spectrogram diagnostics.
          </p>
        </div>

        {/* Mode Selector Segmented Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', background: '#050811', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={() => { setActiveMode('visual'); setInspectionResult(null); }}
            style={{
              background: activeMode === 'visual' ? 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
              color: '#f8fafc',
              border: activeMode === 'visual' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Camera size={14} />
            Optical Part Defect Vision
          </button>
          <button
            onClick={() => { setActiveMode('acoustic'); setInspectionResult(null); }}
            style={{
              background: activeMode === 'acoustic' ? 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
              color: '#f8fafc',
              border: activeMode === 'acoustic' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '0.78rem',
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

      <div className="grid-2">
        {/* Inspection Configuration Controls */}
        <div style={{ background: '#050811', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc', margin: '0 0 1rem 0' }}>
            Inspection Target Parameters
          </h3>

          {activeMode === 'visual' ? (
            <div className="form-group">
              <label className="form-label">Optical Component Scan Target</label>
              <select
                value={sampleId}
                onChange={(e) => setSampleId(e.target.value)}
                className="form-select"
              >
                <option value="sample_bearing_scan" style={{ background: '#0c1322' }}>SKF 6205 Bearing Race Scan (Spalling Defect)</option>
                <option value="sample_hose_scan" style={{ background: '#0c1322' }}>High-Pressure Hydraulic Hose (Surface Abrasion)</option>
                <option value="sample_tool_scan" style={{ background: '#0c1322' }}>Carbide Cutter Insert (Tool Wear Chipping)</option>
                <option value="sample_clean_scan" style={{ background: '#0c1322' }}>Nominal Part Surface Finish (No Defects)</option>
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Microphone Audio Recording</label>
              <select
                value={sampleId}
                onChange={(e) => setSampleId(e.target.value)}
                className="form-select"
              >
                <option value="motor_hum_anomaly" style={{ background: '#0c1322' }}>Motor Suction Cavitation Whine (Anomalous)</option>
                <option value="motor_hum_normal" style={{ background: '#0c1322' }}>Smooth Induction Motor Resonance (Normal)</option>
              </select>
            </div>
          )}

          <button
            onClick={runInspection}
            disabled={isScanning}
            className="btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            <Search size={15} />
            {isScanning ? 'Running Deep Learning Inference...' : `Execute ${activeMode === 'visual' ? 'Vision AI' : 'Acoustic AI'} Inspection`}
          </button>
        </div>

        {/* Inspection Inference Results Viewport */}
        <div style={{ background: '#050811', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc', margin: '0 0 1rem 0' }}>
            Diagnostic Inference HUD Output
          </h3>

          {inspectionResult ? (
            activeMode === 'visual' ? (
              <div>
                <div style={{ background: '#080d1a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: inspectionResult.defect_detected ? '#ef4444' : '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {inspectionResult.defect_detected ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                      {inspectionResult.defect_details.defect_type}
                    </span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(56, 189, 248, 0.12)', padding: '2px 8px', borderRadius: '4px', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.25)', fontFamily: 'monospace', fontWeight: 600 }}>
                      Confidence: {(inspectionResult.defect_details.confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>
                    {inspectionResult.defect_details.description}
                  </p>

                  <div style={{ background: '#050811', padding: '0.65rem', borderRadius: '4px', fontSize: '0.75rem', color: '#f8fafc', borderLeft: '3px solid #0284c7' }}>
                    <strong style={{ color: '#38bdf8' }}>Prescriptive Guidance:</strong> {inspectionResult.defect_details.recommended_action}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ background: '#080d1a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: inspectionResult.anomaly_score > 0.5 ? '#ef4444' : '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {inspectionResult.anomaly_score > 0.5 ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                      {inspectionResult.acoustic_status}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>
                      Sound Level: {inspectionResult.decibel_level_db} dB
                    </span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '0 0 0.75rem 0' }}>
                    Identified Acoustic Profile: <strong style={{ color: '#f8fafc' }}>{inspectionResult.identified_sound}</strong>
                  </p>

                  <div style={{ background: '#050811', padding: '0.65rem', borderRadius: '4px', fontSize: '0.75rem', color: '#f8fafc', borderLeft: '3px solid #0284c7' }}>
                    <strong style={{ color: '#38bdf8' }}>Acoustic Recommendation:</strong> {inspectionResult.recommendation}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.82rem' }}>
              Select an inspection target and click 'Execute Inspection' to run neural network inference.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
