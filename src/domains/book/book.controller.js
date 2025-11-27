// src/domains/books/book.controller.js

const bookService = require('./book.service');
const { createBookSchema } = require('./schemas/book.schema');

/**
 * دالة Controller تستقبل طلب POST لإنشاء كتاب
 */
const postNewBook = async (req, res, next) => {
  try {
    // 1. التحقق من صحة البيانات باستخدام Zod
    const validatedData = createBookSchema.parse(req.body); 
    
    // 2. استدعاء الـ Service
    const newBook = await bookService.addNewBook(validatedData);

    // 3. إرسال استجابة HTTP 201 (Created)
    return res.status(201).json({
      success: true,
      message: "Book added successfully.",
      data: newBook,
    });
  } catch (error) {
    // 4. تمرير الأخطاء إلى Global Error Handler (بما في ذلك أخطاء Zod)
    next(error); 
  }
};

module.exports = {
  postNewBook,
};