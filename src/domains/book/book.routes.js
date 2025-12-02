// src/domains/book/book.routes.js
import { Router } from 'express';
import { BookController } from './book.controller';
import { authMiddleware } from '../../core/middlewares/auth.middleware'; 

const router = Router();

router.post('/', authMiddleware, BookController.createBook);
router.get('/', BookController.getAllBooks); 
router.get('/available', BookController.getAvailableBooks);
router.get('/:book_id', BookController.getBookById);
router.patch('/:book_id', authMiddleware, BookController.updateBook); 
router.delete('/:book_id', authMiddleware, BookController.deleteBook);

export default router;