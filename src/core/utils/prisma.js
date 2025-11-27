
const { PrismaClient } = require('@prisma/client');

// Create a single copy of PrismaClient
const prisma = new PrismaClient({
    // You can add options here such as logging queries
    // log: ['query', 'info', 'warn', 'error'],
});

// Export the object for use by each Repository file
module.exports = prisma;