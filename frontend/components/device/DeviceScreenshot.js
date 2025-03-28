import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

const DeviceScreenshot = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [error, setError] = useState(null);
  const screenshotRef = useRef(null);

  // Capture screen using html2canvas
  const captureScreen = async () => {
    try {
      setIsCapturing(true);
      setError(null);

      // Capture the entire screen
      const canvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        logging: false,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        scale: 1,
      });

      // Convert canvas to data URL
      const screenshotUrl = canvas.toDataURL('image/png');
      setScreenshot(screenshotUrl);
      
      // Success message or notification could be added here
    } catch (error) {
      console.error('Screenshot error:', error);
      setError('Failed to capture screenshot. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    // Clear current screenshot to allow taking a new one
    setScreenshot(null);
    setError(null);
  };

  // Download the screenshot
  const handleDownload = () => {
    if (!screenshot) return;

    const link = document.createElement('a');
    link.href = screenshot;
    link.download = `device-screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
    link.click();
  };

  // Copy screenshot to clipboard
  const handleCopyToClipboard = async () => {
    try {
      if (!screenshot) return;

      // Fetch the image as a blob
      const response = await fetch(screenshot);
      const blob = await response.blob();
      
      // Create a ClipboardItem
      const item = new ClipboardItem({ 'image/png': blob });
      
      // Write to clipboard
      await navigator.clipboard.write([item]);
      
      // Alert user of success (in a real app, this would be a toast notification)
      alert('Screenshot copied to clipboard!');
    } catch (error) {
      console.error('Copy to clipboard error:', error);
      alert('Failed to copy screenshot to clipboard. Your browser may not support this feature.');
    }
  };

  return (
    <div className="device-screenshot-container">
      <div className="device-screenshot-header-wrapper">
        <i className="device-screenshot-icon">📷</i>
        <h3 className="device-screenshot-header">Device Screenshot</h3>
        <button 
          className="device-screenshot-refresh-button"
          onClick={handleRefresh}
          disabled={isCapturing}
          title="Refresh"
        >
          <i className="device-screenshot-refresh-icon">🔄</i>
        </button>
      </div>
      
      {error && (
        <div className="device-screenshot-error">
          {error}
        </div>
      )}
      
      <div className="device-screenshot-content">
        {screenshot ? (
          <div className="device-screenshot-result">
            <div className="device-screenshot-image-container" ref={screenshotRef}>
              <img 
                src={screenshot} 
                alt="Screenshot" 
                className="device-screenshot-image" 
              />
            </div>
            <div className="device-screenshot-actions">
              <button 
                className="device-screenshot-action-button" 
                onClick={handleDownload}
                title="Download Screenshot"
              >
                <i className="device-screenshot-action-icon">💾</i>
                Download
              </button>
              <button 
                className="device-screenshot-action-button"
                onClick={handleCopyToClipboard}
                title="Copy to Clipboard"
              >
                <i className="device-screenshot-action-icon">📋</i>
                Copy
              </button>
              <button 
                className="device-screenshot-action-button"
                onClick={handleRefresh}
                title="Take New Screenshot"
              >
                <i className="device-screenshot-action-icon">🔄</i>
                New
              </button>
            </div>
          </div>
        ) : (
          <div className="device-screenshot-placeholder">
            <button 
              className={`device-screenshot-button ${isCapturing ? 'loading' : ''}`}
              onClick={captureScreen}
              disabled={isCapturing}
            >
              <i className="device-screenshot-button-icon">📷</i>
              {isCapturing ? 'Taking Screenshot...' : 'Take Screenshot'}
              {isCapturing && <span className="loading-spinner"></span>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceScreenshot; 