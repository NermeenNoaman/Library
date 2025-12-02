const { z } = require('zod');

export const bookSchema = z.object({
  isbn: z.string().length(13, { message: 'ISBN must be 13 characters long' }).trim(),
  title: z.string().min(1, { message: 'Title is required' }).max(255).trim(),
  author_name: z.string().min(1, { message: 'Author name is required' }).max(200).trim(),
  category_id: z.number().int().positive({ message: 'Category ID must be a positive integer' }),
  publisher: z.string().max(200).nullable().optional(),
  publication_year: z.number().int().nullable().optional(),
  total_copies: z.number().int().min(0).default(1),
  available_copies: z.number().int().min(0).optional(), 
  language: z.string().max(50).default('English').optional(),
  pages: z.number().int().min(1).nullable().optional(),
  description: z.string().nullable().optional(),
  cover_image: z.string().url().max(500).nullable().optional(),
  status: z.enum(['Available', 'Unavailable', 'Damaged', 'Lost']).default('Available').optional(),
});

export const createBookSchema = bookSchema.extend({
  available_copies: z.number().int().min(0).optional(),
}).refine(data => data.available_copies === undefined || data.available_copies <= data.total_copies, {
  message: 'Available copies cannot exceed total copies',
  path: ['available_copies'],
});

export const updateBookSchema = bookSchema.partial().extend({
  book_id: z.number().int().positive(), 
}).refine(data => {
  if (data.available_copies !== undefined && data.total_copies !== undefined) {
    return data.available_copies <= data.total_copies;
  }
  return true;
}, {
  message: 'Available copies cannot exceed total copies',
  path: ['available_copies'],
});

export const bookFilterSchema = z.object({
  search: z.string().optional(),
  category_id: z.number().int().positive().optional(),
  author_name: z.string().optional(),
  status: z.enum(['Available', 'Unavailable', 'Damaged', 'Lost']).optional(),
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(10).optional(),
  sortBy: z.enum(['title', 'author_name', 'publication_year', 'created_at']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

/**
 * Utility function to validate data using Zod schema
 */
export const validate = (schema, data, res) => {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ 
                error: 'Validation Failed',
                details: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
            return null;
        }
        throw error;
    }
};