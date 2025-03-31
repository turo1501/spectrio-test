import React from 'react';

const DeviceDetails = ({ deviceInfo }) => {
  // Check if deviceInfo is available
  if (!deviceInfo) {
    return (
      <div className="device-details-container">
        <h3 className="device-details-header">Device Details</h3>
        <div className="device-details-loading">Loading device information...</div>
      </div>
    );
  }

  // Format MAC address to match BC:D0:74:5C:37:E4 format
  const formatMacAddress = (mac) => {
    return mac ? mac.toUpperCase().replace(/:/g, ':') : 'Unknown';
  };

  // Get formatted current time
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `Today at ${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const getResolution = () => {
    if (deviceInfo.displayInfo && deviceInfo.displayInfo.length > 0) {
      const primaryDisplay = deviceInfo.displayInfo[0];
      return primaryDisplay.resolution ? primaryDisplay.resolution.toUpperCase() : 'Unknown';
    }
    return 'Unknown';
  };
  
  // Format location data
  const getFormattedLocation = () => {
    if (deviceInfo.location) {
      const { city, region, country } = deviceInfo.location;
      const locationParts = [city, region, getCountryName(country)].filter(Boolean);
      return locationParts.join(' - ');
    }
    return 'Unknown Location';
  };
  
  // Convert country code to name
  const getCountryName = (countryCode) => {
    const countries = {
      'US': 'United States',
      'VN': 'Vietnam',
      'CA': 'Canada',
      'UK': 'United Kingdom',
      'AU': 'Australia',
      // Add more as needed
    };
    return countries[countryCode] || countryCode;
  };
  
  // Format RAM usage with percentage
  const formatRamUsage = () => {
    if (!deviceInfo.ram) return 'Unknown';
    
    const { usagePercentage, used, total } = deviceInfo.ram;
    const usedGB = Math.round(used / 1024 * 10) / 10;
    const totalGB = Math.round(total / 1024 * 10) / 10;
    
    return `${usedGB}GB / ${totalGB}GB (${usagePercentage}%)`;
  };
  
  // Format CPU usage with percentage
  const formatCpuUsage = () => {
    if (!deviceInfo.cpu) return 'Unknown';
    
    const { loadAverage, cores } = deviceInfo.cpu;
    
    return `${loadAverage}% (${cores} cores)`;
  };

  // Create a device name based on host and MAC
  const deviceName = `Device - ${formatMacAddress(deviceInfo.macAddress)}`;

  return (
    <div className="device-details-container">
      <div className="device-details-header-wrapper">
        <i className="device-details-icon">i</i>
        <h3 className="device-details-header">Device Details</h3>
      </div>
      <div className="device-details-content">
        <table className="device-details-table">
          <tbody>
            <tr>
              <th>Name</th>
              <td>{deviceName}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>
                <span className="device-status-badge online">Online</span>
              </td>
            </tr>
            <tr>
              <th>First Connected</th>
              <td>{getCurrentTime()}</td>
            </tr>
            <tr>
              <th>Last Connected</th>
              <td>{getCurrentTime()}</td>
            </tr>
            <tr>
              <th>Tags</th>
              <td></td>
            </tr>
            <tr>
              <th>Last Status</th>
              <td>{getCurrentTime()}</td>
            </tr>
            <tr>
              <th>Shipping Date</th>
              <td></td>
            </tr>
            <tr>
              <th>Model</th>
              <td>{deviceInfo.cpu?.model || 'Unknown'}</td>
            </tr>
            <tr>
              <th>CPU Usage</th>
              <td>
                <div className="resource-usage">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{width: `${deviceInfo.cpu?.loadAverage || 0}%`,
                      backgroundColor: deviceInfo.cpu?.loadAverage > 80 ? '#ff4d4f' : 
                                     deviceInfo.cpu?.loadAverage > 60 ? '#faad14' : '#52c41a'}}
                    ></div>
                  </div>
                  <span>{formatCpuUsage()}</span>
                </div>
              </td>
            </tr>
            <tr>
              <th>RAM Usage</th>
              <td>
                <div className="resource-usage">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{width: `${deviceInfo.ram?.usagePercentage || 0}%`,
                      backgroundColor: deviceInfo.ram?.usagePercentage > 80 ? '#ff4d4f' : 
                                     deviceInfo.ram?.usagePercentage > 60 ? '#faad14' : '#52c41a'}}
                    ></div>
                  </div>
                  <span>{formatRamUsage()}</span>
                </div>
              </td>
            </tr>
            <tr>
              <th>MAC (WI-FI)</th>
              <td>{formatMacAddress(deviceInfo.macAddress)}</td>
            </tr>
            <tr>
              <th>MAC (LAN)</th>
              <td>{formatMacAddress(deviceInfo.macAddress)}</td>
            </tr>
            <tr>
              <th>Resolution</th>
              <td>{getResolution()}</td>
            </tr>
            <tr>
              <th>Displays</th>
              <td>
                Displays Connected: {deviceInfo.monitors || 1}
                {deviceInfo.displayInfo && deviceInfo.displayInfo.map((display, index) => (
                  <div key={index}>
                    {display.model || `Display ${index + 1}`} : {display.resolution || 'Unknown'} - Landscape
                  </div>
                ))}
              </td>
            </tr>
            <tr>
              <th>Timezone</th>
              <td>{deviceInfo.location?.timezone || 'Asia/Ho_Chi_Minh'}</td>
            </tr>
            <tr>
              <th>IP</th>
              <td>Public {deviceInfo.ipAddress || '127.0.0.1'}</td>
            </tr>
            <tr>
              <th>Firmware</th>
              <td>{deviceInfo.operatingSystem || 'Unknown'}</td>
            </tr>
            <tr>
              <th>Location</th>
              <td>{getFormattedLocation()}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td></td>
            </tr>
            <tr>
              <th>Secret</th>
              <td>
                <div className="secret-wrapper">
                  2o8GFZlhdz2NEZBATCQmLhbg
                  <button className="secret-copy-button">
                    <i className="secret-copy-icon">📋</i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .device-details-container {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 20px;
        }
        
        .device-details-header-wrapper {
          display: flex;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .device-details-icon {
          margin-right: 8px;
          color: #1890ff;
          font-style: normal;
          background: #e6f7ff;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        
        .device-details-header {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
        }
        
        .device-details-content {
          padding: 0;
        }
        
        .device-details-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .device-details-table th,
        .device-details-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
          text-align: left;
        }
        
        .device-details-table th {
          width: 35%;
          font-weight: 500;
          color: #666;
        }
        
        .device-status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .device-status-badge.online {
          background-color: #f6ffed;
          color: #52c41a;
          border: 1px solid #b7eb8f;
        }
        
        .secret-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .secret-copy-button {
          background: none;
          border: none;
          cursor: pointer;
          color: #1890ff;
          padding: 4px;
        }
        
        .progress-bar {
          height: 8px;
          background-color: #f5f5f5;
          border-radius: 4px;
          margin-bottom: 4px;
          overflow: hidden;
          width: 100%;
        }
        
        .progress-fill {
          height: 100%;
          background-color: #52c41a;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .resource-usage {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default DeviceDetails; 