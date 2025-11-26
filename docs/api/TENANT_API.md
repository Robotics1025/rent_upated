# 🎯 Tenant Portal - API Endpoints

## Overview

This document covers all API endpoints specifically for tenant functionality: viewing occupied units, managing payments, browsing vacant properties, and booking units.

---

## 🏠 My Units - Tenant Unit Management

### GET `/api/tenants/my-units`
Get all units currently occupied by the logged-in tenant

**Authentication:** Required (TENANT role)

**Response:**
```json
{
  "success": true,
  "data": {
    "activeUnits": [
      {
        "id": "tenancy_123",
        "tenancyNumber": "TN20251201001",
        "status": "ACTIVE",
        "unit": {
          "id": "unit_123",
          "unitCode": "A101",
          "name": "Apartment A101",
          "bedrooms": 2,
          "bathrooms": 2,
          "squareMeters": 85.5,
          "isFurnished": true,
          "amenities": {
            "features": ["Kitchen", "Balcony", "WiFi"]
          },
          "images": [...]
        },
        "property": {
          "id": "prop_123",
          "name": "Greenview Apartments",
          "address": "123 Main Street, Kampala",
          "propertyManager": {
            "name": "John Manager",
            "phone": "+256700111222",
            "email": "manager@greenview.com"
          }
        },
        "monthlyRent": 1200000,
        "depositPaid": 2400000,
        "currency": "UGX",
        "startDate": "2025-12-01",
        "endDate": "2026-11-30",
        "nextPaymentDue": "2026-01-01",
        "contractUrl": "https://storage.example.com/contracts/TN20251201001.pdf"
      }
    ],
    "summary": {
      "totalActiveUnits": 1,
      "totalMonthlyRent": 1200000,
      "upcomingPayments": 1,
      "currency": "UGX"
    }
  }
}
```

---

### GET `/api/tenants/units/:unitId`
Get detailed information about a specific unit the tenant occupies

**Authentication:** Required (TENANT role)

**Response:**
```json
{
  "success": true,
  "data": {
    "unit": {
      "id": "unit_123",
      "unitCode": "A101",
      "name": "Apartment A101",
      "description": "Modern 2-bedroom apartment with balcony",
      "bedrooms": 2,
      "bathrooms": 2,
      "squareMeters": 85.5,
      "floor": 1,
      "isFurnished": true,
      "hasBalcony": true,
      "hasWifi": true,
      "hasAC": true,
      "hasParking": true,
      "amenities": {
        "features": ["Kitchen", "Dining room", "Living room", "Balcony"],
        "appliances": ["Fridge", "Microwave", "Washing machine"],
        "utilities": ["WiFi", "Water", "Electricity included"]
      },
      "images": [
        {
          "url": "https://cdn.example.com/units/a101-living.jpg",
          "description": "Living room"
        },
        {
          "url": "https://cdn.example.com/units/a101-bedroom.jpg",
          "description": "Master bedroom"
        }
      ]
    },
    "tenancy": {
      "tenancyNumber": "TN20251201001",
      "status": "ACTIVE",
      "startDate": "2025-12-01",
      "endDate": "2026-11-30",
      "monthlyRent": 1200000,
      "depositPaid": 2400000,
      "contractUrl": "https://storage.example.com/contracts/TN20251201001.pdf"
    },
    "property": {
      "name": "Greenview Apartments",
      "addressLine1": "123 Main Street",
      "city": "Kampala",
      "latitude": 0.3476,
      "longitude": 32.5825,
      "propertyManager": {
        "name": "John Manager",
        "phone": "+256700111222",
        "email": "manager@greenview.com"
      }
    },
    "paymentSummary": {
      "nextDueDate": "2026-01-01",
      "nextAmount": 1200000,
      "totalPaid": 4800000,
      "lastPaymentDate": "2025-12-01"
    }
  }
}
```

---

## 💰 Payment Management

### GET `/api/tenants/payments`
Get all payments for the logged-in tenant

**Authentication:** Required (TENANT role)

**Query Parameters:**
- `unitId` - Filter by specific unit
- `purpose` - Filter by purpose (MONTHLY_RENT, SECURITY_DEPOSIT, etc.)
- `status` - Filter by status (SUCCESS, PENDING, FAILED)
- `startDate`, `endDate` - Date range
- `page`, `limit` - Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "payment_123",
        "transactionId": "TXN20251201001",
        "amount": 1200000,
        "currency": "UGX",
        "purpose": "MONTHLY_RENT",
        "method": "MOBILE_MONEY",
        "status": "SUCCESS",
        "description": "December 2025 Rent - Unit A101",
        "unit": {
          "unitCode": "A101",
          "property": "Greenview Apartments"
        },
        "receiptUrl": "https://receipts.example.com/TXN20251201001.pdf",
        "paidAt": "2025-12-01T10:30:00Z",
        "createdAt": "2025-12-01T10:25:00Z"
      },
      {
        "id": "payment_124",
        "transactionId": "TXN20251124002",
        "amount": 2400000,
        "currency": "UGX",
        "purpose": "SECURITY_DEPOSIT",
        "method": "BANK_TRANSFER",
        "status": "SUCCESS",
        "description": "Security Deposit - Unit A101",
        "receiptUrl": "https://receipts.example.com/TXN20251124002.pdf",
        "paidAt": "2025-11-24T14:15:00Z"
      }
    ],
    "summary": {
      "totalPaid": 4800000,
      "totalPending": 0,
      "upcomingPayment": {
        "dueDate": "2026-01-01",
        "amount": 1200000,
        "purpose": "MONTHLY_RENT",
        "unit": "A101"
      }
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 4,
      "pages": 1
    }
  }
}
```

---

### GET `/api/tenants/payments/upcoming`
Get upcoming payments due for tenant's units

**Authentication:** Required (TENANT role)

**Response:**
```json
{
  "success": true,
  "data": {
    "upcomingPayments": [
      {
        "unitId": "unit_123",
        "unitCode": "A101",
        "property": "Greenview Apartments",
        "purpose": "MONTHLY_RENT",
        "amount": 1200000,
        "currency": "UGX",
        "dueDate": "2026-01-01",
        "daysUntilDue": 7,
        "isOverdue": false
      }
    ],
    "totalDue": 1200000,
    "currency": "UGX"
  }
}
```

---

### POST `/api/tenants/payments/pay-rent`
Make a rent payment for a specific unit

**Authentication:** Required (TENANT role)

**Request:**
```json
{
  "unitId": "unit_123",
  "tenancyId": "tenancy_123",
  "amount": 1200000,
  "currency": "UGX",
  "purpose": "MONTHLY_RENT",
  "paymentMethod": "MOBILE_MONEY",
  "phoneNumber": "+256700123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "payment_125",
      "transactionId": "TXN20260101001",
      "amount": 1200000,
      "status": "PENDING"
    },
    "paymentLink": "https://checkout.flutterwave.com/v3/hosted/pay/abc123",
    "message": "Redirecting to payment gateway..."
  }
}
```

---

### GET `/api/tenants/payments/:id/receipt`
Download payment receipt

**Authentication:** Required (TENANT role)

**Response:** PDF file download

---

## 🔍 Browse Vacant Units

### GET `/api/marketplace/units`
Browse all available units (PUBLIC endpoint - no auth required)

**Query Parameters:**
- `city` - Filter by city
- `region` - Filter by region
- `propertyType` - Filter by property type
- `tenancyType` - Filter by tenancy type (MONTHLY_RENT, SHORT_TERM_STAY, etc.)
- `minPrice`, `maxPrice` - Price range
- `bedrooms` - Number of bedrooms
- `bathrooms` - Number of bathrooms
- `isFurnished` - true/false
- `hasWifi`, `hasAC`, `hasParking`, `hasBalcony` - Amenity filters
- `availableFrom` - Available from date
- `search` - Text search in title/description
- `sort` - `price_asc`, `price_desc`, `newest`, `popular`
- `page`, `limit` - Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "listing_234",
        "title": "Beautiful 2BR Apartment in City Center",
        "description": "Modern, fully furnished apartment...",
        "unit": {
          "id": "unit_234",
          "unitCode": "B205",
          "bedrooms": 2,
          "bathrooms": 2,
          "squareMeters": 90,
          "isFurnished": true,
          "hasWifi": true,
          "hasBalcony": true,
          "hasParking": true
        },
        "property": {
          "id": "prop_123",
          "name": "Greenview Apartments",
          "propertyType": "APARTMENT_BUILDING",
          "city": "Kampala",
          "region": "Central",
          "address": "123 Main Street"
        },
        "pricing": {
          "price": 1400000,
          "deposit": 2800000,
          "currency": "UGX"
        },
        "availability": {
          "availableFrom": "2025-12-15",
          "minimumStay": 30,
          "status": "AVAILABLE"
        },
        "thumbnail": "https://cdn.example.com/listings/listing_234_thumb.jpg",
        "images": [
          "https://cdn.example.com/listings/listing_234_1.jpg",
          "https://cdn.example.com/listings/listing_234_2.jpg"
        ],
        "viewCount": 145,
        "isPromoted": false
      }
    ],
    "filters": {
      "cities": ["Kampala", "Entebbe", "Jinja"],
      "priceRange": {
        "min": 500000,
        "max": 5000000
      },
      "bedroomOptions": [1, 2, 3, 4],
      "propertyTypes": ["APARTMENT_BUILDING", "HOUSE", "TOWNHOUSE"]
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 87,
      "pages": 5
    }
  }
}
```

---

### GET `/api/marketplace/units/:id`
Get detailed information about a specific available unit (PUBLIC)

**Response:**
```json
{
  "success": true,
  "data": {
    "listing": {
      "id": "listing_234",
      "title": "Beautiful 2BR Apartment in City Center",
      "description": "Spacious and modern 2-bedroom apartment located in the heart of Kampala. Fully furnished with contemporary furniture, high-speed WiFi, air conditioning, and a beautiful balcony overlooking the city.",
      "highlights": {
        "keyFeatures": [
          "Prime city center location",
          "Fully furnished",
          "High-speed WiFi included",
          "Secure 24/7 parking",
          "Modern kitchen appliances"
        ]
      },
      "status": "PUBLISHED",
      "viewCount": 145
    },
    "unit": {
      "id": "unit_234",
      "unitCode": "B205",
      "name": "Apartment B205",
      "bedrooms": 2,
      "bathrooms": 2,
      "squareMeters": 90,
      "floor": 2,
      "isFurnished": true,
      "hasBalcony": true,
      "hasWifi": true,
      "hasAC": true,
      "hasPet": false,
      "hasParking": true,
      "amenities": {
        "features": ["Kitchen", "Dining room", "Living room", "Balcony", "Study room"],
        "appliances": ["Fridge", "Microwave", "Washing machine", "Dishwasher", "TV"],
        "utilities": ["WiFi", "Water", "Security", "Parking"]
      }
    },
    "property": {
      "id": "prop_123",
      "name": "Greenview Apartments",
      "propertyType": "APARTMENT_BUILDING",
      "tenancyType": "MONTHLY_RENT",
      "description": "Modern apartment complex with excellent amenities",
      "address": {
        "addressLine1": "123 Main Street",
        "city": "Kampala",
        "region": "Central",
        "country": "Uganda",
        "latitude": 0.3476,
        "longitude": 32.5825
      },
      "propertyManager": {
        "name": "John Manager",
        "phone": "+256700111222",
        "email": "info@greenview.com"
      }
    },
    "pricing": {
      "monthlyRent": 1400000,
      "securityDeposit": 2800000,
      "currency": "UGX",
      "utilitiesIncluded": ["Water", "WiFi", "Security"]
    },
    "availability": {
      "availableFrom": "2025-12-15",
      "availableTo": null,
      "minimumStay": 30,
      "status": "AVAILABLE"
    },
    "images": [
      {
        "id": "img_1",
        "url": "https://cdn.example.com/units/b205-living.jpg",
        "description": "Living room with balcony view"
      },
      {
        "id": "img_2",
        "url": "https://cdn.example.com/units/b205-bedroom.jpg",
        "description": "Master bedroom"
      },
      {
        "id": "img_3",
        "url": "https://cdn.example.com/units/b205-kitchen.jpg",
        "description": "Modern kitchen"
      }
    ],
    "similarUnits": [
      {
        "id": "listing_235",
        "title": "2BR Apartment - Unit C102",
        "price": 1300000,
        "thumbnail": "..."
      }
    ]
  }
}
```

---

## 📅 Booking Flow

### POST `/api/tenants/bookings/create`
Create a booking request for a vacant unit

**Authentication:** Required (TENANT or MEMBER role)

**Request:**
```json
{
  "listingId": "listing_234",
  "bookingType": "LONG_TERM",
  "checkInDate": "2025-12-15",
  "numberOfGuests": 2,
  "specialRequests": "Would like a parking space near the entrance"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking_456",
      "bookingNumber": "BK20251124003",
      "status": "PENDING",
      "listing": {
        "title": "Beautiful 2BR Apartment in City Center",
        "unit": "B205",
        "property": "Greenview Apartments"
      },
      "checkInDate": "2025-12-15",
      "totalAmount": 1400000,
      "depositAmount": 2800000,
      "currency": "UGX",
      "createdAt": "2025-11-24T15:00:00Z"
    },
    "nextSteps": {
      "step": 1,
      "action": "AWAIT_CONFIRMATION",
      "message": "Your booking request has been submitted. The property manager will review it within 24 hours.",
      "estimatedConfirmationTime": "24 hours"
    }
  }
}
```

---

### GET `/api/tenants/bookings`
Get all bookings created by the tenant

**Authentication:** Required (TENANT role)

**Query Parameters:**
- `status` - Filter by status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- `page`, `limit` - Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking_456",
        "bookingNumber": "BK20251124003",
        "status": "PENDING",
        "listing": {
          "title": "Beautiful 2BR Apartment in City Center"
        },
        "unit": {
          "unitCode": "B205",
          "property": "Greenview Apartments"
        },
        "checkInDate": "2025-12-15",
        "totalAmount": 1400000,
        "depositAmount": 2800000,
        "currency": "UGX",
        "createdAt": "2025-11-24T15:00:00Z",
        "canCancel": true
      }
    ],
    "summary": {
      "pending": 1,
      "confirmed": 0,
      "completed": 1,
      "cancelled": 0
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2
    }
  }
}
```

---

### GET `/api/tenants/bookings/:id`
Get detailed booking information

**Authentication:** Required (TENANT role)

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking_456",
      "bookingNumber": "BK20251124003",
      "status": "CONFIRMED",
      "bookingType": "LONG_TERM",
      "listing": {
        "id": "listing_234",
        "title": "Beautiful 2BR Apartment in City Center"
      },
      "unit": {
        "id": "unit_234",
        "unitCode": "B205",
        "bedrooms": 2,
        "bathrooms": 2
      },
      "property": {
        "name": "Greenview Apartments",
        "address": "123 Main Street, Kampala"
      },
      "checkInDate": "2025-12-15",
      "totalAmount": 1400000,
      "depositAmount": 2800000,
      "currency": "UGX",
      "numberOfGuests": 2,
      "specialRequests": "Would like a parking space near the entrance",
      "confirmedAt": "2025-11-25T10:00:00Z",
      "createdAt": "2025-11-24T15:00:00Z"
    },
    "payments": [
      {
        "id": "payment_126",
        "purpose": "BOOKING_DEPOSIT",
        "amount": 1400000,
        "status": "PENDING",
        "paymentLink": "https://checkout.flutterwave.com/v3/hosted/pay/xyz789"
      }
    ],
    "timeline": [
      {
        "event": "BOOKING_CREATED",
        "timestamp": "2025-11-24T15:00:00Z",
        "description": "Booking request submitted"
      },
      {
        "event": "BOOKING_CONFIRMED",
        "timestamp": "2025-11-25T10:00:00Z",
        "description": "Booking confirmed by property manager"
      }
    ],
    "nextActions": {
      "step": 2,
      "action": "PAY_DEPOSIT",
      "message": "Complete your booking deposit payment to secure the unit",
      "paymentLink": "https://checkout.flutterwave.com/v3/hosted/pay/xyz789"
    }
  }
}
```

---

### PUT `/api/tenants/bookings/:id/cancel`
Cancel a booking request

**Authentication:** Required (TENANT role)

**Request:**
```json
{
  "reason": "Found another property closer to work"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "bookingNumber": "BK20251124003",
    "status": "CANCELLED",
    "cancelledAt": "2025-11-24T16:00:00Z",
    "refundInfo": {
      "eligible": false,
      "message": "No payment was made, so no refund is applicable"
    }
  }
}
```

---

## 📊 Dashboard Summary

### GET `/api/tenants/dashboard`
Get tenant dashboard summary

**Authentication:** Required (TENANT role)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "activeUnits": 1,
      "pendingBookings": 1,
      "upcomingPayments": 1,
      "unreadNotifications": 3
    },
    "units": [
      {
        "unitCode": "A101",
        "property": "Greenview Apartments",
        "monthlyRent": 1200000,
        "nextPaymentDue": "2026-01-01",
        "status": "ACTIVE"
      }
    ],
    "recentActivity": [
      {
        "type": "PAYMENT",
        "description": "December rent paid",
        "amount": 1200000,
        "timestamp": "2025-12-01T10:30:00Z"
      },
      {
        "type": "BOOKING",
        "description": "New booking created for Unit B205",
        "timestamp": "2025-11-24T15:00:00Z"
      }
    ],
    "quickActions": [
      {
        "action": "PAY_RENT",
        "label": "Pay Rent",
        "unitId": "unit_123",
        "amount": 1200000
      },
      {
        "action": "BROWSE_UNITS",
        "label": "Browse Available Units"
      }
    ]
  }
}
```

---

## 🔔 Notifications for Tenants

### GET `/api/tenants/notifications`
Get notifications for the logged-in tenant

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_789",
        "type": "RENT_REMINDER",
        "title": "Rent Payment Due Soon",
        "message": "Your rent for Unit A101 is due on Jan 1, 2026 (7 days from now). Amount: UGX 1,200,000",
        "status": "UNREAD",
        "data": {
          "unitId": "unit_123",
          "dueDate": "2026-01-01",
          "amount": 1200000
        },
        "createdAt": "2025-12-25T08:00:00Z"
      },
      {
        "id": "notif_790",
        "type": "BOOKING_CONFIRMATION",
        "title": "Booking Confirmed",
        "message": "Your booking for Unit B205 at Greenview Apartments has been confirmed!",
        "status": "READ",
        "data": {
          "bookingId": "booking_456"
        },
        "createdAt": "2025-11-25T10:00:00Z"
      }
    ],
    "unreadCount": 1
  }
}
```

---

## Summary of Tenant Workflow

```
1. BROWSE VACANT UNITS
   GET /api/marketplace/units
   GET /api/marketplace/units/:id
   
2. CREATE BOOKING
   POST /api/tenants/bookings/create
   
3. AWAIT CONFIRMATION
   GET /api/tenants/bookings/:id
   
4. PAY DEPOSIT
   POST /api/tenants/payments/pay-rent
   
5. TENANCY CREATED
   GET /api/tenants/my-units
   
6. MANAGE UNIT
   GET /api/tenants/units/:id
   GET /api/tenants/payments
   POST /api/tenants/payments/pay-rent
```

---

All these endpoints ensure tenants can fully manage their units, view payment history, browse available properties, and complete the booking process seamlessly!
