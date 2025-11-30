const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const memberRoutes = require('./routes/memberRoutes');
const librarianRoutes = require('./routes/librarianRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();
app.use(bodyParser.json());

app.use('/members', memberRoutes);
app.use('/librarians', librarianRoutes);
app.use('/reservations', reservationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));