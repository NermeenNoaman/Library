// src/domains/borrowing/borrowing.controller.js

const borrowingService = require('./borrowing.service');

/**
 * دالة Controller لاستعارة كتاب جديد
 */
const borrow = async (req, res) => {
    const { member_id, book_id, librarian_id } = req.body; 

    // ✅ تحقق من البيانات المطلوبة
    if (!member_id || !book_id || !librarian_id) {
        return res.status(400).json({ error: "member_id, book_id, and librarian_id are required." });
    }

    try {
        // استدعاء دالة الخدمة مع librarian_id
        const newBorrowing = await borrowingService.borrowBook(member_id, book_id, librarian_id);
        
        return res.status(201).json({ 
            message: "Book borrowed successfully.", 
            borrowing: newBorrowing 
        });

    } catch (error) {
        // أخطاء منطق العمل (Business Logic)
        if (error.message.includes("Cannot borrow")) {
            return res.status(403).json({ error: error.message });
        }
        
        // أخطاء السيرفر غير المتوقعة
        console.error("Error in borrowing book:", error);
        return res.status(500).json({ error: "Internal Server Error during borrowing process." });
    }
};

/**
 * دالة Controller لإرجاع كتاب
 */
const returnBook = async (req, res) => {
    const { borrowing_id } = req.body;

    // ✅ تحقق من البيانات المطلوبة
    if (!borrowing_id) {
        return res.status(400).json({ error: "borrowing_id is required." });
    }

    try {
        const result = await borrowingService.returnBook(borrowing_id);

        return res.status(200).json({ 
            message: "Book returned successfully.", 
            details: result 
        });

    } catch (error) {
        // أخطاء منطق العمل
        if (error.message.includes("Borrowing not found") || error.message.includes("already returned")) {
            return res.status(404).json({ error: error.message });
        }

        // أخطاء السيرفر
        console.error("CRITICAL ERROR IN RETURN PROCESS:", error);
        return res.status(500).json({ error: "Internal Server Error during return process." });
    }
};

module.exports = {
    borrow,
    returnBook,
};
