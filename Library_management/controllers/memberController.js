const Member=require('../models/memberModel');
module.exports={
 getMembers:async(req,res)=>{ res.json(await Member.getAll()); },
 createMember:async(req,res)=>{ await Member.create(req.body); res.json({message:"Member created"}); }
};