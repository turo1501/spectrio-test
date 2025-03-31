const os = require('os')
const si = require('systeminformation')
const axios = require('axios')

/**
 * Get detailed system information including hardware, OS, and location
 * @returns {Promise<Object>} System information object
 */
async function getSystemInfo() {
    try {
        // Get display information
        const graphics = await si.graphics()
        const numberOfMonitors = graphics.displays ? graphics.displays.length : 1

        // RAM information - enhanced with percent per process
        const totalMemory = Math.round(os.totalmem()/(1024*1024))
        const freeMemory = Math.round(os.freemem()/(1024*1024))
        const usedMemory = totalMemory - freeMemory 
        const memPercentage = Math.round((usedMemory / totalMemory) * 100)
        
        // Get top memory processes
        const processes = await si.processes()
        const topMemoryProcesses = processes.list
            .sort((a, b) => b.memRss - a.memRss)
            .slice(0, 5)
            .map(proc => ({
                name: proc.name,
                memoryUsage: Math.round((proc.memRss / (totalMemory * 1024 * 1024)) * 100 * 100) / 100, // as percentage of total with 2 decimal places
                pid: proc.pid
            }))

        // CPU information - enhanced with detailed load
        const cpuInfo = os.cpus()
        const currentLoad = await si.currentLoad()
        const cpuCurrentSpeed = await si.cpu()
        
        // Get real-time CPU usage per core
        const coreUsage = currentLoad.cpus.map((core, index) => ({
            core: index,
            load: Math.round(core.load),
            speed: cpuCurrentSpeed.speed
        }))
        
        // Get top CPU processes
        const topCpuProcesses = processes.list
            .sort((a, b) => b.cpu - a.cpu)
            .slice(0, 5)
            .map(proc => ({
                name: proc.name,
                cpuUsage: Math.round(proc.cpu * 100) / 100, // percentage with 2 decimal places
                pid: proc.pid
            }))

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
        
        // Get MAC address and IP
        const networkInterfaces = await si.networkInterfaces()
        const macAddress = networkInterfaces.length > 0 ? networkInterfaces[0].mac : 'Unknown'
        const ipAddress = getIPAddress()
        
        // Get location based on IP address
        const locationInfo = await getLocationFromIP(ipAddress)
        
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
                usagePercentage: memPercentage,
                topProcesses: topMemoryProcesses
            },
            cpu: {
                model: cpuCurrentSpeed.manufacturer + ' ' + cpuCurrentSpeed.brand,
                cores: cpuCurrentSpeed.cores,
                physicalCores: cpuCurrentSpeed.physicalCores,
                speed: cpuCurrentSpeed.speed,
                loadAverage: Math.round(currentLoad.currentLoad),
                coreUsage: coreUsage,
                topProcesses: topCpuProcesses
            },
            network,
            disk: diskInfo,
            operatingSystem,
            uptime: uptimeFormatted,
            macAddress,
            hostName: os.hostname(),
            ipAddress,
            location: locationInfo
        }
    } catch (error) {
        console.error('Error getting system information:', error)
        return {
            error: 'Failed to retrieve system information',
            message: error.message
        }
    }
}

/**
 * Get location information based on IP address
 * @param {string} ip - The IP address to look up
 * @returns {Promise<Object>} Location information
 */
async function getLocationFromIP(ip) {
    try {
        // Use ipinfo.io API to get location information
        // Using fallback value if API call fails
        const response = await axios.get(`https://ipinfo.io/${ip}/json`)
        
        if (response.data && response.data.city) {
            return {
                city: response.data.city,
                region: response.data.region,
                country: response.data.country,
                loc: response.data.loc,
                timezone: response.data.timezone,
                postal: response.data.postal
            }
        }
        
        // Return Ho Chi Minh City as fallback
        return {
            city: 'Ho Chi Minh City',
            region: 'Ho Chi Minh',
            country: 'VN',
            loc: '10.8231,106.6297',
            timezone: 'Asia/Ho_Chi_Minh'
        }
    } catch (error) {
        console.error('Error getting location from IP:', error)
        // Return Ho Chi Minh City as fallback
        return {
            city: 'Ho Chi Minh City',
            region: 'Ho Chi Minh',
            country: 'VN',
            loc: '10.8231,106.6297',
            timezone: 'Asia/Ho_Chi_Minh'
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