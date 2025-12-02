// src/domains/category/category.service.js
import { CategoryRepository } from './category.repository';

export class CategoryNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CategoryNotFoundError';
    this.status = 404;
  }
}

async function createCategory(categoryData) {
  return CategoryRepository.create(categoryData);
}

async function getAllCategories(filters) {
  return CategoryRepository.findAll(filters);
}

async function getCategoryById(category_id) {
  const category = await CategoryRepository.findById(category_id);
  if (!category) {
    throw new CategoryNotFoundError(`Category with ID ${category_id} not found`);
  }
  return category;
}

async function updateCategory(category_id, updateData) {
  const existingCategory = await CategoryRepository.findById(category_id);
  if (!existingCategory) {
    throw new CategoryNotFoundError(`Category with ID ${category_id} not found`);
  }
  return CategoryRepository.update(category_id, updateData);
}

async function deleteCategory(category_id) {
  const category = await CategoryRepository.findById(category_id);
  if (!category) {
    throw new CategoryNotFoundError(`Category with ID ${category_id} not found`);
  }
  // Prisma will throw P2003 (Foreign Key Constraint) if books are linked, 
  // which is handled by error.middleware.js
  return CategoryRepository.remove(category_id);
}

export const CategoryService = { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory, CategoryNotFoundError };