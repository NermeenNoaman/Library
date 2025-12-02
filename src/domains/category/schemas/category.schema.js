const { z } = require('zod');
import { validate } from '../book/book.schema'; // Reuse the shared validate function

// Base Schema
export const categorySchema = z.object({
  category_name: z.string().min(3, { message: 'Category name is required' }).max(100).trim(),
  description: z.string().max(1000).nullable().optional(),
});

// Create Schema
export const createCategorySchema = categorySchema;

// Update Schema
export const updateCategorySchema = categorySchema.partial().extend({
  category_id: z.number().int().positive(), 
});

// Filter Schema
export const categoryFilterSchema = z.object({
  search: z.string().optional(), // Search by name
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(10).optional(),
});

// Re-export validate utility
export { validate };