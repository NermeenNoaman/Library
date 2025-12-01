// src/domains/fine/fine.controller.js

const fineService = require('./fine.service');

/**
 * دالة Controller لعرض الغرامات غير المدفوعة لعضو
 */
const getFinesByMember = async (req, res) => {
    // 1. member_id يتم استخراجه من الـ URL (Params)
    const memberId = req.params.member_id; 

    try {
        // 2. استدعاء دالة الخدمة
        const fines = await fineService.getUnpaidFinesForMember(memberId);
        
        // 3. إرسال رد النجاح
        return res.status(200).json(fines);

    } catch (error) {
        // 4. معالجة أخطاء منطق العمل
        if (error.message.includes("No unpaid fines found")) {
            return res.status(404).json({ error: error.message });
        }
        
        // 5. معالجة أخطاء السيرفر غير المتوقعة
        console.error("Error in fetching fines:", error);
        return res.status(500).json({ error: "Internal Server Error during fetching fines." });
    }
};

/**
 * دالة Controller لدفع غرامة
 */
const payFine = async (req, res) => {
    const { fine_id, payment_amount } = req.body;

    try {
        const paidFine = await fineService.processFinePayment(fine_id, payment_amount);

        return res.status(200).json({ 
            message: `Fine ID ${fine_id} paid successfully.`,
            fine: paidFine
        });

    } catch (error) {
        // 4. معالجة أخطاء منطق العمل
        if (error.message.includes("Fine not found")) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("already been paid") || error.message.includes("less than the required")) {
            return res.status(400).json({ error: error.message });
        }

        // 5. معالجة أخطاء السيرفر غير المتوقعة
        console.error("Error in fine payment:", error);
        return res.status(500).json({ error: "Internal Server Error during fine payment." });
    }
};

module.exports = {
    getFinesByMember,
    payFine
};