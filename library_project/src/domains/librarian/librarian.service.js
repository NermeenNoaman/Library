const repo = require('./librarian.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function register(payload) {
  if (!payload.password) throw new Error('password required');
  const passwordHash = await bcrypt.hash(payload.password, 10);
  payload.passwordHash = passwordHash;
  return repo.createLibrarianWithUser(payload);
}

async function login(payload) {
  const user = await repo.findUserByEmail(payload.email);
  if (!user) return null;
  const match = await bcrypt.compare(payload.password, user.password);
  if (!match) return null;
  const token = jwt.sign({ id: user.user_id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
  return { token };
}

module.exports = { register, login };
