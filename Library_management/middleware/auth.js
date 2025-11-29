const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "mysecret";
module.exports = (req,res,next)=>{
    const token = req.headers.authorization;
    if(!token) return res.status(401).json({error:"No token"});
    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }catch{
        res.status(401).json({error:"Invalid token"});
    }
};