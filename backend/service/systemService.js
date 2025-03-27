const os = require('os')

function getSystemInfo() {
    const numberOfMonitors = 1 

    const totalMemory = Math.round(os.totalmem()/(1024*1024))
    const freeMemory = Math.round(os.freemem()/(1024*1024))
    const usedMemory = totalMemory - freeMemory 

    const loadAverage = os.loadavg()[0]

    const cpuUsage = os.cpus()

    const operatingSystem = `${os.type()} ${os.release()}`

    const uptime = os.uptime()

    return {
        monitors : numberOfMonitors ,
        ram :{
            total : totalMemory, 
            used :usedMemory,
            free : freeMemory
        },
        loadAverage,
        operatingSystem,
        uptime,
        cpuInfo : cpuUsage
    }

}
module.exports = {getSystemInfo }