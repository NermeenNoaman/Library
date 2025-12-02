// src/domains/borrowing/borrowing.repository.js

const prisma = require('../../core/utils/prisma');

// حد الاستعارة لكل عضو
const MEMBER_BORROW_LIMIT = 3; 

/**
 * للتحقق من وجود غرامات غير مدفوعة لعضو معين
 */
const findUnpaidFines = async (memberId) => {
  return prisma.fine.findFirst({
    where: {
      member_id: memberId,
      payment_status: 'Unpaid', // الغرامة لم يتم دفعها
    }
  });
};

/**
 * لعد الكتب غير المرجعة للعضو (للتحقق من حد الاستعارة)
 */
const countActiveBorrowings = async (memberId) => {
  return prisma.borrowing.count({
    where: {
      member_id: memberId,
      status: 'Borrowed' // الحالة تعني الكتاب لم يُرجع بعد
    }
  });
};

/**
 * لجلب بيانات النسخ المتاحة للكتاب للتحقق من التوفر
 */
const getBookAvailability = async (bookId) => {
  return prisma.book.findUnique({
    where: { book_id: bookId },
    select: { available_copies: true, total_copies: true }
  });
};

/**
 * لجلب سجل استعارة بواسطة الـ ID
 */
const findBorrowingById = async (borrowingId) => {
  return prisma.borrowing.findUnique({ where: { borrowing_id: borrowingId } });
};

module.exports = {
  findUnpaidFines,
  countActiveBorrowings,
  getBookAvailability,
  findBorrowingById,
  MEMBER_BORROW_LIMIT
};
