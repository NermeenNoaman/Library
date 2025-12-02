// src/index.js
import express from 'express';
import { errorMiddleware } from './core/middlewares/error.middleware';

// Import domain routes
import bookRoutes from './domains/book/book.routes'; 
import categoryRoutes from './domains/category/category.routes'; 

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(express.json()); 

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// --- API Routes ---
// Mount Book Routes
app.use('/api/books', bookRoutes);
// Mount Category Routes
app.use('/api/categories', categoryRoutes); 

// --- Error Handling Middleware (MUST be the last middleware) ---
app.use(errorMiddleware);

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Book Routes available at /api/books');
    console.log('Category Routes available at /api/categories');
});