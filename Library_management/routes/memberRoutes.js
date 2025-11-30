const e=require('express'); const r=e.Router(); const c=require('../controllers/memberController');
r.get('/',c.getMembers); r.post('/',c.createMember); module.exports=r;