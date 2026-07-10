const express = require('express');
const router = express.Router();
const { RegisterVendorStore, GetVendorOrders, RequestPayout } = require('../controller/vendor-controller');

router.post('/vendors/register', RegisterVendorStore);
router.get('/vendors/orders/:vendorId', GetVendorOrders);
router.post('/vendors/withdraw', RequestPayout);

module.exports = router;