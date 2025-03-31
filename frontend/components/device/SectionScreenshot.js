import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

const SectionScreenshot = ({ title, targetRef }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [error, setError] = useState(null);
  const screenshotRef = useRef(null);

  // Capture specific section using html2canvas
  const captureSection = async () => {
    try {
      if (!targetRef || !targetRef.current) {
        throw new Error('No target element specified for screenshot');
      }

      setIsCapturing(true);
      setError(null);

      // Capture the specified section
      const element = targetRef.current;
      const canvas = await html2canvas(element, {
        allowTaint: true,
        useCORS: true,
        logging: false,
        scale: 2, // Higher quality
        backgroundColor: '#ffffff',
      });

      // Convert canvas to data URL
      const screenshotUrl = canvas.toDataURL('image/png');
      setScreenshot(screenshotUrl);
      
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
    const filename = title 
      ? `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`
      : `section-screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
    
    link.download = filename;
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
      
      // Show success message
      setActionMessage({ type: 'success', text: 'Screenshot copied to clipboard!' });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (error) {
      console.error('Copy to clipboard error:', error);
      setActionMessage({ type: 'error', text: 'Failed to copy screenshot to clipboard' });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // Action message state for notifications
  const [actionMessage, setActionMessage] = useState(null);

  return (
    <div className="section-screenshot-container">
      <div className="section-screenshot-header-wrapper">
        <i className="section-screenshot-icon">📷</i>
        <h3 className="section-screenshot-header">{title || 'Section Screenshot'}</h3>
        {screenshot && (
          <button 
            className="section-screenshot-refresh-button"
            onClick={handleRefresh}
            disabled={isCapturing}
            title="New Screenshot"
          >
            <i className="section-screenshot-refresh-icon">🔄</i>
          </button>
        )}
      </div>
      
      {error && (
        <div className="section-screenshot-error">
          {error}
        </div>
      )}

      {actionMessage && (
        <div className={`section-screenshot-message ${actionMessage.type}`}>
          {actionMessage.text}
        </div>
      )}
      
      <div className="section-screenshot-content">
        {screenshot ? (
          <div className="section-screenshot-result">
            <div className="section-screenshot-image-container" ref={screenshotRef}>
              <img 
                src={screenshot} 
                alt="Screenshot" 
                className="section-screenshot-image" 
              />
            </div>
            <div className="section-screenshot-actions">
              <button 
                className="section-screenshot-action-button" 
                onClick={handleDownload}
                title="Download Screenshot"
              >
                <i className="section-screenshot-action-icon">💾</i>
                Download
              </button>
              <button 
                className="section-screenshot-action-button"
                onClick={handleCopyToClipboard}
                title="Copy to Clipboard"
              >
                <i className="section-screenshot-action-icon">📋</i>
                Copy
              </button>
              <button 
                className="section-screenshot-action-button"
                onClick={handleRefresh}
                title="Take New Screenshot"
              >
                <i className="section-screenshot-action-icon">🔄</i>
                New
              </button>
            </div>
          </div>
        ) : (
          <div className="section-screenshot-placeholder">
            <button 
              className={`section-screenshot-button ${isCapturing ? 'loading' : ''}`}
              onClick={captureSection}
              disabled={isCapturing}
            >
              <i className="section-screenshot-button-icon">📷</i>
              {isCapturing ? 'Taking Screenshot...' : 'Capture This Section'}
              {isCapturing && <span className="loading-spinner"></span>}
            </button>
            <p className="section-screenshot-help-text">
              This will capture only the specified section
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionScreenshot; 