const express = require('express');
const router = express.Router();

const memberRoutes = require('../../domains/member/member.routes');
const librarianRoutes = require('../../domains/librarian/librarian.routes');
const reservationRoutes = require('../../domains/reservation/reservation.routes');

router.use('/members', memberRoutes);
router.use('/librarians', librarianRoutes);
router.use('/reservations', reservationRoutes);

module.exports = router;
