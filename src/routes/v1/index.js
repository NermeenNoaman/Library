//src/routes/v1/index.js

const express = require('express');
const router = express.Router();

const borrowingRoutes = require('../../domains/borrowing/borrowing.routes');
const fineRoutes = require('../../domains/fine/fine.routes');


router.use('/borrowings', borrowingRoutes);
router.use('/fines', fineRoutes); 


module.exports = router;