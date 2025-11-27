// src/domains/books/book.repository.js

// 1. استدعاء Prisma Client
const prisma = require('../../core/utils/prisma');

/**
 * دالة Repository لإنشاء سجل كتاب جديد في قاعدة البيانات
 */
const createBook = (data) => {
  // 2. استخدام prisma.book مباشرة لإنشاء سجل جديد
  return prisma.book.create({
    data: data,
  });
};

// 3. تصدير الدوال
module.exports = {
  createBook,
};