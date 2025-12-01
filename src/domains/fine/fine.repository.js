// src/domains/fine/fine.repository.js

const prisma = require('../../core/utils/prisma');

/**
 * جلب جميع الغرامات غير المدفوعة لعضو معين
 */
const findUnpaidFinesByMember = (memberId) => {
    return prisma.fine.findMany({
        where: {
            member_id: memberId,
            payment_status: 'Unpaid' // تم تصحيح حالة الأحرف هنا
        },
        // تضمين بيانات العضو (Member) وسجل الاستعارة (Borrowing)
        include: {
            member: true
            ,borrowing: true

        },
        orderBy: {
            fine_date: 'asc' // الأقدم أولاً
        }
    });
};

/**
 * جلب سجل غرامة بواسطة ID
 */
const findFineById = (fineId) => {
    return prisma.fine.findUnique({
        where: { fine_id: fineId }
    });
};

/**
 * تحديث حالة الغرامة إلى مدفوعة
 */
const updateFineToPaid = (fineId, amount) => {
    return prisma.fine.update({
        where: { fine_id: fineId },
        data: {
            payment_status: 'Paid', // حالة الأحرف الصحيحة
            payment_date: new Date(),
            fine_amount: amount // يمكن تحديث المبلغ إذا كان الدفع جزئياً، لكن حالياً نفترض الدفع الكامل
        }
    });
};

module.exports = {
    findUnpaidFinesByMember,
    findFineById,
    updateFineToPaid
};