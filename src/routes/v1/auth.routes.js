
const express = require('express');
const router = express.Router();
const authController = require('../../domains/auth/auth.controller');


const { verifyToken, authorize } = require('../../core/middlewares/auth.middleware');


router.post('/register', authController.register);
router.post('/login', authController.login);


router.get('/admin-dashboard', 
  verifyToken, 
  authorize(['Admin']), 
  (req, res) => res.json({ message: "Welcome Admin! You are powerful." })
);


router.get('/librarian-panel', 
  verifyToken, 
  authorize(['Librarian', 'Admin']), 
  (req, res) => res.json({ message: "Welcome Staff! You can manage books." })
);

router.get('/profile', 
  verifyToken, 
  (req, res) => res.json({ message: "Hello Member! Here is your profile.", user: req.user })
);

module.exports = router;