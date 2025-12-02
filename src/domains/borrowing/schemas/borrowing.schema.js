// src/domains/borrowing/schemas/borrowing.schema.js

const { z } = require('zod');

// ===============================================
// 1. مخطط الاستعارة (Borrow Schema)
// ===============================================
const borrowSchema = z.object({
    // 🚨 التصحيح الحاسم: نغلف الحقول المطلوبة داخل جسم الطلب (body)
    body: z.object({ 
        member_id: z.number({
            required_error: "Member ID is required.",
            invalid_type_error: "Member ID must be a number."
        }).int("Member ID must be an integer.").positive("Member ID must be positive."),
        
        book_id: z.number({
            required_error: "Book ID is required.",
            invalid_type_error: "Book ID must be a number."
        }).int("Book ID must be an integer.").positive("Book ID must be positive."),
    }),
});

// ===============================================
// 2. مخطط الإرجاع (Return Schema)
// ===============================================
const returnSchema = z.object({
    // 🚨 التصحيح الحاسم: نغلف الحقول المطلوبة داخل جسم الطلب (body)
    body: z.object({ 
        borrowing_id: z.number({
            required_error: "Borrowing ID is required for returning.",
            invalid_type_error: "Borrowing ID must be a number." // إضافة رسالة خطأ للنوع
        }).int("Borrowing ID must be an integer."),
    }),

    // يمكن إضافة query: z.object({...}) أو params: z.object({...}) 
    // إذا كنتِ تحتاجين للتحقق من أي حقول في مسار الطلب
    
    // لضمان عدم وجود حقول أخرى غير مرغوبة في الطلب
    // .strict()
});

// 3. تصدير المخططات
module.exports = {
  borrowSchema,
  returnSchema,
};