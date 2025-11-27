// src/domains/books/book.service.js

// 1. استدعاء الـ Repository
const bookRepository = require('./book.repository');

/**
 * دالة Service لمعالجة منطق إنشاء الكتاب
 */
const addNewBook = async (bookData) => {
  // 2. [منطق الأعمال]: هنا يمكن إضافة منطق للتحقق من التكرار أو الصلاحيات
  
  // 3. استدعاء الـ Repository لحفظ البيانات
  const newBook = await bookRepository.createBook(bookData);
  
  return newBook;
};

// 4. تصدير الدوال
module.exports = {
  addNewBook,
};