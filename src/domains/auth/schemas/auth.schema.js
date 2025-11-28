
const { z } = require('zod');


const registerSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address format" }) 
       .min(5, { message: "Email is too short" }),
    
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" }) // أقل حاجة 8
    .max(100),
    
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  
  phone: z.string().optional(),
  address: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" })
});

module.exports = { registerSchema, loginSchema };