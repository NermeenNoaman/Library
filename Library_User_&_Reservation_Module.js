/*
Library Management 

Notes about schema mapping and small decisions:
- RESERVATION.status values in schema are: ('Active','Fulfilled','Cancelled','Expired')
  I use 'Active' to mean "a reservation exists (waiting or ready)". When a reservation is actually turned into a borrowing
  I set it to 'Fulfilled' and then call the stored procedure sp_borrow_book to create a BORROWING. This avoids adding new columns

- USER table: the SQL had a composite PK (user_id,email). In the implementation below we treat user_id as
  the primary identifier and always store the email value when inserting MEMBER/LIBRARIAN so FK constraints that reference (user_id,email)
  will be satisfied 

- DB name: library_management
- Default DB password: 12345 (used if no env var provided)

*/

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '12345';
const DB_NAME = process.env.DB_NAME || 'library_management';
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_a_real_secret';
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- helpers ---
async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = auth.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed Authorization header' });
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data; 
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

// --- AUTH ---
// Register user (generic) -> creates row in USER and optionally MEMBER or LIBRARIAN
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, fullname, phone, role } = req.body; // role: 'Member' | 'Librarian' | 'Admin'
    if (!email || !password || !fullname || !role) return res.status(400).json({ error: 'email,password,fullname,role required' });
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    // insert into USER
    const [r] = await pool.execute('INSERT INTO `USER` (email, password, fullname, phone, role) VALUES (?, ?, ?, ?, ?)', [email, hash, fullname, phone || null, role]);
    const userId = r.insertId;
    // If role is Member or Librarian, create associated row with same user_id and email (to satisfy composite FKs if present)
    if (role === 'Member') {
      await pool.execute('INSERT INTO MEMBER (user_id, email, first_name, last_name) VALUES (?, ?, ?, ?)', [userId, email, fullname.split(' ')[0] || fullname, fullname.split(' ').slice(1).join(' ') || '']);
    } else if (role === 'Librarian' || role === 'Admin') {
      await pool.execute('INSERT INTO LIBRARIAN (user_id, email, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)', [userId, email, fullname.split(' ')[0] || fullname, fullname.split(' ').slice(1).join(' ') || '', role === 'Admin' ? 'Admin' : 'Librarian']);
    }
    res.json({ user_id: userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email,password required' });
    const rows = await query('SELECT * FROM `USER` WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const u = rows[0];
    const match = await bcrypt.compare(password, u.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const payload = { id: u.user_id, role: u.role, email: u.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- MEMBERS CRUD ---
app.post('/members', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { user_id, email, first_name, last_name, phone, address, date_of_birth, membership_type } = req.body;
    if (!user_id || !email || !first_name) return res.status(400).json({ error: 'user_id,email,first_name required' });
    const [r] = await pool.execute('INSERT INTO MEMBER (user_id, email, first_name, last_name, phone, address, date_of_birth, membership_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [user_id, email, first_name, last_name || null, phone || null, address || null, date_of_birth || null, membership_type || 'Standard']);
    res.json({ member_id: r.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/members', authMiddleware, async (req, res) => {
  try {
    // librarians and admins can see all; members can see themselves
    if (req.user.role === 'Member') {
      const rows = await query('SELECT * FROM MEMBER WHERE user_id = ?', [req.user.id]);
      return res.json(rows);
    }
    const rows = await query('SELECT * FROM MEMBER');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/members/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const rows = await query('SELECT * FROM MEMBER WHERE member_id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Member not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/members/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const { first_name, last_name, phone, address, status } = req.body;
    // only admin or the member themselves
    if (req.user.role === 'Member') {
      const rows = await query('SELECT user_id FROM MEMBER WHERE member_id = ?', [id]);
      if (!rows.length) return res.status(404).json({ error: 'Member not found' });
      if (rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    }
    await pool.execute('UPDATE MEMBER SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), phone = COALESCE(?, phone), address = COALESCE(?, address), status = COALESCE(?, status) WHERE member_id = ?', [first_name, last_name, phone, address, status, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/members/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    await pool.execute('DELETE FROM MEMBER WHERE member_id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- LIBRARIANS CRUD (admin-only for writes) ---
app.post('/librarians', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { user_id, email, first_name, last_name, phone, role } = req.body;
    if (!user_id || !email || !first_name) return res.status(400).json({ error: 'user_id,email,first_name required' });
    const [r] = await pool.execute('INSERT INTO LIBRARIAN (user_id, email, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)', [user_id, email, first_name, last_name || null, phone || null, role || 'Librarian']);
    res.json({ librarian_id: r.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/librarians', authMiddleware, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM LIBRARIAN');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/librarians/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    const { first_name, last_name, phone, role, status } = req.body;
    await pool.execute('UPDATE LIBRARIAN SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), phone = COALESCE(?, phone), role = COALESCE(?, role), status = COALESCE(?, status) WHERE librarian_id = ?', [first_name, last_name, phone, role, status, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/librarians/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    await pool.execute('DELETE FROM LIBRARIAN WHERE librarian_id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- BOOKS CRUD ---
app.post('/books', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { isbn, title, author_id, category_id, publisher, publication_year, total_copies, available_copies, language, pages, description, cover_image, status } = req.body;
    if (!isbn || !title || !author_id || !category_id) return res.status(400).json({ error: 'isbn,title,author_id,category_id required' });
    const [r] = await pool.execute('INSERT INTO BOOK (isbn, title, author_id, category_id, publisher, publication_year, total_copies, available_copies, language, pages, description, cover_image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [isbn, title, author_id, category_id, publisher || null, publication_year || null, total_copies || 1, available_copies || total_copies || 1, language || 'English', pages || null, description || null, cover_image || null, status || 'Available']);
    res.json({ book_id: r.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/books', authMiddleware, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM BOOK');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/books/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const rows = await query('SELECT * FROM BOOK WHERE book_id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/books/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, publisher, total_copies, available_copies, status } = req.body;
    await pool.execute('UPDATE BOOK SET title = COALESCE(?, title), publisher = COALESCE(?, publisher), total_copies = COALESCE(?, total_copies), available_copies = COALESCE(?, available_copies), status = COALESCE(?, status) WHERE book_id = ?', [title, publisher, total_copies, available_copies, status, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/books/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    await pool.execute('DELETE FROM BOOK WHERE book_id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- RESERVATIONS ---
// Create reservation: if available_copies > 0 -> call sp_borrow_book and set reservation to 'Fulfilled'
// otherwise create reservation with status 'Active' (waiting)
app.post('/reservations', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Member') return res.status(403).json({ error: 'Only members can create reservations' });
    const memberRows = await query('SELECT member_id FROM MEMBER WHERE user_id = ?', [req.user.id]);
    if (!memberRows.length) return res.status(400).json({ error: 'Member profile not found for this user' });
    const member_id = memberRows[0].member_id;
    const { book_id, expiry_date, priority_number } = req.body;
    if (!book_id || !expiry_date) return res.status(400).json({ error: 'book_id and expiry_date required' });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      // lock book row
      const [brows] = await conn.execute('SELECT available_copies FROM BOOK WHERE book_id = ? FOR UPDATE', [book_id]);
      if (!brows.length) { await conn.rollback(); return res.status(404).json({ error: 'Book not found' }); }
      const available = brows[0].available_copies;
      // create reservation (initially Active)
      const [r] = await conn.execute('INSERT INTO RESERVATION (member_id, book_id, reservation_date, expiry_date, status, priority_number) VALUES (?, ?, CURRENT_DATE, ?, ?, ?)', [member_id, book_id, expiry_date, 'Active', priority_number || 1]);
      const reservationId = r.insertId;
      if (available > 0) {
        // available -> fulfill immediately by calling stored procedure to create borrowing
        // sp_borrow_book expects member_id, book_id, librarian_id, borrow_days
        // We don't have a librarian here; set librarian_id = NULL or require librarian to confirm borrowing. We'll try to call stored procedure with librarian_id = 1 (admin) if exists.
        // Safer approach: decrement available_copies here and leave spawning BORROWING to librarian. But per your procedures, we'll attempt to call sp_borrow_book with librarian 1.
        try {
          // call stored procedure
          const borrowDays = 14; // default borrow period
          const [callRes] = await conn.query('CALL sp_borrow_book(?, ?, ?, ?)', [member_id, book_id, 1, borrowDays]);
          // mark reservation fulfilled
          await conn.execute('UPDATE RESERVATION SET status = ? WHERE reservation_id = ?', ['Fulfilled', reservationId]);
          await conn.commit();
          return res.json({ reservation_id: reservationId, status: 'Fulfilled' });
        } catch (spErr) {
          // If calling stored procedure fails, rollback that part and keep reservation active
          console.error('sp_borrow_book error:', spErr.message);
          // do not fail the whole flow — return reservation created as Active
          await conn.commit();
          return res.json({ reservation_id: reservationId, status: 'Active', warning: 'Could not auto-borrow via stored procedure' });
        }
      }
      await conn.commit();
      res.json({ reservation_id: reservationId, status: 'Active' });
    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ error: err.message });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Cancel reservation
app.post('/reservations/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const reservation_id = req.params.id;
    // fetch reservation
    const rows = await query('SELECT * FROM RESERVATION WHERE reservation_id = ?', [reservation_id]);
    if (!rows.length) return res.status(404).json({ error: 'Reservation not found' });
    const reservation = rows[0];
    // permission: member who made it or admin/librarian
    if (req.user.role === 'Member') {
      const memberRows = await query('SELECT member_id FROM MEMBER WHERE user_id = ?', [req.user.id]);
      if (!memberRows.length) return res.status(403).json({ error: 'Member profile missing' });
      if (memberRows[0].member_id !== reservation.member_id) return res.status(403).json({ error: 'Forbidden' });
    }
    // update status to Cancelled
    await pool.execute('UPDATE RESERVATION SET status = ? WHERE reservation_id = ?', ['Cancelled', reservation_id]);
    // If reservation was Fulfilled, we should return the borrowing / increment copies — but fulfilled reservations usually have borrowing created; this logic is out of scope here (librarian handles returns)
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Promote next waiting reservation to Fulfilled (admin)
app.post('/books/:id/promote-next', authMiddleware, adminOnly, async (req, res) => {
  try {
    const book_id = req.params.id;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [brows] = await conn.execute('SELECT available_copies FROM BOOK WHERE book_id = ? FOR UPDATE', [book_id]);
      if (!brows.length) { await conn.rollback(); return res.status(404).json({ error: 'Book not found' }); }
      if (brows[0].available_copies <= 0) { await conn.rollback(); return res.status(400).json({ error: 'No available copies' }); }
      // find next reservation: ordered by priority_number DESC then created_at ASC
      const [waiting] = await conn.execute('SELECT reservation_id, member_id FROM RESERVATION WHERE book_id = ? AND status = ? ORDER BY priority_number DESC, created_at ASC LIMIT 1 FOR UPDATE', [book_id, 'Active']);
      if (!waiting.length) { await conn.rollback(); return res.status(404).json({ error: 'No active waiting reservations' }); }
      const next = waiting[0];
      // call stored proc to create borrowing
      try {
        const borrowDays = req.body.borrow_days || 14;
        await conn.query('CALL sp_borrow_book(?, ?, ?, ?)', [next.member_id, book_id, req.user.id, borrowDays]);
        await conn.execute('UPDATE RESERVATION SET status = ? WHERE reservation_id = ?', ['Fulfilled', next.reservation_id]);
        await conn.commit();
        return res.json({ promoted_reservation_id: next.reservation_id });
      } catch (spErr) {
        await conn.rollback();
        console.error(spErr);
        return res.status(500).json({ error: 'Failed to create borrowing via stored procedure' });
      }
    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ error: err.message });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// List reservations (member => their reservations; librarian => all)
app.get('/reservations', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'Member') {
      const memberRows = await query('SELECT member_id FROM MEMBER WHERE user_id = ?', [req.user.id]);
      if (!memberRows.length) return res.status(400).json({ error: 'Member profile not found' });
      const rows = await query('SELECT * FROM RESERVATION WHERE member_id = ?', [memberRows[0].member_id]);
      return res.json(rows);
    }
    const rows = await query('SELECT * FROM RESERVATION');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- BORROWING endpoints that use stored procedures ---
app.post('/borrow/:borrowing_id/return', authMiddleware, async (req, res) => {
  // librarian or admin can process returns, but members also can trigger return request
  try {
    const borrowing_id = req.params.borrowing_id;
    const daily_rate = req.body.daily_rate || 1.00;
    // call sp_return_book
    await pool.query('CALL sp_return_book(?, ?)', [borrowing_id, daily_rate]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// convenience: get active borrowings view
app.get('/views/active-borrowings', authMiddleware, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM vw_active_borrowings');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Library backend aligned to schema listening on port ${PORT}`);
});


