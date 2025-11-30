const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_a_real_secret';

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = auth.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed Authorization header' });
  try {
    const data = jwt.verify(token, JWT_SECRET);
    // attach full user maybe
    const user = await prisma.user.findUnique({ where: { user_id: data.id } });
    req.user = user || data;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
