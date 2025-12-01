// src/domains/borrowing/borrowing.routes.js

const express = require('express');
const router = express.Router();
const validate = require('../../middleware/validate'); // Middleware للـ Validation
const { borrowSchema, returnSchema } = require('./schemas/borrowing.schema'); // المخططات التي كتبتيها
const borrowingController = require('./borrowing.controller');

// ===============================================
// 1. مسار استعارة كتاب (Issue Book)
// Endpoint: /api/v1/borrowings/borrow
// ===============================================
router.post(
    '/borrow', 
    validate(borrowSchema), // التحقق من أن member_id و book_id صحيحان
    borrowingController.borrow
);

// ===============================================
// 2. مسار إرجاع كتاب (Return Book)
// Endpoint: /api/v1/borrowings/return
// ===============================================
router.post(
    '/return', 
    validate(returnSchema), // التحقق من أن borrowing_id صحيح
    borrowingController.returnBook
);


module.exports = router;