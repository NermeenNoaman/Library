const express = require('express');
const app = express();
require('dotenv').config();
const v1 = require('./routes/v1');
const errorHandler = require('./core/utils/error-handler');

app.use(express.json());
app.use('/api/v1', v1);
app.use(errorHandler);

module.exports = app;
