
// const { PrismaClient } = require('@prisma/client');

// // Create a single copy of PrismaClient
// const prisma = new PrismaClient({
//     // You can add options here such as logging queries
//     // log: ['query', 'info', 'warn', 'error'],
// });

// // Export the object for use by each Repository file
// module.exports = prisma;



// src/core/utils/prisma.js

// ✅ المسار الصحيح: نخرج من utils/ ثم من core/ ثم ندخل لـ generated/prisma
const { PrismaClient } = require('../../generated/prisma'); 

const prisma = new PrismaClient();

module.exports = prisma;