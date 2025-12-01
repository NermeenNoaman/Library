// src/domains/fine/fine.service.js

const fineRepo = require('./fine.repository');

/**
 * جلب جميع الغرامات غير المدفوعة لعضو معين
 */
const getUnpaidFinesForMember = async (memberId) => {
    // 🚨🚨 التصحيح هنا: نستخدم Number() لضمان أن memberId هو رقم
    const memberIdAsNumber = Number(memberId);
    
    // ⚠️ يجب التحقق من أن الرقم صحيح قبل الاستخدام
    if (isNaN(memberIdAsNumber)) {
        throw new Error("Invalid member ID provided.");
    }
    
    // استخدام القيمة الرقمية في الاستدعاء
    const fines = await fineRepo.findUnpaidFinesByMember(memberIdAsNumber);

    if (!fines || fines.length === 0) {
        throw new Error(`No unpaid fines found for member ID ${memberId}.`);
    }
    return fines;
};
/**
 * معالجة دفع غرامة
 */
const processFinePayment = async (fineId, paymentAmount) => {
    const fine = await fineRepo.findFineById(fineId);

    if (!fine) {
        throw new Error("Fine not found for the given ID.");
    }

    if (fine.payment_status === 'Paid') {
        throw new Error("This fine has already been paid.");
    }
    
    // تأكد من أن المبلغ المدفوع يغطي الغرامة
    if (paymentAmount < fine.fine_amount) {
        // في مشروع أكبر يمكن تطبيق دفع جزئي، لكن هنا نطلب الدفع الكامل
        throw new Error(`Payment amount is less than the required fine amount (${fine.fine_amount}).`);
    }

    // تحديث الحالة في قاعدة البيانات
    const updatedFine = await fineRepo.updateFineToPaid(fineId, fine.fine_amount);

    return updatedFine;
};


module.exports = {
    getUnpaidFinesForMember,
    processFinePayment
};