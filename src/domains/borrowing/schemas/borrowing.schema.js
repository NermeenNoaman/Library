// src/domains/borrowing/schemas/borrowing.schema.js

const { z } = require('zod');

// ===============================================
// 1. مخطط الاستعارة (Borrow Schema)
// ===============================================
const borrowSchema = z.object({
  // member_id: يجب أن يكون رقماً صحيحاً وموجوداً
  member_id: z.number({
    required_error: "Member ID is required for borrowing."
  }).int("Member ID must be an integer."),

  // book_id: يجب أن يكون رقماً صحيحاً وموجوداً
  book_id: z.number({
    required_error: "Book ID is required for borrowing."
  }).int("Book ID must be an integer."),
});

// ===============================================
// 2. مخطط الإرجاع (Return Schema)
// ===============================================
const returnSchema = z.object({
  // نحتاج فقط لمعرف سجل الاستعارة الذي سيتم إرجاعه
  borrowing_id: z.number({
    required_error: "Borrowing ID is required for returning."
  }).int("Borrowing ID must be an integer."),
});

// 3. تصدير المخططات
module.exports = {
  borrowSchema,
  returnSchema,
};