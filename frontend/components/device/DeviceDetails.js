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
    const ampm = hours >= 12 ? 'AM' : 'AM';
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
              <td>You need administrator access to run this tool... exiting!</td>
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
              <td>Hanoi - Vietnam - Asia</td>
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
    </div>
  );
};

export default DeviceDetails; 