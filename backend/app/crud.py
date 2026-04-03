from datetime import datetime
from bson import ObjectId
from app.database import users_col, projects_col, analyses_col, annotations_col, bookings_col


def to_doc(d):
    """
    MongoDB stores IDs as ObjectId(_id).
    The frontend needs plain strings.
    This converts _id → id for every document.
    """
    if d and "_id" in d:
        d["id"] = str(d.pop("_id"))
    return d


# ── USERS ──────────────────────────────────────────────────

async def create_user(username: str, email: str, hashed_password: str):
    user = {
        "username": username,
        "email": email,
        "password": hashed_password,
        "created_at": datetime.utcnow(),
    }
    result = await users_col.insert_one(user)
    user["id"] = str(result.inserted_id)
    return user


async def get_user_by_username(username: str):
    """Find a user by username — used during login."""
    return await users_col.find_one({"username": username})


# ── PROJECTS ───────────────────────────────────────────────

async def create_project(user_id: str, name: str, zip_path: str):
    project = {
        "user_id":    user_id,
        "name":       name,
        "zip_path":   zip_path,
        "created_at": datetime.utcnow(),
    }
    result = await projects_col.insert_one(project)
    return to_doc({**project, "_id": result.inserted_id})


async def get_user_projects(user_id: str):
    """Get all projects belonging to a specific user."""
    cursor = projects_col.find({"user_id": user_id}).sort("created_at", -1)
    return [to_doc(p) async for p in cursor]


# ── ANALYSES ───────────────────────────────────────────────

async def create_analysis(project_id: str, symbol_table: dict,
                           call_graph: dict, dep_graph: dict):
    analysis = {
        "project_id":   project_id,
        "symbol_table": symbol_table,
        "call_graph":   call_graph,
        "dep_graph":    dep_graph,
        "created_at":   datetime.utcnow(),
    }
    result = await analyses_col.insert_one(analysis)
    return to_doc({**analysis, "_id": result.inserted_id})


async def get_analysis(analysis_id: str):
    return to_doc(await analyses_col.find_one({"_id": ObjectId(analysis_id)}))


async def get_analyses_for_project(project_id: str):
    cursor = analyses_col.find({"project_id": project_id}).sort("created_at", -1)
    return [to_doc(a) async for a in cursor]


# ── ANNOTATIONS ────────────────────────────────────────────

async def create_annotation(analysis_id: str, node_id: str,
                              note: str, color: str):
    ann = {
        "analysis_id": analysis_id,
        "node_id":     node_id,
        "note":        note,
        "color":       color,
        "created_at":  datetime.utcnow(),
    }
    result = await annotations_col.insert_one(ann)
    return to_doc({**ann, "_id": result.inserted_id})


async def get_annotations(analysis_id: str):
    cursor = annotations_col.find({"analysis_id": analysis_id})
    return [to_doc(a) async for a in cursor]


async def delete_annotation(annotation_id: str):
    result = await annotations_col.find_one_and_delete(
        {"_id": ObjectId(annotation_id)}
    )
    return to_doc(result)

async def delete_project(project_id: str):
    result = await projects_col.find_one_and_delete(
        {"_id": ObjectId(project_id)}
    )
    # Also delete all analyses belonging to this project
    await analyses_col.delete_many({"project_id": project_id})
    return to_doc(result)


async def get_project(project_id: str):
    result = await projects_col.find_one({"_id": ObjectId(project_id)})
    return to_doc(result)


# ── BOOKINGS ───────────────────────────────────────────────

async def create_booking(full_name: str, email: str, company: str, slot_id: int, slot_date: str, slot_time: str, message: str):
    booking = {
        "full_name": full_name,
        "email": email,
        "company": company,
        "slot_id": slot_id,
        "slot_date": slot_date,
        "slot_time": slot_time,
        "message": message,
        "status": "confirmed",
        "created_at": datetime.utcnow(),
    }
    result = await bookings_col.insert_one(booking)
    return to_doc({**booking, "_id": result.inserted_id})


async def get_all_bookings():
    """Get all bookings for admin purposes."""
    bookings = []
    async for booking in bookings_col.find():
        bookings.append(to_doc(booking))
    return bookings


async def get_booked_slots():
    """Get all booked slot IDs to determine availability."""
    booked_slots = []
    async for booking in bookings_col.find({"status": "confirmed"}):
        booked_slots.append(booking["slot_id"])
    return booked_slots


async def get_user_bookings(email: str):
    """Get all bookings for a specific user email."""
    bookings = []
    async for booking in bookings_col.find({"email": email}):
        bookings.append(to_doc(booking))
    return bookings


async def cancel_booking(booking_id: str):
    """Cancel a booking by setting status to cancelled."""
    result = await bookings_col.find_one_and_update(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "cancelled"}},
        return_document=True
    )
    return to_doc(result)