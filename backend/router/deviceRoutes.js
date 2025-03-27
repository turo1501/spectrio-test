// backend/src/routes/deviceRoutes.js
const express = require('express');
const router = express.Router();
const deviceController = require('../controller/deviceController');

router.get('/', deviceController.getDeviceInfo);

module.exports = router;
