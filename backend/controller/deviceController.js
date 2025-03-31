const systemService = require('../service/systemService');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * Get comprehensive device information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDeviceInfo = async (req, res) => {
  try {
    const systemInfo = await systemService.getSystemInfo();
    
    if (systemInfo.error) {
      throw new Error(systemInfo.message);
    }

    res.status(200).json({
      success: true,
      data: systemInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting device info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve device information',
      message: error.message
    });
  }
};

/**
 * Get specific device metric with validation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDeviceMetric = async (req, res) => {
  try {
    const { metric } = req.params;
    const validMetrics = ['cpu', 'ram', 'disk', 'network', 'display', 'os'];
    
    if (!validMetrics.includes(metric)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid metric',
        validMetrics
      });
    }

    const systemInfo = await systemService.getSystemInfo();
    
    if (systemInfo.error) {
      throw new Error(systemInfo.message);
    }

    const metricData = {
      cpu: systemInfo.cpu,
      ram: systemInfo.ram,
      disk: systemInfo.disk,
      network: systemInfo.network,
      display: {
        monitors: systemInfo.monitors,
        displayInfo: systemInfo.displayInfo
      },
      os: {
        operatingSystem: systemInfo.operatingSystem,
        uptime: systemInfo.uptime,
        hostName: systemInfo.hostName
      }
    };

    res.status(200).json({
      success: true,
      data: metricData[metric],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getDeviceMetric controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve device metric',
      message: error.message
    });
  }
};

/**
 * Reboot device with safety checks and platform-specific handling
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.rebootDevice = async (req, res) => {
  try {
    const { deviceId, force = false } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Device ID is required'
      });
    }

    // Validate device exists (in a real app, you'd check your database)
    const systemInfo = await systemService.getSystemInfo();
    if (systemInfo.error) {
      throw new Error('Failed to verify device status');
    }

    console.log(`Reboot requested for device: ${deviceId}`);
    
    // Platform-specific reboot commands
    const rebootCommands = {
      win32: 'shutdown /r /t 10',
      linux: 'sudo shutdown -r +1',
      darwin: 'sudo shutdown -r +1'
    };

    const platform = os.platform();
    const command = rebootCommands[platform];

    if (!command) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    if (force) {
      await execAsync(command);
      return res.status(200).json({
        success: true,
        message: `Reboot command executed for device ${deviceId}`,
        timestamp: new Date().toISOString()
      });
    }

    // For safety, return success without executing
    res.status(200).json({
      success: true,
      message: `Reboot command prepared for device ${deviceId} (safety mode)`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Reboot request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process reboot request',
      message: error.message
    });
  }
};

/**
 * Update device timezone with validation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateTimezone = async (req, res) => {
  try {
    const { deviceId, timezone } = req.body;
    
    if (!deviceId || !timezone) {
      return res.status(400).json({
        success: false,
        error: 'Device ID and timezone are required'
      });
    }

    // Validate timezone format (basic check)
    if (!/^[A-Za-z]+\/[A-Za-z_]+$/.test(timezone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid timezone format'
      });
    }

    // In a real application, this would update the system timezone
    // For demo purposes, we'll just simulate the update
    
    res.status(200).json({
      success: true,
      message: `Timezone updated to ${timezone} for device ${deviceId}`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Timezone update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update timezone',
      message: error.message
    });
  }
};

/**
 * Update device information with validation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateDeviceInfo = async (req, res) => {
  try {
    const { deviceId, name, description, location, model, tags } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Device ID is required'
      });
    }

    // Validate input data
    if (name && typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Name must be a string'
      });
    }

    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        error: 'Tags must be an array'
      });
    }

    // In a real app, this would update a database
    // For this demo, we just log the values and return success
    
    const updatedInfo = {
      deviceId,
      name,
      description,
      location,
      model,
      tags,
      updatedAt: new Date().toISOString()
    };

    console.log('Device info update:', updatedInfo);
    
    res.status(200).json({
      success: true,
      message: `Device information updated for ${deviceId}`,
      data: updatedInfo,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Device info update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update device information',
      message: error.message
    });
  }
};