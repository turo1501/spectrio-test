import { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import DeviceDetails from '../components/device/DeviceDetails';
import DeviceScreenshot from '../components/device/DeviceScreenshot';
import DeviceControl from '../components/device/DeviceControl';
import SectionScreenshot from '../components/device/SectionScreenshot';
import DevicePerformance from '../components/device/DevicePerformance';

export default function DeviceManagement() {
  const [systemInfo, setSystemInfo] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [webSocket, setWebSocket] = useState(null);
  const deviceDetailsRef = useRef(null);
  const deviceControlRef = useRef(null);
  const performanceRef = useRef(null);

  // Initialize WebSocket connection
  const initWebSocket = useCallback(() => {
    // Close existing connection if any
    if (webSocket) {
      webSocket.close();
    }

    // Create new WebSocket connection
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

    // Store the socket in state
    setWebSocket(socket);

    // Clean up function
    return () => {
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }
    };
  }, []); // Remove webSocket from dependencies to prevent constant recreation

  // Initialize WebSocket on component mount
  useEffect(() => {
    const cleanup = initWebSocket();
    
    return () => {
      cleanup();
    };
  }, [initWebSocket]);

  // Handle device refresh
  const handleRefresh = useCallback(async () => {
    return new Promise((resolve, reject) => {
      try {
        // Close and reopen the WebSocket connection
        const cleanup = initWebSocket();
        
        // Resolve the promise after a short delay to allow new data to come in
        setTimeout(() => {
          resolve();
        }, 2000);
        
      } catch (error) {
        console.error('Refresh error:', error);
        reject(error);
      }
    });
  }, [initWebSocket]);

  // Handle device reboot API endpoint
  useEffect(() => {
    // Add API endpoint for reboot in the backend if it doesn't exist
    // This is just a placeholder for the frontend implementation
    const setupRebootEndpoint = async () => {
      try {
        // In a real application, you would set up a proper API handler on the server
        console.log('Setting up reboot endpoint for device control');
      } catch (error) {
        console.error('Failed to set up reboot endpoint:', error);
      }
    };

    setupRebootEndpoint();
  }, []);

  return (
    <>
      <Head>
        <title>Device Management - {systemInfo?.macAddress ? systemInfo.macAddress.toUpperCase() : 'Loading...'}</title>
      </Head>
      <div className="device-management-page">
        <div className="device-management-header">
          <div className="device-management-title-container">
            <h1 className="device-management-title">Device Management</h1>
            <span className="device-management-separator">›</span>
            <h2 className="device-management-subtitle">
              Device - {systemInfo?.macAddress ? systemInfo.macAddress.toUpperCase() : 'Loading...'}
            </h2>
          </div>
          {connected ? (
            <div className="device-management-connection-status connected">
              Connected
            </div>
          ) : (
            <div className="device-management-connection-status disconnected">
              Disconnected
            </div>
          )}
        </div>

        {error && (
          <div className="device-management-error">
            {error}
          </div>
        )}

        <div className="device-management-content">
          <div className="device-management-grid">
            <div className="device-management-left-column">
              <DeviceScreenshot />
              
              {/* Performance Metrics */}
              <div ref={performanceRef}>
                <DevicePerformance deviceInfo={systemInfo} />
              </div>
              
              <SectionScreenshot 
                title="Performance Screenshot" 
                targetRef={performanceRef} 
              />
              
              {/* Control Section */}
              <SectionScreenshot 
                title="Control Section Screenshot" 
                targetRef={deviceControlRef} 
              />
              
              <div ref={deviceControlRef}>
                <DeviceControl deviceInfo={systemInfo} onRefresh={handleRefresh} />
              </div>
            </div>
            <div className="device-management-right-column">
              <div ref={deviceDetailsRef}>
                <DeviceDetails deviceInfo={systemInfo} />
              </div>
              
              {/* Details Section Screenshot */}
              <SectionScreenshot 
                title="Details Section Screenshot" 
                targetRef={deviceDetailsRef} 
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 