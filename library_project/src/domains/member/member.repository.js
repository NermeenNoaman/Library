const prisma = require('../../core/utils/prisma');

async function createMemberWithUser(data) {
  // data: { email, passwordHash, fullname, first_name, last_name, phone, membership_type }
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: data.passwordHash,
      fullname: data.fullname || data.first_name,
      phone: data.phone || null,
      role: 'Member',
      Member: {
        create: {
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name || null,
          phone: data.phone || null,
          membership_type: data.membership_type || 'Standard'
        }
      }
    },
    include: { Member: true }
  });
  return user;
}

async function getAllMembers() {
  return prisma.member.findMany();
}

async function findMemberByUserId(user_id) {
  return prisma.member.findFirst({ where: { user_id } });
}

module.exports = { createMemberWithUser, getAllMembers, findMemberByUserId };
