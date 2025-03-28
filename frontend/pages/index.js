// frontend/pages/index.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  const [systemInfo, setSystemInfo] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Connect to WebSocket backend
    const socket = new WebSocket('ws://localhost:3000');

    socket.onopen = () => {
      console.log('WebSocket connection established');
      setConnected(true);
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          setError(data.error);
        } else {
          setSystemInfo(data);
          setError(null);
        }
      } catch (error) {
        console.error('Error parsing system info:', error);
        setError('Failed to parse system data');
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Failed to connect to server');
      setConnected(false);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
      setConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  // Format bytes to human-readable size
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // RAM usage percentage for progress bar
  const ramUsagePercentage = systemInfo?.ram?.usagePercentage || 0;
  
  // Get color for RAM usage progress bar
  const getRamUsageColor = (percentage) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Head>
        <title>Spectrio Device Management System</title>
      </Head>
      
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">Spectrio Device Management</h1>
        
        <div className="space-y-4">
          <Link href="/device-management" className="block w-full py-3 px-4 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors">
            Device Management UI
          </Link>
          
          <div className="text-center text-sm text-gray-600 mt-4">
            <p>Click the button above to access the Device Management interface</p>
            <p className="mt-2">This is a test project for Spectrio</p>
          </div>
        </div>
      </div>
    </div>
  );
}
