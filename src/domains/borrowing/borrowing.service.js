// src/domains/borrowing/borrowing.service.js

const prisma = require('../../core/utils/prisma'); // المسار الصحيح لـ Prisma Client
const borrowingRepo = require('./borrowing.repository');
const { differenceInDays } = require('date-fns'); // لاستخدامها في حساب الغرامة

// ثابت (Constant) لقيمة الغرامة اليومية
const DAILY_FINE_AMOUNT = 50.0; // 10 جنيهات مثلاً لكل يوم تأخير

/**
 * دالة استعارة كتاب جديد
 * (Logic: فحص الغرامات، فحص حدود العضو، فحص التوفر، ثم التنفيذ كـ Transaction)
 */
const borrowBook = async (memberId, bookId) => {
  // 1. 🛑 منع الاستعارة لو عليه غرامة
  const hasUnpaidFines = await borrowingRepo.findUnpaidFines(memberId);
  if (hasUnpaidFines) {
    throw new Error("Cannot borrow: Member has unpaid fines.");
  }

  // 2. 🛑 التحقق من حد الاستعارة
  const activeCount = await borrowingRepo.countActiveBorrowings(memberId);
  if (activeCount >= borrowingRepo.MEMBER_BORROW_LIMIT) {
    throw new Error(`Cannot borrow: Member reached the limit of ${borrowingRepo.MEMBER_BORROW_LIMIT} active borrowings.`);
  }

  // 3. 🛑 التحقق من توفر الكتاب
  const book = await borrowingRepo.getBookAvailability(bookId);
  if (!book || book.available_copies <= 0) {
    throw new Error("Cannot borrow: Book is currently unavailable.");
  }

  // 4. ✅ تنفيذ العملية كـ Transaction (إنشاء سجل استعارة + إنقاص النسخ)
  const borrowDate = new Date();
  const dueDate = new Date(borrowDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // إضافة 7 يوم (بدون date-fns)
  // أو باستخدام date-fns:
  // const dueDate = addDays(borrowDate, 14);

  const [newBorrowing, updatedBook] = await prisma.$transaction([
    prisma.borrowing.create({
      data: {
        member_id: memberId,
        book_id: bookId,
        borrow_date: borrowDate,
        due_date: dueDate,
        status: 'Borrowed',
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
 * (Logic: تحديث حالة الإعارة، زيادة النسخ المتاحة، احتساب وتسجيل الغرامة إن وجدت)
 */
// يجب التأكد من وجود هذه الدوال والثوابت في أعلى الملف

const returnBook = async (borrowingId) => {
    // 1. جلب سجل الاستعارة
    const borrowingRecord = await borrowingRepo.findBorrowingById(borrowingId);

    if (!borrowingRecord) {
        throw new Error("Borrowing not found for the given ID.");
    }
    if (borrowingRecord.status === 'Returned') {
        throw new Error("This book has already been returned.");
    }

    const returnDate = new Date();
    // تأكدي من أن due_date هو Date object
    const dueDate = new Date(borrowingRecord.due_date); 
    
    let fineAmount = 0;
    let fineRecord = null;
    let daysLate = 0;
    
    // 2. 💰 حساب الغرامة (Calculating Fine)
    if (returnDate > dueDate) {
        // نستخدم differenceInDays التي تجلب عدد الأيام الموجبة (فارق التواريخ)
        daysLate = differenceInDays(returnDate, dueDate); 
        
        if (daysLate > 0) {
            fineAmount = daysLate * DAILY_FINE_AMOUNT;
        }
    }
    
    // 3. ✅ تنفيذ العملية كـ Transaction
    
    const transactionOperations = [
        // أ. تحديث سجل الاستعارة 
        prisma.borrowing.update({
            where: { borrowing_id: borrowingId },
            data: {
                return_date: returnDate,
                status: 'Returned' // حالة الأحرف الصحيحة
            }
        }),
        // ب. زيادة النسخ المتاحة للكتاب
        prisma.book.update({
            where: { book_id: borrowingRecord.book_id },
            data: { available_copies: { increment: 1 } }
        })
    ];
    
    // ج. تسجيل الغرامة في جدول Fine إذا كانت هناك غرامة
    if (fineAmount > 0) {
        fineRecord = prisma.fine.create({
            data: {
                // 🚨🚨🚨 التصحيح الحاسم: إضافة member_id (مطلوب في الـ Schema)
                member_id: borrowingRecord.member_id, 
                
                borrowing_id: borrowingId,
                fine_amount: fineAmount,
                fine_date: returnDate,
                payment_status: 'Unpaid' // حالة الأحرف الصحيحة
            }
        });
        transactionOperations.push(fineRecord);
    }

    const result = await prisma.$transaction(transactionOperations);

    // 4. إرجاع النتيجة
    return {
        borrowing: result[0], // سجل الإعارة المحدث (هو أول عملية)
        // يتم استخلاص الغرامة من الـ result فقط إذا تم إنشاء سجل لها
        fine: fineAmount > 0 ? result.find((op, index) => index > 0) : null, 
        days_late: daysLate,
        fine_amount: fineAmount
    };
};
module.exports = {
  borrowBook,
  returnBook
};