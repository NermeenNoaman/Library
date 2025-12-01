// src/domains/borrowing/borrowing.repository.js

// 1. استدعاء Prisma Client باستخدام صيغة require والمسار الصحيح
const prisma = require('../../core/utils/prisma');

// 2. تحديد حد الاستعارة للعضو
const MEMBER_BORROW_LIMIT = 3; 

// === دوال جدول Borrowing والتحقق ===

/**
 * للتحقق من وجود غرامات غير مدفوعة لعضو معين
 */
const findUnpaidFines = (memberId) => {
  return prisma.fine.findFirst({
    where: {
      // نستخدم العلاقات للبحث عن الغرامة عبر جدول الاستعارة
      borrowing: { member_id: memberId },
      payment_status: 'Unpaid',
    },
  });
};

/**
 * لعد الكتب غير المرجعة للعضو (للتأكد من عدم تجاوز الحد)
 */
const countActiveBorrowings = (memberId) => {
  return prisma.borrowing.count({
    where: {
      member_id: memberId,
      status: 'Borrowed', // الحالة التي تعني أن الكتاب لم يُرجع بعد
    },
  });
};

/**
 * لجلب بيانات النسخ المتاحة للكتاب للتحقق من التوفر
 */
const getBookAvailability = (bookId) => {
  return prisma.book.findUnique({
    where: { book_id: bookId },
    select: { available_copies: true, total_copies: true }
  });
};

/**
 * لإنشاء سجل استعارة جديد في قاعدة البيانات
 */
const createBorrowing = (data) => {
  return prisma.borrowing.create({ data });
};

/**
 * لجلب سجل استعارة بواسطة الـ ID
 */
const findBorrowingById = (borrowingId) => {
  return prisma.borrowing.findUnique({ where: { borrowing_id: borrowingId } });
};


// 3. تصدير جميع الدوال (باستخدام module.exports)
module.exports = {
  findUnpaidFines,
  countActiveBorrowings,
  getBookAvailability,
  createBorrowing,
  findBorrowingById,
  MEMBER_BORROW_LIMIT,
};