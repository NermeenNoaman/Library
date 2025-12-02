// src/domains/borrowing/borrowing.service.js

const prisma = require('../../core/utils/prisma'); 
const borrowingRepo = require('./borrowing.repository');
const { differenceInDays } = require('date-fns'); 

const DAILY_FINE_AMOUNT = 50.0; // غرامة يومية ثابتة

/**
 * دالة استعارة كتاب جديد
 */
const borrowBook = async (memberId, bookId, librarianId) => {
  // 1. منع الاستعارة لو عليه غرامة
  const hasUnpaidFines = await borrowingRepo.findUnpaidFines(memberId);
  if (hasUnpaidFines) {
    throw new Error("Cannot borrow: Member has unpaid fines.");
  }

  // 2. التحقق من حد الاستعارة
  const activeCount = await borrowingRepo.countActiveBorrowings(memberId);
  if (activeCount >= borrowingRepo.MEMBER_BORROW_LIMIT) {
    throw new Error(`Cannot borrow: Member reached the limit of ${borrowingRepo.MEMBER_BORROW_LIMIT} active borrowings.`);
  }

  // 3. التحقق من توفر الكتاب
  const book = await borrowingRepo.getBookAvailability(bookId);
  if (!book || book.available_copies <= 0) {
    throw new Error("Cannot borrow: Book is currently unavailable.");
  }

  // 4. تنفيذ العملية كـ Transaction (إنشاء سجل استعارة + إنقاص النسخ)
  const borrowDate = new Date();
  const dueDate = new Date(borrowDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // إضافة 7 أيام

  const [newBorrowing, updatedBook] = await prisma.$transaction([
    prisma.borrowing.create({
      data: {
        member_id: memberId,
        book_id: bookId,
        borrow_date: borrowDate,
        due_date: dueDate,
        status: 'Borrowed',
        librarian_id: librarianId
      }
    }),
    prisma.book.update({
      where: { book_id: bookId },
      data: { available_copies: { decrement: 1 } }
    })
  ]);

  return newBorrowing;
};

/**
 * دالة إرجاع كتاب وحساب الغرامة التلقائية
 */
const returnBook = async (borrowingId) => {
  // 1. جلب سجل الاستعارة
  const borrowingRecord = await borrowingRepo.findBorrowingById(borrowingId);

  if (!borrowingRecord) {
    throw new Error("Borrowing not found for the given ID.");
  }

  // منع الإرجاع المتكرر
  if (borrowingRecord.status === 'Returned') { 
    throw new Error("This book has already been returned.");
  }

  const returnDate = new Date();
  const dueDate = new Date(borrowingRecord.due_date); 
  
  let fineAmount = 0;
  let daysLate = 0;

  // 2. حساب الغرامة
  if (returnDate > dueDate) {
    daysLate = differenceInDays(returnDate, dueDate); 
    if (daysLate > 0) {
      fineAmount = daysLate * DAILY_FINE_AMOUNT;
    }
  }

  // 3. تنفيذ العملية كـ Transaction
  const transactionOperations = [
    // تحديث سجل الاستعارة
    prisma.borrowing.update({
      where: { borrowing_id: borrowingId },
      data: {
        return_date: returnDate,
        status: 'Returned'
      }
    }),
    // زيادة النسخ المتاحة للكتاب
    prisma.book.update({
      where: { book_id: borrowingRecord.book_id },
      data: { available_copies: { increment: 1 } }
    })
  ];

  // تسجيل الغرامة إذا وجدت
  if (fineAmount > 0) {
    transactionOperations.push(
      prisma.fine.create({
        data: {
          member_id: borrowingRecord.member_id,
          borrowing_id: borrowingId,
          fine_amount: fineAmount,
          fine_date: returnDate,
          payment_status: 'Unpaid'
        }
      })
    );
  }

  const result = await prisma.$transaction(transactionOperations);
  const fineResult = fineAmount > 0 ? result.find(op => op && op.hasOwnProperty('fine_id')) : null;

  return {
    borrowing: result[0],
    fine: fineResult,
    days_late: daysLate,
    fine_amount: fineAmount
  };
};

module.exports = {
  borrowBook,
  returnBook
};
