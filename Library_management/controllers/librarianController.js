const Librarian=require('../models/librarianModel'); const jwt=require('jsonwebtoken'); const bcrypt=require('bcrypt');
module.exports={
 createLibrarian:async(req,res)=>{ await Librarian.createLibrarian(req.body); res.json({message:"Librarian created"}); },
 login:async(req,res)=>{
  const{username,password}=req.body; const user=await Librarian.getByUsername(username);
  if(!user) return res.status(400).json({error:"User not found"});
  const ok=await bcrypt.compare(password,user.password);
  if(!ok) return res.status(400).json({error:"Wrong password"});
  const token=jwt.sign({id:user.librarian_id,role:"admin"},process.env.JWT_SECRET||"mysecret");
  res.json({token});
 }
};