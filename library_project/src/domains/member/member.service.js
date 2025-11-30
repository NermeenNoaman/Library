const repo = require('./member.repository');
const bcrypt = require('bcrypt');

async function register(payload) {
  if (!payload.password) throw new Error('password required');
  const passwordHash = await bcrypt.hash(payload.password, 10);
  payload.passwordHash = passwordHash;
  return repo.createMemberWithUser(payload);
}

async function list() {
  return repo.getAllMembers();
}

module.exports = { register, list };
