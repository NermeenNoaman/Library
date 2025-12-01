// src/domains/fine/schemas/fine.schema.js

const z = require('zod');

// Schema للتحقق من طلب جلب الغرامات
const getFinesSchema = z.object({
    params: z.object({
        member_id: z.string().regex(/^\d+$/, "Member ID must be a number.").transform(Number)
    })
});

// Schema للتحقق من طلب دفع الغرامة
const payFineSchema = z.object({
    body: z.object({
        fine_id: z.number({ required_error: "Fine ID is required" }),
        // نفترض أن الدفع يتم بمبلغ محدد، لكن حالياً نطلب الـ ID فقط
        payment_amount: z.number({ required_error: "Payment amount is required" }).positive()
    })
});

module.exports = {
    getFinesSchema,
    payFineSchema
};