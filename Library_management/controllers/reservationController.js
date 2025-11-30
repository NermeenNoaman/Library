const Reservation=require('../models/reservationModel');
module.exports={
 create:async(req,res)=>{ const{member_id,book_id,priority}=req.body;
  await Reservation.createReservation(member_id,book_id,priority);
  res.json({message:"Reservation created"});
 },
 cancel:async(req,res)=>{ const{reservation_id}=req.body;
  await Reservation.cancelReservation(reservation_id);
  res.json({message:"Reservation cancelled"});
 }
};