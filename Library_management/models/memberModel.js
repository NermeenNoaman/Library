const db=require('../config/db');
module.exports={
 getAll: async()=>{ const[r]=await db.query("SELECT * FROM member"); return r; },
 create: async(d)=>{ const{name,email,phone}=d; await db.query("INSERT INTO member (name,email,phone) VALUES (?,?,?)",[name,email,phone]); }
};