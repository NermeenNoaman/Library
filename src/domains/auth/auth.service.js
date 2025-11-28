
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');


const register = async (data) => {

  const existingUser = await authRepository.findUserByEmail(data.email);
  if (existingUser) {
    throw new Error('Email already exists');
  }


  const hashedPassword = await bcrypt.hash(data.password, 10);


  const userData = {
    email: data.email,
    password: hashedPassword,
    fullname: `${data.firstName} ${data.lastName}`,
    phone: data.phone
  };

  const memberData = {
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    address: data.address
  };

  const result = await authRepository.createMemberTransaction(userData, memberData);

  return {
    success: true,
    message: "User registered successfully",
    userId: result.user.user_id,
    email: result.user.email
  };
};


const login = async (email, password) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }


  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const accessToken = jwt.sign(
    { userId: user.user_id, role: user.role },
    'MY_SECRET_KEY_123',
    { expiresIn: '1h' }
  );


  const refreshToken = jwt.sign(
    { userId: user.user_id },
    'MY_REFRESH_SECRET_123',
    { expiresIn: '7d' }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  await authRepository.saveRefreshToken(user.user_id, refreshToken, expiresAt);

  return {
    success: true,
    message: "Login successful",
    accessToken,
    refreshToken
  };
};

module.exports = {
  register,
  login 
};