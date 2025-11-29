const e=require('express'); const r=e.Router(); const c=require('../controllers/reservationController');
r.post('/create',c.create); r.post('/cancel',c.cancel); module.exports=r;