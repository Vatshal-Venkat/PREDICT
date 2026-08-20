import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FleetOverview from './components/FleetOverview';
import FaultInjector from './components/FaultInjector';
import TelemetryChart from './components/TelemetryChart';
import WorkOrderCenter from './components/WorkOrderCenter';
import ChatAssistant from './components/ChatAssistant';
import SignalXaiView from './components/SignalXaiView';
import VisualAcousticInspector from './components/VisualAcousticInspector';
import { LayoutDashboard, FileText, MessageSquare, Activity, Camera, Wifi } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('Engineer');
  const [apiStatus, setApiStatus] = useState('connecting');
  const [config, setConfig] = useState(null);
  const [fleetSummary, setFleetSummary] = useState({});
  const [machines, setMachines] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedMachineId, setSelectedMachineId] = useState('CNC-MILL-01');
  const [machineHistory, setMachineHistory] = useState([]);
  const [isInjecting, setIsInjecting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [wsStreaming, setWsStreaming] = useState(false);

  const API_BASE = '';

  const fetchFleetData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/fleet`);
      if (res.ok) {
        const data = await res.json();
        setFleetSummary(data.summary || {});
        const machineList = data.machines || [];
        setMachines(machineList);
        if (machineList.length > 0 && !machineList.some(m => m.machine_id === selectedMachineId)) {
          setSelectedMachineId(machineList[0].machine_id);
        }
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch (err) {
      console.error('Error fetching fleet state:', err);
      setApiStatus('offline');
    }
  };

  const fetchWorkOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/work-orders`);
      if (res.ok) {
        const data = await res.json();
        setWorkOrders(data.work_orders || []);
      }
    } catch (err) {
      console.error('Error fetching work orders:', err);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/config`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  };

  const fetchMachineHistory = async (mId) => {
    try {
      const res = await fetch(`${API_BASE}/api/machine/${mId}/history`);
      if (res.ok) {
        const data = await res.json();
        setMachineHistory(data.history || []);
      }
    } catch (err) {
      console.error(`Error fetching history for ${mId}:`, err);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchFleetData();
    fetchWorkOrders();
  }, []);

  useEffect(() => {
    if (selectedMachineId) {
      fetchMachineHistory(selectedMachineId);
    }
  }, [selectedMachineId]);

  // WebSocket Live Telemetry Streaming Client
  useEffect(() => {
    if (!wsStreaming) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/telemetry`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'telemetry_update') {
          if (data.fleet_summary) {
            setFleetSummary(data.fleet_summary);
          }
          fetchFleetData();
          if (data.machine_id === selectedMachineId) {
            fetchMachineHistory(selectedMachineId);
          }
        }
      } catch (e) {
        console.error('WebSocket parse error:', e);
      }
    };

    return () => {
      ws.close();
    };
  }, [wsStreaming, selectedMachineId]);

  const handleInjectTelemetry = async (payload) => {
    setIsInjecting(true);
    try {
      const res = await fetch(`${API_BASE}/api/telemetry/inject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.fleet) {
          setFleetSummary(data.fleet.summary || {});
          setMachines(data.fleet.machines || []);
        }
        await fetchWorkOrders();
        await fetchMachineHistory(payload.machine_id);
        setIsInjecting(false);
        return data;
      }
    } catch (err) {
      console.error('Error injecting telemetry:', err);
    }
    setIsInjecting(false);
    return null;
  };

  const handleResetSimulation = async () => {
    setIsResetting(true);
    try {
      const res = await fetch(`${API_BASE}/api/reset`, { method: 'POST' });
      if (res.ok) {
        await fetchFleetData();
        await fetchWorkOrders();
        await fetchMachineHistory(selectedMachineId);
      }
    } catch (err) {
      console.error('Error resetting simulation:', err);
    }
    setIsResetting(false);
  };

  const handleSendMessage = async (message) => {
    setIsChatting(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsChatting(false);
        return data;
      }
    } catch (err) {
      console.error('Error in chat assistant:', err);
    }
    setIsChatting(false);
    return { response: 'Backend service communication error.' };
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        apiStatus={apiStatus}
        onReset={handleResetSimulation}
        isResetting={isResetting}
        userRole={userRole}
        onRoleChange={setUserRole}
      />

      {/* Main Tab Navigation Bar */}
      <nav className="tab-nav">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <LayoutDashboard size={16} />
          Fleet Overview & Telemetry
        </button>

        <button
          onClick={() => setActiveTab('signal-xai')}
          className={`tab-btn ${activeTab === 'signal-xai' ? 'active' : ''}`}
        >
          <Activity size={16} />
          FFT Signal & SHAP XAI
        </button>

        <button
          onClick={() => setActiveTab('multimodal')}
          className={`tab-btn ${activeTab === 'multimodal' ? 'active' : ''}`}
        >
          <Camera size={16} />
          Visual & Acoustic Defect AI
        </button>

        <button
          onClick={() => setActiveTab('work-orders')}
          className={`tab-btn ${activeTab === 'work-orders' ? 'active' : ''}`}
        >
          <FileText size={16} />
          CMMS Work Orders & Inventory
          {workOrders.length > 0 && (
            <span style={{ padding: '2px 6px', borderRadius: '10px', background: '#ef4444', color: 'white', fontSize: '0.65rem', fontFamily: 'monospace' }}>
              {workOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
        >
          <MessageSquare size={16} />
          RAG AI Maintenance Assistant
        </button>

        {/* WebSocket Stream Live Toggle Button */}
        <button
          onClick={() => setWsStreaming(!wsStreaming)}
          style={{
            marginLeft: 'auto',
            background: wsStreaming ? '#10b98122' : '#1e293b',
            color: wsStreaming ? '#10b981' : '#94a3b8',
            border: `1px solid ${wsStreaming ? '#10b981' : '#334155'}`,
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Wifi size={14} style={{ color: wsStreaming ? '#10b981' : '#94a3b8' }} />
          WebSocket Stream: {wsStreaming ? 'LIVE TICKER' : 'OFF'}
        </button>
      </nav>

      {/* Content Area */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <FleetOverview
            summary={fleetSummary}
            machines={machines}
            selectedMachineId={selectedMachineId}
            onSelectMachine={(mId) => setSelectedMachineId(mId)}
          />

          <div className="grid-main">
            <div>
              <FaultInjector
                config={config}
                selectedMachineId={selectedMachineId}
                onInject={handleInjectTelemetry}
                isInjecting={isInjecting}
              />
            </div>

            <div>
              <TelemetryChart machineId={selectedMachineId} history={machineHistory} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'signal-xai' && (
        <SignalXaiView selectedMachineId={selectedMachineId} />
      )}

      {activeTab === 'multimodal' && (
        <VisualAcousticInspector />
      )}

      {activeTab === 'work-orders' && (
        <WorkOrderCenter workOrders={workOrders} />
      )}

      {activeTab === 'chat' && (
        <ChatAssistant onSendMessage={handleSendMessage} isChatting={isChatting} />
      )}
    </div>
  );
}
