const prisma = require('../../core/utils/prisma');

async function createReservation(data) {
  return prisma.reservation.create({ data });
}

async function findNextWaiting(book_id) {
  return prisma.reservation.findFirst({
    where: { book_id, status: 'Active' },
    orderBy: [{ priority_number: 'desc' }, { created_at: 'asc' }]
  });
}

async function updateReservationStatus(reservation_id, status) {
  return prisma.reservation.update({ where: { reservation_id }, data: { status } });
}

module.exports = { createReservation, findNextWaiting, updateReservationStatus };
