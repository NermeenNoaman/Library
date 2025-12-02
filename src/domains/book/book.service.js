// src/domains/book/book.service.js
import { BookRepository } from './book.repository';

export class BookNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BookNotFoundError';
    this.status = 404;
  }
}

async function createBook(bookData) {
  return BookRepository.create(bookData);
}

async function getAllBooks(filters) {
  return BookRepository.findAll(filters);
}

async function getBookById(book_id) {
  const book = await BookRepository.findById(book_id);
  if (!book) {
    throw new BookNotFoundError(`Book with ID ${book_id} not found`);
  }
  return book;
}

async function updateBook(book_id, updateData) {
  const existingBook = await BookRepository.findById(book_id);
  if (!existingBook) {
    throw new BookNotFoundError(`Book with ID ${book_id} not found`);
  }

  const newTotalCopies = updateData.total_copies ?? existingBook.total_copies;
  const newAvailableCopies = updateData.available_copies ?? existingBook.available_copies;
  
  if (newAvailableCopies > newTotalCopies) {
     const error = new Error('Available copies cannot exceed total copies.');
     error.status = 400; 
     throw error;
  }

  return BookRepository.update(book_id, updateData);
}

async function deleteBook(book_id) {
  const book = await BookRepository.findById(book_id);
  if (!book) {
    throw new BookNotFoundError(`Book with ID ${book_id} not found`);
  }
  return BookRepository.remove(book_id);
}

async function getAvailableBooks(filters) {
    return BookRepository.getAvailableBooks(filters);
}

export const BookService = { createBook, getAllBooks, getBookById, updateBook, deleteBook, getAvailableBooks, BookNotFoundError };