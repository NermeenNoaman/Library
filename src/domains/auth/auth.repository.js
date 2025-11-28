// src/domains/auth/auth.repository.js
const prisma = require('../../core/utils/prisma');

const createMemberTransaction = async (userData, memberData) => {
  return await prisma.$transaction(async (tx) => {
    
    // ---------------------------------------------------------
    // 1. خطوة إضافية: حساب الـ ID يدوياً (Manual ID Generation)
    // ---------------------------------------------------------
    // نبحث عن أكبر ID موجود حالياً في جدول User
    const maxIdResult = await tx.user.aggregate({
      _max: { user_id: true }
    });
    
    // الرقم الجديد = أكبر رقم موجود + 1
    // (لو الجدول فاضي، نبدأ برقم 1)
    const nextId = (maxIdResult._max.user_id || 0) + 1;

    // ---------------------------------------------------------
    // 2. إنشاء المستخدم بالـ ID الذي حسبناه
    // ---------------------------------------------------------
    const newUser = await tx.user.create({
      data: {
        user_id: nextId, // <--- هنا وضعنا الرقم اليدوي
        email: userData.email,
        password: userData.password,
        role: 'Member',
        fullname: userData.fullname,
        phone: userData.phone
      }
    });

    // ---------------------------------------------------------
    // 3. إنشاء العضو (Member)
    // ---------------------------------------------------------
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


module.exports = {
  createMemberTransaction,
  findUserByEmail,
  saveRefreshToken, 
};