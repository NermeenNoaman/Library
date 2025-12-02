// src/domains/category/category.controller.js
import { CategoryService } from './category.service';
import { categoryFilterSchema, createCategorySchema, updateCategorySchema, validate } from './category.schema';

async function createCategory(req, res, next) {
  try {
    const validatedData = validate(createCategorySchema, req.body, res);
    if (!validatedData) return;

    const newCategory = await CategoryService.createCategory(validatedData);
    res.status(201).json(newCategory);
  } catch (error) {
    next(error); 
  }
}

async function getAllCategories(req, res, next) {
  try {
    const filters = validate(categoryFilterSchema, req.query, res);
    if (!filters) return;
    
    const categoriesResult = await CategoryService.getAllCategories(filters);
    res.status(200).json(categoriesResult);
  } catch (error) {
    next(error);
  }
}

async function getCategoryById(req, res, next) {
  try {
    const category_id = parseInt(req.params.category_id);
    if (isNaN(category_id)) return res.status(400).json({ error: 'Invalid Category ID' });

    const category = await CategoryService.getCategoryById(category_id);
    res.status(200).json(category);
  } catch (error) {
    next(error); 
  }
}

async function updateCategory(req, res, next) {
  try {
    const category_id = parseInt(req.params.category_id);
    if (isNaN(category_id)) return res.status(400).json({ error: 'Invalid Category ID' });
    
    const validatedData = validate(updateCategorySchema, { ...req.body, category_id }, res);
    if (!validatedData) return;
    
    const updatedCategory = await CategoryService.updateCategory(category_id, validatedData);
    res.status(200).json(updatedCategory);
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const category_id = parseInt(req.params.category_id);
    if (isNaN(category_id)) return res.status(400).json({ error: 'Invalid Category ID' });
    
    const deletedCategory = await CategoryService.deleteCategory(category_id);
    res.status(200).json({ message: 'Category deleted successfully', category: deletedCategory });
  } catch (error) {
    next(error);
  }
}

export const CategoryController = { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory };