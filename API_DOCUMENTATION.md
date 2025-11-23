# API Documentation - StayHub Platform

**Base URL:** `http://localhost:5000/api`

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "guest"
}
```

**Response:** `201 Created`
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "guest",
  "createdAt": "2025-11-23T12:00:00Z"
}
```

---

### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "guest",
  "token": "session-token"
}
```

---

### POST /auth/logout
Logout current session.

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

## Property Endpoints

### GET /properties
Get all properties with optional filters.

**Query Parameters:**
```
?location=Malibu
?category=beachfront
?minPrice=100
?maxPrice=500
?guests=2
?search=beach
```

**Response:** `200 OK`
```json
[
  {
    "id": "prop-uuid",
    "title": "Beachfront Paradise Villa",
    "location": "Malibu, California",
    "description": "Stunning oceanfront villa with 4 bedrooms",
    "pricePerNight": 250,
    "cleaningFee": 100,
    "images": ["url1", "url2"],
    "amenities": ["WiFi", "Pool", "Hot Tub"],
    "beds": 4,
    "bedrooms": 3,
    "bathrooms": 2.5,
    "maxGuests": 8,
    "category": "beachfront",
    "hostId": "host-uuid",
    "hostName": "Jane Smith",
    "hostAvatar": "url",
    "rating": 4.8,
    "reviewCount": 42
  }
]
```

---

### GET /properties/:id
Get single property details.

**Response:** `200 OK`
```json
{
  "id": "prop-uuid",
  "title": "Beachfront Paradise Villa",
  "location": "Malibu, California",
  "description": "Full description...",
  "pricePerNight": 250,
  "cleaningFee": 100,
  "serviceFee": 50,
  "images": ["url1", "url2", "url3"],
  "amenities": ["WiFi", "Pool", "Hot Tub", "Kitchen", "Laundry"],
  "beds": 4,
  "bedrooms": 3,
  "bathrooms": 2.5,
  "maxGuests": 8,
  "category": "beachfront",
  "hostId": "host-uuid",
  "hostName": "Jane Smith",
  "hostAvatar": "url",
  "hostBio": "Professional host with 5+ years experience",
  "rating": 4.8,
  "reviewCount": 42,
  "checkinTime": "3:00 PM",
  "checkoutTime": "11:00 AM",
  "cancellationPolicy": "Flexible",
  "rules": ["No smoking", "No pets", "Quiet hours after 10pm"],
  "reviews": [
    {
      "id": "review-uuid",
      "userId": "user-uuid",
      "userName": "John D.",
      "rating": 5,
      "comment": "Amazing stay!",
      "createdAt": "2025-11-20T00:00:00Z"
    }
  ]
}
```

---

### POST /admin/properties
Create a new property (Admin/Host only).

**Request:**
```json
{
  "title": "Beach House",
  "location": "Malibu, California",
  "description": "Beautiful oceanfront property",
  "pricePerNight": 300,
  "cleaningFee": 100,
  "category": "beachfront",
  "beds": 3,
  "bedrooms": 2,
  "bathrooms": 2,
  "maxGuests": 6,
  "amenities": ["WiFi", "Pool"],
  "images": ["url1", "url2"]
}
```

**Response:** `201 Created`
```json
{
  "id": "prop-uuid",
  "title": "Beach House",
  "location": "Malibu, California",
  ...
}
```

---

### PATCH /admin/properties/:id
Update a property.

**Request:**
```json
{
  "pricePerNight": 350,
  "amenities": ["WiFi", "Pool", "Hot Tub"]
}
```

**Response:** `200 OK`
```json
{
  "id": "prop-uuid",
  "title": "Beach House",
  "pricePerNight": 350,
  ...
}
```

---

### DELETE /admin/properties/:id
Delete a property.

**Response:** `200 OK`
```json
{
  "message": "Property deleted successfully"
}
```

---

## Booking Endpoints

### POST /bookings
Create a new booking.

**Request:**
```json
{
  "propertyId": "prop-uuid",
  "checkIn": "2025-12-20",
  "checkOut": "2025-12-27",
  "guests": 2,
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "+1234567890"
}
```

**Response:** `201 Created`
```json
{
  "id": "booking-uuid",
  "propertyId": "prop-uuid",
  "checkIn": "2025-12-20T00:00:00Z",
  "checkOut": "2025-12-27T00:00:00Z",
  "guests": 2,
  "nights": 7,
  "subtotal": 2100,
  "cleaningFee": 100,
  "serviceFee": 58,
  "tax": 169.44,
  "totalPrice": 2427.44,
  "status": "reserved",
  "stripeSessionUrl": "https://stripe.com/pay/...",
  "squareCheckoutUrl": "https://square.com/pay/..."
}
```

---

### GET /bookings
Get user's bookings.

**Response:** `200 OK`
```json
[
  {
    "id": "booking-uuid",
    "propertyId": "prop-uuid",
    "propertyTitle": "Beachfront Villa",
    "checkIn": "2025-12-20T00:00:00Z",
    "checkOut": "2025-12-27T00:00:00Z",
    "nights": 7,
    "totalPrice": 2427.44,
    "status": "confirmed",
    "paymentStatus": "paid"
  }
]
```

---

### GET /bookings/:id
Get booking details.

**Response:** `200 OK`
```json
{
  "id": "booking-uuid",
  "propertyId": "prop-uuid",
  "propertyTitle": "Beachfront Villa",
  "propertyLocation": "Malibu, California",
  "checkIn": "2025-12-20T00:00:00Z",
  "checkOut": "2025-12-27T00:00:00Z",
  "guests": 2,
  "nights": 7,
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "subtotal": 2100,
  "cleaningFee": 100,
  "serviceFee": 58,
  "tax": 169.44,
  "totalPrice": 2427.44,
  "status": "confirmed",
  "paymentStatus": "paid",
  "paymentId": "sq_payment_uuid",
  "createdAt": "2025-11-23T12:00:00Z"
}
```

---

### PATCH /admin/bookings/:id
Update booking status (Admin only).

**Request:**
```json
{
  "status": "confirmed"
}
```

**Response:** `200 OK`
```json
{
  "id": "booking-uuid",
  "status": "confirmed",
  "updatedAt": "2025-11-23T12:30:00Z"
}
```

---

## Payment Endpoints

### POST /payments/create-checkout
Create a payment session (internal, called after booking).

**Request:**
```json
{
  "bookingId": "booking-uuid",
  "amount": 2427.44,
  "currency": "USD"
}
```

**Response:** `201 Created`
```json
{
  "checkoutUrl": "https://square.com/checkout/...",
  "sessionId": "sq_session_uuid"
}
```

---

### POST /payments/process-square
Process Square payment (called from frontend after tokenization).

**Request:**
```json
{
  "bookingId": "booking-uuid",
  "sourceId": "cnon_...",
  "amount": 2427.44
}
```

**Response:** `201 Created`
```json
{
  "bookingId": "booking-uuid",
  "paymentId": "sq_payment_uuid",
  "status": "completed",
  "amount": 2427.44,
  "transactionId": "sq_transaction_..."
}
```

---

## User Endpoints

### GET /users/me
Get current user profile.

**Response:** `200 OK`
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "guest",
  "language": "en",
  "avatar": "url",
  "bio": "Traveler and explorer",
  "joinedDate": "2025-11-20T00:00:00Z"
}
```

---

### PATCH /users/me
Update user profile.

**Request:**
```json
{
  "name": "John Doe",
  "language": "es",
  "bio": "Passionate traveler",
  "avatar": "url"
}
```

**Response:** `200 OK`
```json
{
  "id": "user-uuid",
  "name": "John Doe",
  "language": "es",
  "bio": "Passionate traveler"
}
```

---

## Chat Endpoints

### GET /messages/:userId
Get conversation with user.

**Query Parameters:**
```
?limit=50
?offset=0
```

**Response:** `200 OK`
```json
[
  {
    "id": "message-uuid",
    "senderId": "user1-uuid",
    "senderName": "John",
    "receiverId": "user2-uuid",
    "content": "Hi, how is the property?",
    "timestamp": "2025-11-23T12:00:00Z",
    "read": true
  }
]
```

---

### POST /messages
Send a message.

**Request:**
```json
{
  "receiverId": "user-uuid",
  "content": "Hi, I'm interested in your property",
  "attachments": ["url1", "url2"]
}
```

**Response:** `201 Created`
```json
{
  "id": "message-uuid",
  "senderId": "user-uuid",
  "receiverId": "user-uuid",
  "content": "Hi, I'm interested in your property",
  "timestamp": "2025-11-23T12:00:00Z",
  "attachments": ["url1", "url2"]
}
```

---

## Admin Endpoints

### GET /admin/dashboard
Get admin dashboard statistics.

**Response:** `200 OK`
```json
{
  "totalUsers": 1250,
  "totalProperties": 847,
  "totalBookings": 3420,
  "totalRevenue": 1245780.50,
  "bookingsThisMonth": 340,
  "revenueThisMonth": 124578.90,
  "averageRating": 4.7,
  "occupancyRate": 0.82
}
```

---

### GET /admin/audit-logs
Get audit logs (Admin only).

**Query Parameters:**
```
?limit=50
?offset=0
?action=booking
?userId=user-uuid
?startDate=2025-11-20
?endDate=2025-11-23
```

**Response:** `200 OK`
```json
[
  {
    "id": "log-uuid",
    "userId": "user-uuid",
    "action": "booking_created",
    "target": "booking-uuid",
    "details": "Guest booked property for 7 nights",
    "timestamp": "2025-11-23T12:00:00Z"
  }
]
```

---

### POST /admin/seasonal-pricing
Create seasonal pricing rule.

**Request:**
```json
{
  "propertyId": "prop-uuid",
  "startDate": "2025-12-20",
  "endDate": "2026-01-10",
  "multiplier": 1.5
}
```

**Response:** `201 Created`
```json
{
  "id": "rule-uuid",
  "propertyId": "prop-uuid",
  "startDate": "2025-12-20",
  "endDate": "2026-01-10",
  "multiplier": 1.5
}
```

---

### POST /admin/room-blocking
Block property dates.

**Request:**
```json
{
  "propertyId": "prop-uuid",
  "startDate": "2025-12-15",
  "endDate": "2025-12-20",
  "reason": "Maintenance and cleaning"
}
```

**Response:** `201 Created`
```json
{
  "id": "block-uuid",
  "propertyId": "prop-uuid",
  "startDate": "2025-12-15",
  "endDate": "2025-12-20",
  "reason": "Maintenance and cleaning"
}
```

---

### POST /admin/impersonate
Admin impersonate user (Admin only).

**Request:**
```json
{
  "userId": "user-uuid"
}
```

**Response:** `200 OK`
```json
{
  "message": "Impersonating user",
  "userId": "user-uuid",
  "impersonatedBy": "admin-uuid"
}
```

---

## WebSocket Endpoints

### ws://localhost:5000
Real-time chat connection.

**Connect:**
```javascript
const socket = new WebSocket('ws://localhost:5000');
```

**Send Message:**
```json
{
  "type": "message",
  "receiverId": "user-uuid",
  "content": "Hello!"
}
```

**Typing Indicator:**
```json
{
  "type": "typing",
  "receiverId": "user-uuid",
  "isTyping": true
}
```

**Online Status:**
```json
{
  "type": "online_status",
  "userId": "user-uuid",
  "status": "online"
}
```

---

## Error Responses

All errors follow this format:

**400 Bad Request:**
```json
{
  "error": "Invalid booking dates",
  "details": "Check-out must be after check-in"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "details": "Please login to continue"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "details": "You don't have permission to access this resource"
}
```

**404 Not Found:**
```json
{
  "error": "Not found",
  "details": "The requested resource was not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "details": "Something went wrong. Please try again later."
}
```

---

## Rate Limiting

- No rate limiting in development
- Production: 100 requests per minute per IP

---

## Authentication

All protected endpoints require:
- **Header:** `Authorization: Bearer <token>`
- Or: Valid session cookie from login

---

## Pagination

List endpoints support pagination:
- **limit:** Number of items (default: 20, max: 100)
- **offset:** Number of items to skip (default: 0)

Example: `/properties?limit=20&offset=40`

---

## Sorting

Some endpoints support sorting:
- **sort:** Field name (e.g., `createdAt`, `price`, `rating`)
- **order:** `asc` or `desc` (default: `desc`)

Example: `/bookings?sort=createdAt&order=desc`

---

## Filtering

Advanced filtering:
```
GET /properties?location=Malibu&minPrice=100&maxPrice=500&category=beachfront&guests=2
```

---

## Complete Example: Book a Property

```bash
# 1. Get property details
curl http://localhost:5000/api/properties/prop-uuid

# 2. Create booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop-uuid",
    "checkIn": "2025-12-20",
    "checkOut": "2025-12-27",
    "guests": 2,
    "guestName": "John Doe",
    "guestEmail": "john@example.com"
  }'

# 3. Response includes checkout URL
# 4. Redirect to payment or use Square Web SDK
# 5. After payment, booking status updates to "confirmed"
```

---

## Need Help?

- See `SETUP_GUIDE.md` for installation
- See `SQUARE_SETUP.md` for payment integration
- Check browser console for detailed error messages
