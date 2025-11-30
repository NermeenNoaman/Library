const service = require('./librarian.service');

async function register(req, res, next) {
  try {
    const user = await service.register(req.body);
    res.json({ user });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const result = await service.login(req.body);
    if (!result) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = { register, login };
