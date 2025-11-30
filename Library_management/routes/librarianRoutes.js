const e=require('express'); const r=e.Router(); const c=require('../controllers/librarianController');
r.post('/create',c.createLibrarian); r.post('/login',c.login); module.exports=r;