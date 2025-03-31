import React, { useState } from 'react';
import EditInfoModal from './EditInfoModal';
import TimezoneModal from './TimezoneModal';

const DeviceControl = ({ deviceInfo, onRefresh }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [isRebooting, setIsRebooting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Handle reboot action
  const handleReboot = async () => {
    try {
      setIsRebooting(true);
      setActionMessage({ type: 'info', text: 'Rebooting device...' });
      
      // Make API call to backend to trigger reboot
      const response = await fetch('http://localhost:3000/api/device/reboot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: deviceInfo?.macAddress || 'unknown',
        }),
      });
      
      if (response.ok) {
        setActionMessage({ type: 'success', text: 'Reboot command sent successfully' });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reboot device');
      }
    } catch (error) {
      console.error('Reboot error:', error);
      setActionMessage({ type: 'error', text: error.message || 'Failed to reboot device' });
    } finally {
      // In a real application, the reboot would take time to complete
      // Here we're just simulating the process
      setTimeout(() => {
        setIsRebooting(false);
        // Clear message after 3 seconds
        setTimeout(() => setActionMessage(null), 3000);
      }, 2000);
    }
  };

  // Handle refresh action
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setActionMessage({ type: 'info', text: 'Refreshing device information...' });
      
      // Call the onRefresh callback to fetch fresh data
      if (onRefresh && typeof onRefresh === 'function') {
        await onRefresh();
        setActionMessage({ type: 'success', text: 'Device information refreshed' });
      } else {
        throw new Error('Refresh function not available');
      }
    } catch (error) {
      console.error('Refresh error:', error);
      setActionMessage({ type: 'error', text: error.message || 'Failed to refresh device information' });
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
        // Clear message after 3 seconds
        setTimeout(() => setActionMessage(null), 3000);
      }, 1000);
    }
  };

  // Open edit info modal
  const handleEditInfo = () => {
    setShowEditModal(true);
  };

  // Open timezone modal
  const handleTimezone = () => {
    setShowTimezoneModal(true);
  };

  const controlActions = [
    { 
      icon: '⟳', 
      label: 'Reboot', 
      action: handleReboot,
      isLoading: isRebooting,
      loadingText: 'Rebooting...'
    },
    { 
      icon: '↻', 
      label: 'Refresh', 
      action: handleRefresh,
      isLoading: isRefreshing,
      loadingText: 'Refreshing...'
    },
    { 
      icon: '✎', 
      label: 'Edit Info', 
      action: handleEditInfo,
      isLoading: false
    },
    { 
      icon: '🕒', 
      label: 'Timezone', 
      action: handleTimezone,
      isLoading: false
    },
  ];

  return (
    <div className="device-control-container">
      <div className="device-control-header-wrapper">
        <i className="device-control-icon">✏️</i>
        <h3 className="device-control-header">Manage Device</h3>
      </div>

      {actionMessage && (
        <div className={`device-control-message ${actionMessage.type}`}>
          {actionMessage.text}
        </div>
      )}

      <div className="device-control-section">
        <div className="device-control-section-header">DEVICE CONTROL</div>
        <div className="device-control-buttons">
          {controlActions.map((action, index) => (
            <button 
              key={index} 
              className={`device-control-button ${action.isLoading ? 'loading' : ''}`}
              onClick={action.action}
              disabled={action.isLoading}
            >
              <i className="device-control-button-icon">{action.icon}</i>
              <span className="device-control-button-label">
                {action.isLoading ? action.loadingText : action.label}
              </span>
              {action.isLoading && (
                <span className="loading-spinner"></span>
              )}
            </button>
          ))}
        </div>
      </div>

     

      {/* Edit Info Modal */}
      {showEditModal && (
        <EditInfoModal 
          deviceInfo={deviceInfo}
          onClose={() => setShowEditModal(false)}
          onSave={(data) => {
            console.log('Saving device info:', data);
            setShowEditModal(false);
            setActionMessage({ type: 'success', text: 'Device information updated' });
            setTimeout(() => setActionMessage(null), 3000);
          }}
        />
      )}

      {/* Timezone Modal */}
      {showTimezoneModal && (
        <TimezoneModal 
          deviceInfo={deviceInfo}
          onClose={() => setShowTimezoneModal(false)}
          onSave={(timezone) => {
            console.log('Setting timezone:', timezone);
            setShowTimezoneModal(false);
            setActionMessage({ type: 'success', text: 'Timezone updated' });
            setTimeout(() => setActionMessage(null), 3000);
          }}
        />
      )}
    </div>
  );
};

export default DeviceControl; 