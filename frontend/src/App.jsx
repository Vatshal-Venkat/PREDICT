import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FleetOverview from './components/FleetOverview';
import FaultInjector from './components/FaultInjector';
import TelemetryChart from './components/TelemetryChart';
import WorkOrderCenter from './components/WorkOrderCenter';
import ChatAssistant from './components/ChatAssistant';
import { LayoutDashboard, FileText, MessageSquare, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiStatus, setApiStatus] = useState('connecting');
  const [config, setConfig] = useState(null);
  const [fleetSummary, setFleetSummary] = useState({});
  const [machines, setMachines] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedMachineId, setSelectedMachineId] = useState('PUMP-101');
  const [machineHistory, setMachineHistory] = useState([]);
  const [isInjecting, setIsInjecting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isChatting, setIsChatting] = useState(false);

  // Base API URL (proxied by Vite or direct)
  const API_BASE = '';

  // Initial Data Fetching
  const fetchFleetData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/fleet`);
      if (res.ok) {
        const data = await res.json();
        setFleetSummary(data.summary || {});
        setMachines(data.machines || []);
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

  // Actions
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
    <div className="min-h-screen p-4 md:p-6 max-w-[1500px] mx-auto">
      {/* Top Header */}
      <Header apiStatus={apiStatus} onReset={handleResetSimulation} isResetting={isResetting} />

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'dashboard'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <LayoutDashboard size={16} />
          Fleet Overview & Live Telemetry
        </button>

        <button
          onClick={() => setActiveTab('work-orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition relative ${
            activeTab === 'work-orders'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FileText size={16} />
          Prescriptive Work Orders
          {workOrders.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-mono">
              {workOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'chat'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <MessageSquare size={16} />
          AI Maintenance Assistant
        </button>
      </div>

      {/* Main View Area */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <FleetOverview
            summary={fleetSummary}
            machines={machines}
            selectedMachineId={selectedMachineId}
            onSelectMachine={(mId) => setSelectedMachineId(mId)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <FaultInjector
                config={config}
                selectedMachineId={selectedMachineId}
                onInject={handleInjectTelemetry}
                isInjecting={isInjecting}
              />
            </div>

            <div className="lg:col-span-2">
              <TelemetryChart machineId={selectedMachineId} history={machineHistory} />
            </div>
          </div>
        </div>
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
