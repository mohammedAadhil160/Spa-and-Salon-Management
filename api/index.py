from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bookings_db = []
booking_id_counter = 1

class LoginCredentials(BaseModel):
    email: str
    password: str

class BookingModel(BaseModel):
    name: str
    email: str
    serviceName: str
    date: str
    time: str
    type: str

@app.post("/api/auth/login")
def login(credentials: LoginCredentials):
    if credentials.email and credentials.password:
        return {
            "success": True,
            "token": "dummy-auth-token-12345",
            "message": "Login successful"
        }
    return {
        "success": False,
        "message": "Invalid credentials"
    }

@app.post("/api/bookings")
def create_booking(booking: BookingModel):
    global booking_id_counter
    saved_booking = booking.dict()
    saved_booking["id"] = booking_id_counter
    booking_id_counter += 1
    bookings_db.append(saved_booking)
    
    return {
        "success": True,
        "message": f"Booking confirmed successfully for {booking.name}",
        "booking": saved_booking
    }

@app.get("/api/bookings")
def get_all_bookings():
    return bookings_db

@app.get("/api/services")
def get_services():
    return [
        {"id": 1, "name": "Premium Haircut", "price": "₹3735", "type": "Hair", "popular": True},
        {"id": 2, "name": "Deep Tissue Massage", "price": "₹6640", "type": "Spa", "popular": True},
        {"id": 3, "name": "Keratin Treatment", "price": "₹9960", "type": "Hair", "popular": False},
        {"id": 4, "name": "Aromatherapy Facial", "price": "₹4980", "type": "Spa", "popular": True}
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
