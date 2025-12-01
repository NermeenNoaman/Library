// src/domains/fine/fine.routes.js

const express = require('express');
const router = express.Router();
const validate = require('../../middleware/validate');
const { getFinesSchema, payFineSchema } = require('./schemas/fine.schema');
const fineController = require('./fine.controller');

// ===============================================
// 1. مسار جلب الغرامات غير المدفوعة لعضو
// Endpoint: /api/v1/fines/member/:member_id
// ===============================================
router.get(
    '/member/:member_id',
    validate(getFinesSchema), 
    fineController.getFinesByMember
);

// ===============================================
// 2. مسار دفع غرامة محددة
// Endpoint: /api/v1/fines/pay
// ===============================================
router.post(
    '/pay',
    validate(payFineSchema),
    fineController.payFine
);


module.exports = router;