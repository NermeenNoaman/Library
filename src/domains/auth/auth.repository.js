
const prisma = require('../../core/utils/prisma');

const createMemberTransaction = async (userData, memberData) => {
  return await prisma.$transaction(async (tx) => {
 
    const maxIdResult = await tx.user.aggregate({
      _max: { user_id: true }
    });
    
   
    const nextId = (maxIdResult._max.user_id || 0) + 1;

    const newUser = await tx.user.create({
      data: {
        user_id: nextId, 
        email: userData.email,
        password: userData.password,
        role: 'Member',
        fullname: userData.fullname,
        phone: userData.phone
      }
    });

    const newMember = await tx.member.create({
      data: {
        user_id: newUser.user_id,
        email: newUser.email,
        first_name: memberData.firstName,
        last_name: memberData.lastName,
        phone: memberData.phone,
        address: memberData.address,
        membership_type: 'Standard'
      }
    });

    return { user: newUser, member: newMember };
  });
};

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email: email },
  });
};


const saveRefreshToken = async (userId, token, expiresAt) => {
  

  const user = await prisma.user.findUnique({ 
    where: { 
      user_id: userId 
    } 
  });

  return await prisma.refresh_token.create({
    data: {
      user_id: userId,
      token: token,
      expires: expiresAt,
      email: user.email 
    }
  });
};
const updateUserRole = async (userId, newRole) => {
  return await prisma.user.update({
    where: { user_id: userId }, 
    data: { role: newRole },
    select: { user_id: true, email: true, role: true, fullname: true }
  });
};

const getAllUsers = async () => {
  return await prisma.user.findMany({
   
    select: {
      user_id: true,
      email: true,
      fullname: true,
      role: true,
      created_at: true,
    },
  });
};

module.exports = {
  createMemberTransaction,
  findUserByEmail,
  saveRefreshToken,
  updateUserRole, 
  getAllUsers,
};