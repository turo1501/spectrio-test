// backend/src/routes/deviceRoutes.js
const express = require('express');
const router = express.Router();
const deviceController = require('../controller/deviceController');

// GET /api/device/info - Get device information
router.get('/info', deviceController.getDeviceInfo);

// POST /api/device/reboot - Reboot device
router.post('/reboot', deviceController.rebootDevice);

// POST /api/device/timezone - Update device timezone
router.post('/timezone', deviceController.updateTimezone);

// POST /api/device/update - Update device information
router.post('/update', deviceController.updateDeviceInfo);

module.exports = router;
