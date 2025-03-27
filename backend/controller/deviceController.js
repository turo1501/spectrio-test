const systemService = require('../service/systemService')


exports.getDeviceInfo = (req,res) => {
    try {
        const info = systemService.getSystemInfo()
        res.status(200).json(info)
    }
    catch(error){
        res.status(500).json({error:'Failed to retrieve system info.'} )
    }
}