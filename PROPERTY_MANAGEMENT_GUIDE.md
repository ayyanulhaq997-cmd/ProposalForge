# Property Management Guide - Delete, Update, Calendar & Pricing

## Complete Property Management API

### 1. CREATE Property
```
POST /api/properties
Authorization: Required (Host/Admin)
Body: {
  "title": "Beachfront Villa",
  "description": "Beautiful beach property",
  "location": "Malibu, California",
  "pricePerNight": "250",
  "cleaningFee": "50",
  "serviceFee": "25",
  "taxRate": "0.0625",
  "guests": 6,
  "beds": 3,
  "bedrooms": 3,
  "bathrooms": 2,
  "amenities": ["WiFi", "Pool", "Beach"],
  "images": ["url1", "url2"]
}
Response: 201 - New property with ID
```

### 2. READ Property
```
GET /api/properties/:id
Response: Property details
```

### 3. UPDATE Property (All Fields)
```
PATCH /api/properties/:id
Authorization: Required (Host/Admin, own property or admin)
Body: {
  "title": "Updated Title",
  "description": "Updated description",
  "location": "Updated location",
  "guests": 8,
  "amenities": ["WiFi", "Pool", "Beach", "Kitchen"]
}
Response: Updated property
```

### 4. DELETE Property
```
DELETE /api/properties/:id
Authorization: Required (Host/Admin, own property or admin)
Response: { "message": "Property deleted successfully" }

Note: Deletes the property and all related bookings/messages
```

---

## Calendar Management

### Set Calendar Availability
```
POST /api/properties/:id/availability
Authorization: Required (Host/Admin)
Body: {
  "startDate": "2024-12-01",
  "endDate": "2024-12-15",
  "available": true  // Mark dates as available (true) or blocked (false)
}
Response: Availability record

Example: Block dates for maintenance
{
  "startDate": "2024-12-20",
  "endDate": "2024-12-25",
  "available": false
}
```

### Get Calendar (Check Availability)
```
GET /api/properties/:id/availability?startDate=2024-12-01&endDate=2024-12-31
Response: [
  {
    "propertyId": "prop123",
    "startDate": "2024-12-01",
    "endDate": "2024-12-15",
    "available": true
  }
]
```

---

## Pricing Management

### Update Base Pricing
```
PATCH /api/properties/:id/pricing
Authorization: Required (Host/Admin)
Body: {
  "pricePerNight": "300",      // Base nightly rate
  "cleaningFee": "75",         // One-time cleaning fee
  "serviceFee": "30",          // Platform service fee
  "taxRate": "0.0875",         // Tax rate (8.75%)
  "weekendPriceMultiplier": "1.5" // Weekend = 1.5x price
}
Response: Updated property with new pricing
```

### Create Seasonal Pricing
```
POST /api/properties/:id/seasonal-pricing
Authorization: Required (Host/Admin)
Body: {
  "name": "Summer Peak Season",
  "seasonName": "summer",
  "startDate": "2024-06-01",
  "endDate": "2024-08-31",
  "pricePerNight": "400",     // $400/night during summer
  "multiplier": "1.6"          // 60% increase
}
Response: 201 - Seasonal pricing rule created
```

### Get Seasonal Pricing Rules
```
GET /api/properties/:id/seasonal-pricing
Response: [
  {
    "name": "Summer Peak Season",
    "seasonName": "summer",
    "startDate": "2024-06-01",
    "endDate": "2024-08-31",
    "pricePerNight": "400",
    "multiplier": "1.6"
  },
  {
    "name": "Winter Holiday",
    "seasonName": "winter",
    "startDate": "2024-12-20",
    "endDate": "2025-01-05",
    "pricePerNight": "500",
    "multiplier": "2.0"
  }
]
```

---

## How Pricing Works

### Price Calculation Flow
1. **Base Price** = `pricePerNight`
2. **Apply Multipliers:**
   - If weekend (Fri/Sat/Sun): Base × `weekendPriceMultiplier`
   - If seasonal dates: Base × `multiplier`
   - Combined: Base × weekend × seasonal
3. **Add Fees:** + cleaningFee + serviceFee
4. **Apply Tax:** × (1 + taxRate)

### Example Calculation
```
Property Settings:
- pricePerNight: $250
- weekendPriceMultiplier: 1.5
- cleaningFee: $50
- serviceFee: $25
- taxRate: 0.0625 (6.25%)

Booking 3 nights (Fri, Sat, Sun):
- Night 1 (Fri): $250 × 1.5 = $375
- Night 2 (Sat): $250 × 1.5 = $375
- Night 3 (Sun): $250 × 1.5 = $375
Subtotal: $1,125

Add Fees: $1,125 + $50 + $25 = $1,200
Tax: $1,200 × 0.0625 = $75
Total: $1,275
```

---

## Test Scenarios

### Scenario 1: Update Base Pricing
1. Host updates property price from $250 to $300/night
2. All future bookings use new $300 price
3. **Existing bookings NOT affected** (pricing locked at booking time)

### Scenario 2: Add Weekend Markup
1. Set weekendPriceMultiplier to 1.5
2. Friday-Sunday nights = price × 1.5
3. Weekday nights = normal price

### Scenario 3: Seasonal Pricing
1. Add summer season: June-Aug at $400/night
2. Add winter holidays: Dec 20-Jan 5 at $500/night
3. Other dates use base price
4. System applies highest applicable multiplier

### Scenario 4: Block Dates for Maintenance
1. POST /api/properties/:id/availability
2. startDate: 2024-12-20, endDate: 2024-12-25, available: false
3. Dates marked as blocked - no bookings allowed
4. Display as "Unavailable" in calendar UI

---

## Data Isolation Guarantee

✅ Host 1 updates pricing → Only affects Host 1's property
✅ Host 1 blocks dates → Only affects Host 1's calendar
✅ Host 1 deletes property → Host 2 properties unchanged
✅ Each host sees only their own properties/changes
✅ Admin can see and manage all properties

---

## Complete Workflow Example

```
1. CREATE property
   POST /api/properties
   
2. SET base pricing
   PATCH /api/properties/{id}/pricing
   pricePerNight: $250, cleaningFee: $50, taxRate: 0.0625
   
3. ADD seasonal pricing
   POST /api/properties/{id}/seasonal-pricing
   Summer: June-Aug at $400/night (1.6x multiplier)
   
4. BLOCK maintenance dates
   POST /api/properties/{id}/availability
   startDate: Dec 20, endDate: Dec 25, available: false
   
5. OPEN dates for booking
   POST /api/properties/{id}/availability
   startDate: Dec 26, endDate: Dec 31, available: true
   
6. UPDATE pricing (mid-season)
   PATCH /api/properties/{id}/pricing
   pricePerNight: $300 (new base)
   
7. DELETE property (when done)
   DELETE /api/properties/{id}
```

---

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/properties | Create property |
| GET | /api/properties/:id | Get property details |
| PATCH | /api/properties/:id | Update property info |
| DELETE | /api/properties/:id | Delete property |
| POST | /api/properties/:id/availability | Set calendar dates |
| GET | /api/properties/:id/availability | Get calendar |
| PATCH | /api/properties/:id/pricing | Update base pricing |
| POST | /api/properties/:id/seasonal-pricing | Add seasonal pricing |
| GET | /api/properties/:id/seasonal-pricing | Get seasonal rules |

---

## Security & Permissions

✅ Hosts can only manage their own properties
✅ Admins can manage all properties
✅ All changes logged in audit trail
✅ Deleted properties cannot be recovered (archive first if needed)
✅ Pricing changes apply immediately to future bookings
✅ Existing bookings keep original pricing

---

## Error Handling

```
400 Bad Request - Invalid data format or missing required fields
401 Unauthorized - Not authenticated
403 Forbidden - Trying to modify another host's property
404 Not Found - Property doesn't exist
500 Server Error - Database or system error
```

---

## Best Practices

1. **Always set pricing before taking bookings** - Calculate expected revenue
2. **Block seasonal dates for maintenance** - Prevent double-bookings
3. **Use seasonal pricing strategically** - Higher rates during peak season
4. **Test pricing calculation** - Verify math before going live
5. **Review audit logs** - Track all pricing changes
6. **Back up pricing rules** - Document seasonal patterns for next year

---

**Status:** All endpoints implemented and tested ✅
**Data Isolation:** Multi-host safe ✅
**Audit Logging:** All changes tracked ✅
