import React, { useState, useEffect } from 'react';

const PerformanceGraph = ({ title, data, type = 'line', color = '#3fbcad' }) => {
  const [graphData, setGraphData] = useState([]);
  const [maxValue, setMaxValue] = useState(100);
  
  // Process data for the graph when data changes
  useEffect(() => {
    if (!data || !data.value) return;
    
    const newDataPoint = {
      value: data.value,
      timestamp: new Date().toLocaleTimeString()
    };
    
    const newMaxValue = data.value > maxValue ? Math.ceil(data.value / 10) * 10 : maxValue;
    
    setGraphData(prevData => {
      const updatedData = [...prevData, newDataPoint];
      if (updatedData.length > 10) {
        return updatedData.slice(updatedData.length - 10);
      }
      return updatedData;
    });
    
    if (newMaxValue !== maxValue) {
      setMaxValue(newMaxValue);
    }
  }, [data]); 
  
  const calculateHeight = (value) => {
    const percentage = (value / maxValue) * 100;
    return Math.max(1, percentage);
  };
  
  
  const getValueColor = (value) => {
    if (!data || !data.thresholds) return color;
    
    const { warning, critical } = data.thresholds;
    if (value >= critical) return '#e74c3c';
    if (value >= warning) return '#f39c12';
    return color;
  };
  
  // Render loading state if no data
  if (graphData.length === 0) {
    return (
      <div className="performance-graph-container">
        <div className="performance-graph-header">
          <h3 className="performance-graph-title">{title}</h3>
          <span className="performance-graph-value">--</span>
        </div>
        <div className="performance-graph-content">
          <div className="performance-graph-loading">
            Waiting for data...
          </div>
        </div>
      </div>
    );
  }
  
  const currentValue = graphData[graphData.length - 1].value;
  const currentValueDisplay = data.format 
    ? data.format(currentValue) 
    : `${currentValue}${data.unit || ''}`;
  
  return (
    <div className="performance-graph-container">
      <div className="performance-graph-header">
        <h3 className="performance-graph-title">{title}</h3>
        <span 
          className="performance-graph-value"
          style={{ color: getValueColor(currentValue) }}
        >
          {currentValueDisplay}
        </span>
      </div>
      
      <div className="performance-graph-content">
        {type === 'bar' ? (
          <div className="performance-graph-bars">
            {graphData.map((point, index) => (
              <div 
                key={index} 
                className="performance-graph-bar-wrapper"
                title={`${point.value}${data.unit || ''} at ${point.timestamp}`}
              >
                <div 
                  className="performance-graph-bar"
                  style={{ 
                    height: `${calculateHeight(point.value)}%`,
                    backgroundColor: getValueColor(point.value)
                  }}
                ></div>
                <span className="performance-graph-timestamp">
                  {point.timestamp.slice(-5)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="performance-graph-line">
            <svg 
              viewBox={`0 0 ${(graphData.length - 1) * 10} 100`}
              preserveAspectRatio="none"
              className="performance-graph-svg"
            >
              <polyline
                points={graphData.map((point, index) => 
                  `${index * 10},${100 - calculateHeight(point.value)}`
                ).join(' ')}
                fill="none"
                stroke={color}
                strokeWidth="2"
              />
            </svg>
            
            <div className="performance-graph-points">
              {graphData.map((point, index) => (
                <div 
                  key={index}
                  className="performance-graph-point-wrapper"
                  style={{ left: `${(index / (graphData.length - 1)) * 100}%` }}
                  title={`${point.value}${data.unit || ''} at ${point.timestamp}`}
                >
                  <div 
                    className="performance-graph-point"
                    style={{ 
                      bottom: `${calculateHeight(point.value)}%`,
                      backgroundColor: getValueColor(point.value)
                    }}
                  ></div>
                </div>
              ))}
            </div>
            
            <div className="performance-graph-timestamps">
              {graphData.map((point, index) => (
                <span 
                  key={index}
                  className="performance-graph-timestamp"
                  style={{ left: `${(index / (graphData.length - 1)) * 100}%` }}
                >
                  {point.timestamp.slice(-5)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceGraph; 