// src/domains/book/book.repository.js
import prisma from '../../core/prisma'; 

const bookSelectWithCategory = {
    book_id: true, isbn: true, title: true, author_name: true, publisher: true, publication_year: true, 
    total_copies: true, available_copies: true, language: true, pages: true, description: true, 
    cover_image: true, status: true, created_at: true, updated_at: true,
    category: { 
      select: { category_id: true, category_name: true, description: true, },
    },
};

async function create(data) {
  const available_copies = data.available_copies ?? data.total_copies ?? 1;
  return prisma.book.create({
    data: { ...data, available_copies },
    select: bookSelectWithCategory,
  });
}

async function findAll(filters) {
  const { search, category_id, author_name, status, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = filters;
  const skip = (page - 1) * limit;
  
  const where = {
    ...(category_id && { category_id }),
    ...(author_name && { author_name: { contains: author_name } }), 
    ...(status && { status }),
    ...(search && {
      OR: [{ title: { contains: search } }, { author_name: { contains: search } }, { isbn: { contains: search } }],
    }),
  };

  const [books, totalBooks] = await prisma.$transaction([
    prisma.book.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder }, select: bookSelectWithCategory }),
    prisma.book.count({ where }),
  ]);

  return { books, total: totalBooks, page, limit, totalPages: Math.ceil(totalBooks / limit) };
}

async function findById(book_id) {
  return prisma.book.findUnique({ where: { book_id }, select: bookSelectWithCategory });
}

async function update(book_id, data) {
  return prisma.book.update({ where: { book_id }, data, select: bookSelectWithCategory });
}

async function remove(book_id) {
  return prisma.book.delete({ where: { book_id }, select: bookSelectWithCategory });
}

async function getAvailableBooks(filters) {
  const availableFilter = { ...filters, status: 'Available', available_copies: { gt: 0 } };
  return findAll(availableFilter); 
}

export const BookRepository = { create, findAll, findById, update, remove, getAvailableBooks };