// src/domains/category/category.repository.js
import prisma from '../../core/prisma'; 

async function create(data) {
  return prisma.category.create({ data });
}

async function findAll(filters) {
  const { search, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where = {
    ...(search && { category_name: { contains: search } }),
  };

  const [categories, totalCategories] = await prisma.$transaction([
    prisma.category.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy: { created_at: 'desc' } 
    }),
    prisma.category.count({ where }),
  ]);

  return { categories, total: totalCategories, page, limit, totalPages: Math.ceil(totalCategories / limit) };
}

async function findById(category_id) {
  return prisma.category.findUnique({ where: { category_id } });
}

async function update(category_id, data) {
  return prisma.category.update({ where: { category_id }, data });
}

async function remove(category_id) {
  return prisma.category.delete({ where: { category_id } });
}

export const CategoryRepository = { create, findAll, findById, update, remove };