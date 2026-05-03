import os
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# -------------------------------------------------------------------
# Database Configuration (SQLAlchemy)
# -------------------------------------------------------------------
# On Vercel, the filesystem is read-only except for /tmp.
if os.path.exists('/tmp'):
    default_db_url = "sqlite:////tmp/spa.db"
else:
    default_db_url = "sqlite:///spa.db"

DATABASE_URL = os.getenv("DATABASE_URL", default_db_url)

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# -------------------------------------------------------------------
# Database Models
# -------------------------------------------------------------------
class BookingDB(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, index=True)
    phone = Column(String, nullable=True)
    serviceName = Column(String)
    date = Column(String)
    time = Column(String)
    type = Column(String)
    status = Column(String, default="Confirmed") # Pending, Confirmed, Completed, Cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# -------------------------------------------------------------------
# Pydantic Schemas
# -------------------------------------------------------------------
class LoginCredentials(BaseModel):
    email: str
    password: str

class BookingCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    serviceName: str
    date: str
    time: str
    type: str

class BookingResponse(BookingCreate):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str

# -------------------------------------------------------------------
# FastAPI App Setup
# -------------------------------------------------------------------
app = FastAPI(title="Spa & Salon Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------------------------------------------
# Auth Endpoints
# -------------------------------------------------------------------
@app.post("/api/auth/login")
def login(credentials: LoginCredentials):
    # In a real app, verify against a users table and hash passwords
    if credentials.email == "admin@spa.com" and credentials.password == "admin123":
        return {
            "success": True,
            "token": "admin-super-secret-token",
            "message": "Login successful",
            "role": "admin"
        }
    return {
        "success": False,
        "message": "Invalid credentials"
    }

# -------------------------------------------------------------------
# Booking Endpoints
# -------------------------------------------------------------------
@app.post("/api/bookings", response_model=dict)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    try:
        db_booking = BookingDB(
            name=booking.name,
            email=booking.email,
            phone=booking.phone,
            serviceName=booking.serviceName,
            date=booking.date,
            time=booking.time,
            type=booking.type,
            status="Confirmed"
        )
        db.add(db_booking)
        db.commit()
        db.refresh(db_booking)
        
        return {
            "success": True,
            "message": f"Booking confirmed successfully for {booking.name}",
            "booking": {
                "id": db_booking.id,
                "name": db_booking.name,
                "serviceName": db_booking.serviceName,
                "date": db_booking.date,
                "time": db_booking.time,
                "status": db_booking.status
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bookings", response_model=List[BookingResponse])
def get_all_bookings(db: Session = Depends(get_db)):
    bookings = db.query(BookingDB).order_by(BookingDB.created_at.desc()).all()
    return bookings

@app.get("/api/bookings/{booking_id}", response_model=BookingResponse)
def get_booking_by_id(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(BookingDB).filter(BookingDB.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@app.put("/api/bookings/{booking_id}/status")
def update_booking_status(booking_id: int, status_update: StatusUpdate, db: Session = Depends(get_db)):
    booking = db.query(BookingDB).filter(BookingDB.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    valid_statuses = ["Pending", "Confirmed", "Completed", "Cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
    booking.status = status_update.status
    db.commit()
    db.refresh(booking)
    
    return {"success": True, "message": f"Booking {booking_id} status updated to {status_update.status}"}

@app.delete("/api/bookings/{booking_id}")
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(BookingDB).filter(BookingDB.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    db.delete(booking)
    db.commit()
    return {"success": True, "message": "Booking deleted successfully"}

# -------------------------------------------------------------------
# Services & Offers Endpoints
# -------------------------------------------------------------------
@app.get("/api/services")
def get_services():
    return [
        {"id": 1, "name": "Premium Haircut", "price": "₹3735", "type": "Hair", "popular": True},
        {"id": 2, "name": "Deep Tissue Massage", "price": "₹6640", "type": "Spa", "popular": True},
        {"id": 3, "name": "Keratin Treatment", "price": "₹9960", "type": "Hair", "popular": False},
        {"id": 4, "name": "Aromatherapy Facial", "price": "₹4980", "type": "Spa", "popular": True},
        {"id": 5, "name": "Scalp Therapy", "price": "₹4565", "type": "Hair", "popular": False},
        {"id": 6, "name": "VIP Diamond Package", "price": "₹16517", "type": "Full", "popular": True}
    ]

@app.get("/api/services/offers")
def get_offers():
    return [
        {"id": 1, "title": "Summer Glow Up", "description": "Get 20% off on all basic haircuts + free wash.", "discount": "20%"},
        {"id": 2, "title": "Couples Spa Day", "description": "Bring a partner and enjoy 30% off any premium massage.", "discount": "30%"}
    ]

@app.get("/api/services/recommendations")
def get_recommendations():
    return [
        {"id": 2, "name": "Deep Tissue Massage", "reason": "Highly rated for relaxation and stress relief."},
        {"id": 1, "name": "Premium Haircut", "reason": "Our most requested unisex service this week."}
    ]
