// src/domains/books/schemas/book.schema.js

const { z } = require('zod');

// تعريف المخطط (Schema) لبيانات الكتاب عند الإنشاء
const createBookSchema = z.object({
  isbn: z.string().min(10).max(13, "ISBN must be 10 or 13 characters."),
  title: z.string().min(3, "Title is required."),
  author_name: z.string().optional(), // يمكن أن تكون اختيارية مؤقتاً
  category_id: z.number().int("Category ID must be an integer."),
  
  // ملاحظة: ستتم إضافة حقول أخرى هنا لاحقاً
});

module.exports = {
  createBookSchema,
};