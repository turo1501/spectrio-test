import React, { useState } from 'react';

const EditInfoModal = ({ deviceInfo, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: deviceInfo?.hostName || '',
    description: '',
    location: deviceInfo?.location || 'Hanoi - Vietnam - Asia',
    model: deviceInfo?.cpu?.model || 'Apple M1 Pro',
    tags: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);

      // In a real application, this would make an API call to update the device information
      // For this demo, we'll simulate a network request with a timeout
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, data: formData });
        }, 1000);
      });

      if (response.success) {
        onSave(formData);
      } else {
        throw new Error('Failed to update device information');
      }
    } catch (error) {
      console.error('Edit device error:', error);
      setError(error.message || 'An error occurred while updating device information');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Edit Device Information</h3>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {error && (
            <div className="modal-error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Device Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="model">Model</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="tags">Tags (comma separated)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., production, server, critical"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                rows={3}
                placeholder="Enter device description..."
              />
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditInfoModal; 