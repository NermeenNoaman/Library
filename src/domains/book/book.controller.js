// src/domains/book/book.controller.js
import { BookService } from './book.service';
import { bookFilterSchema, createBookSchema, updateBookSchema, validate } from './book.schema';

async function createBook(req, res, next) {
  try {
    const validatedData = validate(createBookSchema, req.body, res);
    if (!validatedData) return;

    const newBook = await BookService.createBook(validatedData);
    res.status(201).json(newBook);
  } catch (error) {
    next(error); 
  }
}

async function getAllBooks(req, res, next) {
  try {
    const filters = validate(bookFilterSchema, req.query, res);
    if (!filters) return;
    
    const booksResult = await BookService.getAllBooks(filters);
    res.status(200).json(booksResult);
  } catch (error) {
    next(error);
  }
}

async function getBookById(req, res, next) {
  try {
    const book_id = parseInt(req.params.book_id);
    if (isNaN(book_id)) return res.status(400).json({ error: 'Invalid Book ID' });

    const book = await BookService.getBookById(book_id);
    res.status(200).json(book);
  } catch (error) {
    next(error); 
  }
}

async function updateBook(req, res, next) {
  try {
    const book_id = parseInt(req.params.book_id);
    if (isNaN(book_id)) return res.status(400).json({ error: 'Invalid Book ID' });
    
    const validatedData = validate(updateBookSchema, { ...req.body, book_id }, res);
    if (!validatedData) return;
    
    const updatedBook = await BookService.updateBook(book_id, validatedData);
    res.status(200).json(updatedBook);
  } catch (error) {
    next(error);
  }
}

async function deleteBook(req, res, next) {
  try {
    const book_id = parseInt(req.params.book_id);
    if (isNaN(book_id)) return res.status(400).json({ error: 'Invalid Book ID' });
    
    const deletedBook = await BookService.deleteBook(book_id);
    res.status(200).json({ message: 'Book deleted successfully', book: deletedBook });
  } catch (error) {
    next(error);
  }
}

async function getAvailableBooks(req, res, next) {
    try {
        const filters = validate(bookFilterSchema, req.query, res);
        if (!filters) return;
        
        const availableBooks = await BookService.getAvailableBooks(filters);
        res.status(200).json(availableBooks);
    } catch (error) {
        next(error);
    }
}

export const BookController = { createBook, getAllBooks, getBookById, updateBook, deleteBook, getAvailableBooks };