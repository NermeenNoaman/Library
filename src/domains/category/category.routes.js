// src/domains/category/category.routes.js
import { Router } from 'express';
import { CategoryController } from './category.controller';
import { authMiddleware } from '../../core/middlewares/auth.middleware'; 

const router = Router();

// CRUD routes for Category
router.post('/', authMiddleware, CategoryController.createCategory);
router.get('/', CategoryController.getAllCategories); 
router.get('/:category_id', CategoryController.getCategoryById);
router.patch('/:category_id', authMiddleware, CategoryController.updateCategory); 
router.delete('/:category_id', authMiddleware, CategoryController.deleteCategory);

export default router;