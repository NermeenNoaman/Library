const prisma = require('../../core/utils/prisma');

async function createLibrarianWithUser(data) {
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: data.passwordHash,
      fullname: data.fullname || data.first_name,
      phone: data.phone || null,
      role: data.role || 'Librarian',
      Librarian: { create: {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name || null,
        role: data.librarian_role || 'Librarian'
      }}
    },
    include: { Librarian: true }
  });
  return user;
}

async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

module.exports = { createLibrarianWithUser, findUserByEmail };
