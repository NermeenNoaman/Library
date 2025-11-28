
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: "Access Denied! No token provided." 
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, 'MY_SECRET_KEY_123');
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: "Invalid or Expired Token!" 
    });
  }
};

const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

   
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "You do not have permission (Forbidden)!" 
      });
    }

    next();
  };
};

module.exports = { verifyToken, authorize };