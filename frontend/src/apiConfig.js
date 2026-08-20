/**
 * Central API & WebSocket configuration for Predictive Maintenance Frontend.
 */

const rawApiBase =
  process.env.VITE_API ||
  process.env.VITE_API_BASE ||
  process.env.VITE_API_URL ||
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_URL ||
  process.env.API_BASE ||
  '';

export const API_BASE = rawApiBase ? rawApiBase.replace(/\/$/, '') : '';

export const getWsUrl = () => {
  if (API_BASE) {
    const wsProto = API_BASE.startsWith('https') ? 'wss:' : 'ws:';
    const cleanUrl = API_BASE.replace(/^https?:\/\//, '');
    return `${wsProto}//${cleanUrl}/ws/telemetry`;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/telemetry`;
};
