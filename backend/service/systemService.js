const os = require('os')
const si = require('systeminformation')

async function getSystemInfo() {
    try {
        // Get display information
        const graphics = await si.graphics()
        const numberOfMonitors = graphics.displays ? graphics.displays.length : 1

        // RAM information
        const totalMemory = Math.round(os.totalmem()/(1024*1024))
        const freeMemory = Math.round(os.freemem()/(1024*1024))
        const usedMemory = totalMemory - freeMemory 
        const memPercentage = Math.round((usedMemory / totalMemory) * 100)

        // CPU information
        const cpuInfo = os.cpus()
        const [loadAverage] = os.loadavg()
        const cpuCurrentSpeed = await si.cpu()
        
        // Network information
        const networkStats = await si.networkStats()
        const network = networkStats.length > 0 ? {
            interface: networkStats[0].iface,
            rx_bytes: Math.round(networkStats[0].rx_bytes / (1024 * 1024)),
            tx_bytes: Math.round(networkStats[0].tx_bytes / (1024 * 1024)),
            rx_sec: Math.round(networkStats[0].rx_sec / 1024),
            tx_sec: Math.round(networkStats[0].tx_sec / 1024)
        } : null

        // Disk information
        const fsSize = await si.fsSize()
        const diskInfo = fsSize.length > 0 ? fsSize.map(disk => ({
            fs: disk.fs,
            type: disk.type,
            size: Math.round(disk.size / (1024 * 1024 * 1024)),
            used: Math.round(disk.used / (1024 * 1024 * 1024)),
            available: Math.round(disk.available / (1024 * 1024 * 1024)),
            use: Math.round(disk.use)
        })) : []

        // System information
        const operatingSystem = `${os.type()} ${os.release()}`
        const uptime = os.uptime()
        const uptimeFormatted = formatUptime(uptime)
        
        // Get MAC address
        const networkInterfaces = await si.networkInterfaces()
        const macAddress = networkInterfaces.length > 0 ? networkInterfaces[0].mac : 'Unknown'
        
        return {
            timestamp: new Date().toISOString(),
            monitors: numberOfMonitors,
            displayInfo: graphics.displays.map(display => ({
                model: display.model,
                main: display.main,
                connection: display.connection,
                resolution: `${display.resolutionX}x${display.resolutionY}`,
                sizeInch: display.sizeInch
            })),
            ram: {
                total: totalMemory,
                used: usedMemory,
                free: freeMemory,
                usagePercentage: memPercentage
            },
            cpu: {
                model: cpuCurrentSpeed.manufacturer + ' ' + cpuCurrentSpeed.brand,
                cores: cpuCurrentSpeed.cores,
                speed: cpuCurrentSpeed.speed,
                loadAverage
            },
            network,
            disk: diskInfo,
            operatingSystem,
            uptime: uptimeFormatted,
            macAddress,
            hostName: os.hostname(),
            ipAddress: getIPAddress()
        }
    } catch (error) {
        console.error('Error getting system information:', error)
        return {
            error: 'Failed to retrieve system information',
            message: error.message
        }
    }
}

function formatUptime(uptime) {
    const days = Math.floor(uptime / (24 * 3600))
    const hours = Math.floor((uptime % (24 * 3600)) / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    const seconds = Math.floor(uptime % 60)
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

function getIPAddress() {
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address
            }
        }
    }
    return '127.0.0.1'
}

module.exports = { getSystemInfo }