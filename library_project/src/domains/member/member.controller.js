const service = require('./member.service');

async function register(req, res, next) {
  try {
    const user = await service.register(req.body);
    res.json({ user });
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const rows = await service.list();
    res.json(rows);
  } catch (err) { next(err); }
}

module.exports = { register, list };
