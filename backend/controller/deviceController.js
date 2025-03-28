const systemService = require('../service/systemService')
const os = require('os');
const { exec } = require('child_process');

/**
 * Get device information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDeviceInfo = (req, res) => {
  try {
    // Basic system information
    const systemInfo = {
      operatingSystem: `${os.type()} ${os.release()}`,
      hostName: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      uptime: formatUptime(os.uptime()),
      totalMemory: Math.round(os.totalmem() / (1024 * 1024 * 1024) * 100) / 100, // GB
      freeMemory: Math.round(os.freemem() / (1024 * 1024 * 1024) * 100) / 100, // GB
      cpuCores: os.cpus().length,
      cpuModel: os.cpus()[0].model,
      networkInterfaces: os.networkInterfaces(),
    };

    res.status(200).json({
      success: true,
      data: systemInfo
    });
  } catch (error) {
    console.error('Error getting device info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve device information'
    });
  }
};

/**
 * Get specific device metric
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDeviceMetric = async (req, res) => {
    try {
        const { metric } = req.params
        const info = await systemService.getSystemInfo()
        
        switch (metric) {
            case 'cpu':
                res.status(200).json(info.cpu)
                break
            case 'ram':
                res.status(200).json(info.ram)
                break
            case 'disk':
                res.status(200).json(info.disk)
                break
            case 'network':
                res.status(200).json(info.network)
                break
            case 'display':
                res.status(200).json({
                    monitors: info.monitors,
                    displayInfo: info.displayInfo
                })
                break
            case 'os':
                res.status(200).json({
                    operatingSystem: info.operatingSystem,
                    uptime: info.uptime,
                    hostName: info.hostName
                })
                break
            default:
                res.status(404).json({ error: 'Metric not found' })
        }
    }
    catch (error) {
        console.error('Error in getDeviceMetric controller:', error)
        res.status(500).json({ 
            error: 'Failed to retrieve device metric.',
            message: error.message 
        })
    }
}

/**
 * Reboot device
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.rebootDevice = (req, res) => {
  try {
    // Extract device ID from request body
    const { deviceId } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Device ID is required'
      });
    }

    console.log(`Reboot requested for device: ${deviceId}`);
    
    // For safety reasons, we won't actually execute the reboot command in this demo
    // In a real application, you would use platform-specific commands
    
    /* 
    // Example reboot commands (commented out for safety):
    if (os.platform() === 'win32') {
      exec('shutdown /r /t 10', (error) => {
        if (error) {
          console.error(`Reboot error: ${error}`);
          return res.status(500).json({ success: false, error: 'Failed to reboot device' });
        }
      });
    } else if (os.platform() === 'linux' || os.platform() === 'darwin') {
      exec('sudo shutdown -r +1', (error) => {
        if (error) {
          console.error(`Reboot error: ${error}`);
          return res.status(500).json({ success: false, error: 'Failed to reboot device' });
        }
      });
    }
    */
    
    // For demo, we just simulate the reboot process
    setTimeout(() => {
      console.log(`Device ${deviceId} reboot simulation completed`);
    }, 5000);
    
    res.status(200).json({
      success: true,
      message: `Reboot command sent to device ${deviceId}`
    });
    
  } catch (error) {
    console.error('Reboot request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process reboot request'
    });
  }
};

// Update device timezone
exports.updateTimezone = (req, res) => {
  try {
    const { deviceId, timezone } = req.body;
    
    if (!deviceId || !timezone) {
      return res.status(400).json({
        success: false,
        error: 'Device ID and timezone are required'
      });
    }
    
    console.log(`Timezone update requested for device ${deviceId}: ${timezone}`);
    
    // In a real application, this would make system changes
    // For this demo, we're just simulating the update
    
    res.status(200).json({
      success: true,
      message: `Timezone updated to ${timezone} for device ${deviceId}`
    });
    
  } catch (error) {
    console.error('Timezone update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update timezone'
    });
  }
};

// Update device information
exports.updateDeviceInfo = (req, res) => {
  try {
    const { deviceId, name, description, location, model, tags } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Device ID is required'
      });
    }
    
    console.log(`Device info update requested for device ${deviceId}`);
    
    // In a real app, this would update a database
    // For this demo, we just log the values and return success
    console.log('Updated values:', { name, description, location, model, tags });
    
    res.status(200).json({
      success: true,
      message: `Device information updated for ${deviceId}`,
      data: { deviceId, name, description, location, model, tags }
    });
    
  } catch (error) {
    console.error('Device info update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update device information'
    });
  }
};

// Helper function to format uptime
function formatUptime(uptime) {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  
  let formattedUptime = '';
  if (days > 0) formattedUptime += `${days}d `;
  if (hours > 0 || days > 0) formattedUptime += `${hours}h `;
  formattedUptime += `${minutes}m`;
  
  return formattedUptime;
}