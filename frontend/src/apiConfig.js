/**
 * Central API & WebSocket configuration for Predictive Maintenance Frontend.
 * In production (Vercel), requests will automatically proxy via vercel.json rewrites or use VITE_API_BASE / REACT_APP_API_BASE environment variable.
 */

const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.VITE_API_BASE) return process.env.VITE_API_BASE.replace(/\/$/, '');
    if (process.env.REACT_APP_API_BASE) return process.env.REACT_APP_API_BASE.replace(/\/$/, '');
    if (process.env.API_BASE) return process.env.API_BASE.replace(/\/$/, '');
  }
  return '';
};

export const API_BASE = getApiBaseUrl();

export const getWsUrl = () => {
  if (API_BASE) {
    const wsProto = API_BASE.startsWith('https') ? 'wss:' : 'ws:';
    const cleanUrl = API_BASE.replace(/^https?:\/\//, '');
    return `${wsProto}//${cleanUrl}/ws/telemetry`;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/telemetry`;
};
