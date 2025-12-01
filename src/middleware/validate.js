// // src/middleware/validate.js

// const { z } = require('zod');

// // دالة Middleware تقبل الـ Schema وتُرجع دالة Express Middleware
// const validate = (schema) => (req, res, next) => {
//   try {
//     // محاولة تحليل (Parse) بيانات الـ Body باستخدام الـ Schema المُمرر
//     schema.parse(req.body); 
    
//     // إذا نجح التحقق، انتقل إلى الدالة التالية (الـ Controller)
//     next();
//   } catch (error) {
//     // إذا فشل التحقق (خطأ Zod)
//     if (error instanceof z.ZodError) {
//       // نرسل خطأ 400 (Bad Request) مع تفاصيل الأخطاء
//       return res.status(400).json({
//         message: 'Validation failed',
//         errors: error.errors.map(err => ({
//           path: err.path.join('.'),
//           message: err.message,
//         })),
//       });
//     }
//     // لأي خطأ آخر غير متوقع
//     next(error); 
//   }
// };

// module.exports = validate;

// src/middleware/validate.js (الكود المصحح)

const validate = (schema) => (req, res, next) => {
    try {
        // نستخدم spread operator لتمرير كل حقول الطلب في object واحد للـ schema
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        if (!result.success) {
            // 🚨🚨 التعديل الحاسم هنا 🚨🚨
            // نستخدم Safe Access (?.) ونضع قيمة افتراضية مصفوفة فارغة 
            // لضمان عدم حدوث خطأ عند استخدام .map()
            const errors = result.error?.issues || []; 

            const validationErrors = errors.map(issue => ({
                path: issue.path.join('.'),
                message: issue.message,
            }));

            // نرسل الرد 400 Bad Request
            return res.status(400).json({ 
                success: false,
                message: "Validation failed.", 
                errors: validationErrors 
            });
        }
        
        // إذا كان ناجحاً، نمرر البيانات النظيفة (إذا لزم الأمر)
        // req.validatedData = result.data; 

        next();
    } catch (err) {
        console.error('Error during validation middleware:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error during validation.' });
    }
};

module.exports = validate;