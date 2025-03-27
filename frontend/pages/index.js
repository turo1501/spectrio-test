// frontend/pages/index.js
import { useEffect, useState } from 'react';

export default function Home() {
  const [systemInfo, setSystemInfo] = useState(null);

  useEffect(() => {
    // Kết nối tới WebSocket backend (đảm bảo backend chạy trên port 3001)
    const socket = new WebSocket('ws://localhost:3000');

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setSystemInfo(data);
      } catch (error) {
        console.error('Error parsing system info:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">System Monitoring Dashboard</h1>
      {systemInfo ? (
        <div className="max-w-2xl mx-auto bg-white shadow p-6 rounded">
          <h2 className="text-xl font-semibold mb-4">System Information</h2>
          <ul className="space-y-2">
            <li><strong>Monitors Connected:</strong> {systemInfo.monitors}</li>
            <li>
              <strong>RAM:</strong> Total: {systemInfo.ram.total} MB, Used: {systemInfo.ram.used} MB, Free: {systemInfo.ram.free} MB
            </li>
            <li><strong>Load Average:</strong> {systemInfo.loadAverage}</li>
            <li><strong>Operating System:</strong> {systemInfo.operatingSystem}</li>
            <li><strong>System Uptime:</strong> {Math.round(systemInfo.uptime)} seconds</li>
            <li>
              <strong>CPU Info:</strong>
              <pre className="text-xs mt-2 bg-gray-50 p-2 rounded">
                {JSON.stringify(systemInfo.cpuInfo, null, 2)}
              </pre>
            </li>
          </ul>
        </div>
      ) : (
        <div className="text-center">Waiting for system data...</div>
      )}
    </div>
  );
}
