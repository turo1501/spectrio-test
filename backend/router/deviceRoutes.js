// backend/src/routes/deviceRoutes.js
const express = require('express');
const router = express.Router();
const deviceController = require('../controller/deviceController');

router.get('/', deviceController.getDeviceInfo);
router.post('/reboot', deviceController.rebootDevice);
router.post('/timezone', deviceController.updateTimezone);
router.post('/update', deviceController.updateDeviceInfo);


module.exports = router;
