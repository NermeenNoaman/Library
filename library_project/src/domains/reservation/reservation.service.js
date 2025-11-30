const repo = require('./reservation.repository');
const prisma = require('../../core/utils/prisma');

async function create(payload) {
  return prisma.$transaction(async (tx) => {
    const book = await tx.book.findUnique({ where: { book_id: payload.book_id } });
    if (!book) throw new Error('Book not found');
    const reservation = await tx.reservation.create({ data: {
      member_id: payload.member_id,
      book_id: payload.book_id,
      expiry_date: new Date(payload.expiry_date),
      status: 'Active',
      priority_number: payload.priority_number || 1
    }});
    if (book.available_copies > 0) {
      const due = new Date(); due.setDate(due.getDate() + 14);
      await tx.borrowing.create({
        data: {
          member_id: payload.member_id,
          book_id: payload.book_id,
          due_date: due,
          librarian_id: payload.librarian_id || 1
        }
      });
      await tx.book.update({ where: { book_id: payload.book_id }, data: { available_copies: book.available_copies - 1 } });
      await tx.reservation.update({ where: { reservation_id: reservation.reservation_id }, data: { status: 'Fulfilled' } });
      return { reservation_id: reservation.reservation_id, status: 'Fulfilled' };
    }
    return { reservation_id: reservation.reservation_id, status: 'Active' };
  });
}

async function cancel(reservation_id) {
  const resv = await prisma.reservation.findUnique({ where: { reservation_id } });
  if (!resv) throw new Error('Reservation not found');
  await prisma.reservation.update({ where: { reservation_id }, data: { status: 'Cancelled' } });
  if (resv.status === 'Fulfilled') {
    await prisma.book.update({ where: { book_id: resv.book_id }, data: { available_copies: { increment: 1 } } });
    const next = await repo.findNextWaiting(resv.book_id);
    if (next) {
      await prisma.reservation.update({ where: { reservation_id: next.reservation_id }, data: { status: 'Fulfilled' } });
      const due = new Date(); due.setDate(due.getDate() + 14);
      await prisma.borrowing.create({ data: { member_id: next.member_id, book_id: next.book_id, due_date: due, librarian_id: 1 } });
      await prisma.book.update({ where: { book_id: next.book_id }, data: { available_copies: { decrement: 1 } } });
    }
  }
  return true;
}

module.exports = { create, cancel };
