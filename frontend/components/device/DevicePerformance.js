import React, { useState, useEffect } from 'react';
import PerformanceGraph from './PerformanceGraph';

const DevicePerformance = ({ deviceInfo }) => {
  const [cpuData, setCpuData] = useState(null);
  const [ramData, setRamData] = useState(null);

  // Update data when deviceInfo changes
  useEffect(() => {
    if (!deviceInfo) return;

    // Get CPU load data
    if (deviceInfo.cpu && typeof deviceInfo.cpu.loadAverage !== 'undefined') {
      setCpuData({
        value: deviceInfo.cpu.loadAverage,
        unit: '',
        thresholds: {
          warning: 1.0,
          critical: 2.0
        },
        format: (value) => value.toFixed(2)
      });
    }

    // Get RAM usage data
    if (deviceInfo.ram) {
      const total = deviceInfo.ram.total;
      const used = deviceInfo.ram.used;
      // Only calculate this if total is non-zero to prevent division by zero
      if (total > 0) {
        const usagePercent = Math.round((used / total) * 100);
        
        setRamData({
          value: usagePercent,
          unit: '%',
          thresholds: {
            warning: 70,
            critical: 90
          },
          format: (value) => `${value}%`
        });
      }
    }
  }, [deviceInfo]); // Only depends on deviceInfo

  return (
    <div className="device-performance-container">
      <div className="device-performance-header-wrapper">
        <i className="device-performance-icon">📊</i>
        <h3 className="device-performance-header">Performance Metrics</h3>
      </div>
      
      <div className="device-performance-content">
        <div className="device-performance-grid">
          <div className="device-performance-column">
            <PerformanceGraph
              title="CPU Load Average"
              data={cpuData}
              type="line"
              color="#e74c3c"
            />
          </div>
          <div className="device-performance-column">
            <PerformanceGraph
              title="Memory Usage"
              data={ramData}
              type="bar"
              color="#3498db"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicePerformance; 