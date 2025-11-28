
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

module.exports = { register, login };