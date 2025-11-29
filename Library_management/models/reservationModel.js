const db=require('../config/db');
module.exports={
 createReservation:async(m,b,p)=>{ await db.query(
  "INSERT INTO reservation (member_id,book_id,priority_number,status) VALUES (?,?,?,'Pending')",[m,b,p]); },
 cancelReservation:async(id)=>{ await db.query("DELETE FROM reservation WHERE reservation_id=?", [id]); }
};