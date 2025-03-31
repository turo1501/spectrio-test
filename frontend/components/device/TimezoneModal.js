import React, { useState, useEffect } from 'react';

// List of common timezones
const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh (GMT+7)' },
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (GMT+7)' },
  { value: 'Asia/Jakarta', label: 'Asia/Jakarta (GMT+7)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (GMT+8)' },
  { value: 'Asia/Kuala_Lumpur', label: 'Asia/Kuala_Lumpur (GMT+8)' },
  { value: 'Asia/Manila', label: 'Asia/Manila (GMT+8)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (GMT+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (GMT+11)' },
  { value: 'Europe/London', label: 'Europe/London (GMT+1)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (GMT+2)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (GMT+2)' },
  { value: 'America/New_York', label: 'America/New_York (GMT-4)' },
  { value: 'America/Chicago', label: 'America/Chicago (GMT-5)' },
  { value: 'America/Denver', label: 'America/Denver (GMT-6)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (GMT-7)' },
];

const TimezoneModal = ({ deviceInfo, onClose, onSave }) => {
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTimezones, setFilteredTimezones] = useState(TIMEZONES);
  const [currentTime, setCurrentTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize with current browser timezone
  useEffect(() => {
    try {
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setSelectedTimezone(browserTimezone);
      
      // Update current time
      const timer = setInterval(() => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString());
      }, 1000);
      
      return () => clearInterval(timer);
    } catch (error) {
      console.error('Error getting browser timezone:', error);
      setSelectedTimezone('UTC');
    }
  }, []);

  // Filter timezones based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredTimezones(TIMEZONES);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = TIMEZONES.filter(tz => 
        tz.label.toLowerCase().includes(query) || 
        tz.value.toLowerCase().includes(query)
      );
      setFilteredTimezones(filtered);
    }
  }, [searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTimezoneChange = (e) => {
    setSelectedTimezone(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);

      // In a real application, this would make an API call to update the timezone
      // For this demo, we'll simulate a network request with a timeout
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, data: { timezone: selectedTimezone } });
        }, 1000);
      });

      if (response.success) {
        onSave(selectedTimezone);
      } else {
        throw new Error('Failed to update timezone');
      }
    } catch (error) {
      console.error('Timezone update error:', error);
      setError(error.message || 'An error occurred while updating timezone');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Set Device Timezone</h3>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {error && (
            <div className="modal-error-message">
              {error}
            </div>
          )}
          
          <div className="timezone-current-info">
            <div className="timezone-current-time">
              <strong>Current Time:</strong> {currentTime}
            </div>
            <div className="timezone-current-zone">
              <strong>Current Timezone:</strong> {selectedTimezone || 'Not set'}
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="timezone-search">Search Timezones</label>
              <input
                type="text"
                id="timezone-search"
                value={searchQuery}
                onChange={handleSearch}
                className="form-control"
                placeholder="Search for a timezone..."
              />
            </div>
            
            <div className="form-group timezone-select-container">
              <label htmlFor="timezone">Select Timezone</label>
              <select
                id="timezone"
                value={selectedTimezone}
                onChange={handleTimezoneChange}
                className="form-control"
                required
                size={8}
              >
                {filteredTimezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="modal-button secondary" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="modal-button primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Set Timezone'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TimezoneModal; 