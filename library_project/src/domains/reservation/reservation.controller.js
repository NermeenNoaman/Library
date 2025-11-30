const service = require('./reservation.service');

async function create(req, res, next) {
  try {
    const payload = req.body;
    const result = await service.create(payload);
    res.json(result);
  } catch (err) { next(err); }
}

async function cancel(req, res, next) {
  try {
    const reservation_id = parseInt(req.params.id, 10);
    await service.cancel(reservation_id);
    res.json({ ok: true });
  } catch (err) { next(err); }
}

module.exports = { create, cancel };
