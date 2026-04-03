from fastapi import APIRouter, HTTPException
from typing import List
from app.models import DemoBookingCreate, DemoBookingOut, DemoSlotOut
from app import crud

router = APIRouter(prefix="/bookings", tags=["Bookings"])

# Predefined demo slots
DEMO_SLOTS = [
    {"id": 1, "date": "2026-04-05", "time": "10:00 AM"},
    {"id": 2, "date": "2026-04-05", "time": "11:00 AM"},
    {"id": 3, "date": "2026-04-05", "time": "02:00 PM"},
    {"id": 4, "date": "2026-04-05", "time": "03:00 PM"},
    {"id": 5, "date": "2026-04-06", "time": "10:00 AM"},
    {"id": 6, "date": "2026-04-06", "time": "11:00 AM"},
    {"id": 7, "date": "2026-04-06", "time": "02:00 PM"},
    {"id": 8, "date": "2026-04-06", "time": "03:00 PM"},
    {"id": 9, "date": "2026-04-07", "time": "10:00 AM"},
    {"id": 10, "date": "2026-04-07", "time": "11:00 AM"},
    {"id": 11, "date": "2026-04-07", "time": "02:00 PM"},
    {"id": 12, "date": "2026-04-07", "time": "03:00 PM"},
]


@router.get("/slots", response_model=List[DemoSlotOut])
async def get_available_slots():
    """Get all demo slots with their availability status."""
    booked_slots = await crud.get_booked_slots()
    booked_slot_ids = set(booked_slots)

    slots = []
    for slot in DEMO_SLOTS:
        slots.append({
            "id": slot["id"],
            "date": slot["date"],
            "time": slot["time"],
            "available": slot["id"] not in booked_slot_ids
        })

    return slots


@router.post("/book", response_model=DemoBookingOut)
async def book_demo(body: DemoBookingCreate):
    """Book a demo slot."""
    # Check if slot is available
    booked_slots = await crud.get_booked_slots()
    if body.slot_id in booked_slots:
        raise HTTPException(status_code=400, detail="This slot is no longer available")

    # Validate slot exists
    slot_exists = any(slot["id"] == body.slot_id for slot in DEMO_SLOTS)
    if not slot_exists:
        raise HTTPException(status_code=400, detail="Invalid slot ID")

    # Create booking
    booking = await crud.create_booking(
        full_name=body.full_name,
        email=body.email,
        company=body.company or "",
        slot_id=body.slot_id,
        slot_date=body.slot_date,
        slot_time=body.slot_time,
        message=body.message or ""
    )

    return booking


@router.get("/user/{email}", response_model=List[DemoBookingOut])
async def get_user_bookings(email: str):
    """Get all bookings for a specific user."""
    bookings = await crud.get_user_bookings(email)
    return bookings


@router.delete("/{booking_id}")
async def cancel_booking(booking_id: str):
    """Cancel a booking."""
    booking = await crud.cancel_booking(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking cancelled successfully"}