const db=require('../config/db'); const bcrypt=require('bcrypt');
module.exports={
 createLibrarian:async({username,password})=>{
  const hashed=await bcrypt.hash(password,10);
  await db.query("INSERT INTO librarian (username,password) VALUES (?,?)",[username,hashed]);
 },
 getByUsername:async(u)=>{ const[r]=await db.query("SELECT * FROM librarian WHERE username=?",[u]); return r[0]; }
};