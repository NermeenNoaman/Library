// src/app.js
const express = require('express');
const cors = require('cors');
const v1Router = require('./routes/v1'); // We will create it later
const globalErrorHandler = require('./core/utils/error-handler'); 

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// API Versioning
app.use('/api/v1', v1Router); 

// Global Error Handler    
app.use(globalErrorHandler);

// We will add the Global Error Handler here later
module.exports = app;