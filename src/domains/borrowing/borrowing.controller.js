// src/domains/borrowing/borrowing.controller.js

const borrowingService = require('./borrowing.service');

/**
 * دالة Controller لاستعارة كتاب جديد
 * (استدعاء منطق التحقق من القيود وإنشاء سجل الإعارة من الـ Service)
 */
const borrow = async (req, res) => {
    // 1. استخلاص البيانات (تم التحقق من صحتها مسبقاً بواسطة Zod في الـ Routes)
    const { member_id, book_id } = req.body; 

    try {
        // 2. استدعاء دالة الخدمة لتنفيذ المنطق المعقد
        const newBorrowing = await borrowingService.borrowBook(member_id, book_id);
        
        // 3. إرسال رد النجاح (201 Created)
        return res.status(201).json({ 
            message: "Book borrowed successfully.", 
            borrowing: newBorrowing 
        });

    } catch (error) {
        // 4. معالجة أخطاء منطق العمل (Business Logic Errors)
        // مثل: العضو عليه غرامة، لا توجد نسخ متاحة، تجاوز حد الاستعارة
        if (error.message.includes("Cannot borrow")) {
            // إرجاع 403 Forbidden/Conflict لأخطاء العمل
            return res.status(403).json({ error: error.message });
        }
        
        // 5. معالجة أخطاء السيرفر غير المتوقعة
        console.error("Error in borrowing book:", error);
        return res.status(500).json({ error: "Internal Server Error during borrowing process." });
    }
};

/**
 * دالة Controller لإرجاع كتاب
 * (تستدعي دالة الخدمة لتحديث سجل الإعارة وحساب الغرامة)
 */
const returnBook = async (req, res) => {
    // 1. استخلاص البيانات (معرف سجل الإعارة)
    const { borrowing_id } = req.body;

    try {
        // 2. استدعاء دالة الخدمة
        const result = await borrowingService.returnBook(borrowing_id);

        // 3. إرسال رد النجاح (200 OK)
        return res.status(200).json({ 
            message: "Book returned successfully.", 
            details: result 
        });

    } catch (error) {
        // 4. معالجة أخطاء منطق العمل
        if (error.message.includes("Borrowing not found") || error.message.includes("already returned")) {
             // إرجاع 404 أو 400 لأخطاء البيانات
            return res.status(404).json({ error: error.message });
        }

        // 5. معالجة أخطاء السيرفر
        console.error("Error in returning book:", error);
        return res.status(500).json({ error: "Internal Server Error during return process." });
    }
};


// 6. تصدير الدوال
module.exports = {
    borrow,
    returnBook,
};