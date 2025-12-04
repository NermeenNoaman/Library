
const authService = require('./auth.service');

const { registerSchema, loginSchema } = require('./schemas/auth.schema');

const register = async (req, res, next) => {
  try {
        const validatedData = registerSchema.parse(req.body);


    const result = await authService.register(validatedData);

    res.status(201).json(result);
  } catch (error) {
    next(error); 
  }
};

const login = async (req, res, next) => {
  try {
      const validatedData = loginSchema.parse(req.body);

    const result = await authService.login(validatedData.email, validatedData.password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
const retrieveAllUsers = async (req, res, next) => {
  try {
    const users = await authService.retrieveAllUsers();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};
const changeUserRole = async (req, res, next) => {
    try {
        
        const userId = parseInt(req.params.id); 
        const { role } = req.body; 

        if (!role) {
            return res.status(400).json({ success: false, message: "New role is required in the request body." });
        }

        const updatedUser = await authService.changeUserRole(userId, role);

        res.status(200).json({ success: true, message: `Role changed successfully.`, data: updatedUser });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: `User with ID ${req.params.id} not found.` });
        }
        next(error);
    }
};
module.exports = { register, login,retrieveAllUsers, changeUserRole};