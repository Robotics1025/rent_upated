# 🚀 RentManager Pro - API Routes Documentation

## API Overview

Base URL: `/api`

Authentication: JWT Bearer Token (except public endpoints)

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Properties](#properties)
4. [Units](#units)
5. [Listings](#listings)
6. [Bookings](#bookings)
7. [Tenancies](#tenancies)
8. [Payments](#payments)
9. [Admin](#admin)
10. [Notifications](#notifications)
11. [Files](#files)

---

## 🔐 Authentication

### POST `/api/auth/register`
Register a new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+256700123456",
  "role": "TENANT"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "TENANT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST `/api/auth/login`
User login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "cuid123", "email": "user@example.com", "role": "TENANT" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "session": {
      "id": "session123",
      "expiresAt": "2025-12-24T10:00:00Z"
    }
  }
}
```

---

### POST `/api/auth/logout`
Logout current session

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST `/api/auth/forgot-password`
Request password reset

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### POST `/api/auth/reset-password`
Reset password with token

**Request:**
```json
{
  "token": "reset_token_here",
  "newPassword": "NewSecurePass123!"
}
```

---

### POST `/api/auth/social/:provider`
Social authentication (Google, Facebook, Apple)

**Provider:** `google` | `facebook` | `apple`

**Request:**
```json
{
  "accessToken": "provider_access_token",
  "providerId": "google_user_id"
}
```

---

## 👥 Users

### GET `/api/users/me`
Get current user profile

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+256700123456",
    "role": "TENANT",
    "status": "ACTIVE",
    "avatar": "https://cdn.example.com/avatars/user123.jpg",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

---

### PUT `/api/users/me`
Update current user profile

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+256700123456",
  "avatar": "https://cdn.example.com/avatars/new.jpg"
}
```

---

### GET `/api/users/:id`
Get user by ID (Admin only)

**Permissions:** ADMIN, SUPER_ADMIN

---

### GET `/api/users`
List all users (Admin only)

**Query Parameters:**
- `role` - Filter by role
- `status` - Filter by status
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

---

## 🏢 Properties

### POST `/api/properties`
Create a new property

**Permissions:** ADMIN, SUPER_ADMIN

**Request:**
```json
{
  "name": "Greenview Apartments",
  "description": "Modern apartments in the city center",
  "propertyType": "APARTMENT_BUILDING",
  "tenancyType": "MONTHLY_RENT",
  "ownerName": "ABC Property Ltd",
  "ownerType": "COMPANY",
  "ownerContact": "+256700111222",
  "ownerEmail": "owner@abc.com",
  "registrationNumber": "REG123456",
  "addressLine1": "123 Main Street",
  "city": "Kampala",
  "region": "Central",
  "country": "Uganda",
  "latitude": 0.3476,
  "longitude": 32.5825
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prop_cuid123",
    "name": "Greenview Apartments",
    "propertyType": "APARTMENT_BUILDING",
    "isActive": true,
    "createdAt": "2025-11-24T10:00:00Z"
  }
}
```

---

### GET `/api/properties`
List all properties

**Query Parameters:**
- `propertyType` - Filter by type
- `tenancyType` - Filter by tenancy type
- `city` - Filter by city
- `isActive` - Filter active properties
- `page`, `limit` - Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "prop_123",
        "name": "Greenview Apartments",
        "propertyType": "APARTMENT_BUILDING",
        "city": "Kampala",
        "totalUnits": 24,
        "availableUnits": 5
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 45, "pages": 3 }
  }
}
```

---

### GET `/api/properties/:id`
Get property details

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prop_123",
    "name": "Greenview Apartments",
    "description": "Modern apartments...",
    "propertyType": "APARTMENT_BUILDING",
    "ownerName": "ABC Property Ltd",
    "address": {
      "addressLine1": "123 Main Street",
      "city": "Kampala",
      "region": "Central"
    },
    "units": [...],
    "files": [...]
  }
}
```

---

### PUT `/api/properties/:id`
Update property

**Permissions:** ADMIN (assigned), SUPER_ADMIN

---

### DELETE `/api/properties/:id`
Delete property (soft delete)

**Permissions:** SUPER_ADMIN

---

## 🏘️ Units

### POST `/api/units`
Create a new unit

**Permissions:** ADMIN, SUPER_ADMIN

**Request:**
```json
{
  "propertyId": "prop_123",
  "unitCode": "A101",
  "name": "Apartment A101",
  "description": "2 bedroom apartment with balcony",
  "price": 1200000,
  "currency": "UGX",
  "deposit": 2400000,
  "bedrooms": 2,
  "bathrooms": 2,
  "squareMeters": 85.5,
  "floor": 1,
  "isFurnished": true,
  "hasBalcony": true,
  "hasWifi": true,
  "hasAC": true,
  "amenities": {
    "features": ["Kitchen", "Dining room", "Living room"],
    "appliances": ["Fridge", "Microwave", "Washing machine"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "unit_123",
    "propertyId": "prop_123",
    "unitCode": "A101",
    "price": 1200000,
    "status": "AVAILABLE"
  }
}
```

---

### GET `/api/units`
List units

**Query Parameters:**
- `propertyId` - Filter by property
- `status` - Filter by availability
- `minPrice`, `maxPrice` - Price range
- `bedrooms` - Number of bedrooms
- `isFurnished` - Furnished only

---

### GET `/api/units/:id`
Get unit details

---

### PUT `/api/units/:id`
Update unit

---

### PUT `/api/units/:id/status`
Update unit status

**Request:**
```json
{
  "status": "MAINTENANCE"
}
```

---

## 📦 Listings

### POST `/api/listings`
Create marketplace listing

**Permissions:** ADMIN, SUPER_ADMIN

**Request:**
```json
{
  "unitId": "unit_123",
  "title": "Beautiful 2BR Apartment in City Center",
  "description": "Spacious and modern apartment...",
  "highlights": {
    "keyFeatures": ["Prime location", "Fully furnished", "Secure parking"]
  },
  "availableFrom": "2025-12-01",
  "availableTo": "2026-12-01",
  "minimumStay": 30,
  "visibility": "PUBLIC",
  "status": "PUBLISHED"
}
```

---

### GET `/api/listings`
Browse marketplace listings (Public)

**Query Parameters:**
- `city` - Filter by city
- `propertyType` - Filter by property type
- `minPrice`, `maxPrice` - Price range
- `bedrooms` - Number of bedrooms
- `isFurnished` - Furnished units
- `search` - Text search
- `sort` - `price_asc` | `price_desc` | `newest` | `popular`

**Response:**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "listing_123",
        "title": "Beautiful 2BR Apartment",
        "price": 1200000,
        "currency": "UGX",
        "bedrooms": 2,
        "bathrooms": 2,
        "city": "Kampala",
        "thumbnailUrl": "https://cdn.example.com/...",
        "viewCount": 145
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 87 }
  }
}
```

---

### GET `/api/listings/:id`
Get listing details (Public)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "listing_123",
    "title": "Beautiful 2BR Apartment",
    "description": "Spacious and modern...",
    "price": 1200000,
    "unit": {
      "bedrooms": 2,
      "bathrooms": 2,
      "squareMeters": 85.5,
      "amenities": {...}
    },
    "property": {
      "name": "Greenview Apartments",
      "address": "123 Main Street, Kampala"
    },
    "images": [...]
  }
}
```

---

### PUT `/api/listings/:id/status`
Publish/pause listing

**Request:**
```json
{
  "status": "PUBLISHED" | "PAUSED" | "ARCHIVED"
}
```

---

## 📅 Bookings

### POST `/api/bookings`
Create a booking

**Permissions:** TENANT, MEMBER

**Request:**
```json
{
  "listingId": "listing_123",
  "bookingType": "LONG_TERM",
  "checkInDate": "2025-12-01",
  "checkOutDate": null,
  "numberOfGuests": 2,
  "specialRequests": "Need parking space"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking_123",
    "bookingNumber": "BK20251124001",
    "status": "PENDING",
    "totalAmount": 1200000,
    "depositAmount": 2400000,
    "paymentLink": "https://payment.gateway.com/pay/..."
  }
}
```

---

### GET `/api/bookings/my-bookings`
Get current user's bookings

**Permissions:** TENANT

---

### GET `/api/bookings/:id`
Get booking details

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking_123",
    "bookingNumber": "BK20251124001",
    "status": "CONFIRMED",
    "listing": {...},
    "unit": {...},
    "checkInDate": "2025-12-01",
    "totalAmount": 1200000,
    "payments": [...]
  }
}
```

---

### PUT `/api/bookings/:id/confirm`
Confirm booking (Admin only)

**Permissions:** ADMIN, SUPER_ADMIN

---

### PUT `/api/bookings/:id/cancel`
Cancel booking

**Request:**
```json
{
  "reason": "Change of plans"
}
```

---

## 🏠 Tenancies

### GET `/api/tenancies/my-tenancies`
Get current user's tenancies

**Permissions:** TENANT

**Response:**
```json
{
  "success": true,
  "data": {
    "tenancies": [
      {
        "id": "tenancy_123",
        "tenancyNumber": "TN20251201001",
        "status": "ACTIVE",
        "unit": {...},
        "startDate": "2025-12-01",
        "monthlyRent": 1200000,
        "nextPaymentDue": "2026-01-01"
      }
    ]
  }
}
```

---

### GET `/api/tenancies/:id`
Get tenancy details

---

### PUT `/api/tenancies/:id/terminate`
Terminate tenancy

**Permissions:** ADMIN, SUPER_ADMIN

**Request:**
```json
{
  "reason": "Contract ended",
  "terminationDate": "2026-06-30"
}
```

---

## 💳 Payments

### POST `/api/payments/initialize`
Initialize payment

**Request:**
```json
{
  "bookingId": "booking_123",
  "amount": 1200000,
  "currency": "UGX",
  "purpose": "BOOKING_DEPOSIT",
  "method": "MOBILE_MONEY",
  "phone": "+256700123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "payment_123",
    "transactionId": "TXN20251124001",
    "paymentLink": "https://checkout.flutterwave.com/...",
    "status": "PENDING"
  }
}
```

---

### POST `/api/payments/webhook`
Payment gateway webhook (Flutterwave/Paystack)

**Security:** Verify webhook signature

---

### GET `/api/payments/verify/:transactionId`
Verify payment status

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "TXN20251124001",
    "status": "SUCCESS",
    "amount": 1200000,
    "paidAt": "2025-11-24T10:30:00Z",
    "receiptUrl": "https://receipts.example.com/..."
  }
}
```

---

### GET `/api/payments/my-payments`
Get current user's payment history

---

### GET `/api/payments/:id/receipt`
Download payment receipt

---

## 🔧 Admin

### GET `/api/admin/dashboard`
Admin dashboard statistics

**Permissions:** ADMIN, SUPER_ADMIN

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProperties": 15,
    "totalUnits": 342,
    "occupiedUnits": 287,
    "availableUnits": 55,
    "totalTenants": 287,
    "pendingBookings": 12,
    "monthlyRevenue": 348000000,
    "recentBookings": [...],
    "recentPayments": [...]
  }
}
```

---

### GET `/api/admin/users`
Manage users

**Permissions:** SUPER_ADMIN

---

### PUT `/api/admin/users/:id/role`
Change user role

**Request:**
```json
{
  "role": "ADMIN"
}
```

---

### PUT `/api/admin/users/:id/status`
Change user status

**Request:**
```json
{
  "status": "SUSPENDED",
  "reason": "Violation of terms"
}
```

---

### POST `/api/admin/assignments`
Assign admin to property

**Request:**
```json
{
  "adminId": "user_123",
  "propertyId": "prop_456",
  "role": "Property Manager"
}
```

---

### GET `/api/admin/audit-logs`
View audit logs

**Query Parameters:**
- `userId` - Filter by user
- `action` - Filter by action type
- `entityType` - Filter by entity
- `startDate`, `endDate` - Date range

---

## 🔔 Notifications

### GET `/api/notifications`
Get user notifications

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "BOOKING_CONFIRMATION",
        "title": "Booking Confirmed",
        "message": "Your booking has been confirmed",
        "status": "UNREAD",
        "createdAt": "2025-11-24T10:00:00Z"
      }
    ],
    "unreadCount": 3
  }
}
```

---

### PUT `/api/notifications/:id/read`
Mark notification as read

---

### PUT `/api/notifications/read-all`
Mark all as read

---

### DELETE `/api/notifications/:id`
Delete notification

---

## 📁 Files

### POST `/api/files/upload`
Upload file

**Content-Type:** `multipart/form-data`

**Request:**
```
file: <binary>
category: "PROPERTY_IMAGE" | "UNIT_IMAGE" | "DOCUMENT" | ...
propertyId: "prop_123" (optional)
unitId: "unit_123" (optional)
description: "Front view of building"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file_123",
    "fileName": "property-image-1.jpg",
    "fileUrl": "https://cdn.example.com/files/...",
    "fileType": "IMAGE",
    "fileSize": 2458625
  }
}
```

---

### DELETE `/api/files/:id`
Delete file

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Email is required",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

### Error Codes
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input
- `CONFLICT` - Resource conflict (e.g., duplicate email)
- `PAYMENT_FAILED` - Payment processing error
- `SERVER_ERROR` - Internal server error

---

## 🔒 Authentication

All protected endpoints require:

**Header:**
```
Authorization: Bearer <jwt_token>
```

**Token Payload:**
```json
{
  "userId": "user_123",
  "email": "user@example.com",
  "role": "TENANT",
  "iat": 1732444800,
  "exp": 1732531200
}
```

---

## 📈 Rate Limiting

- **Public endpoints**: 100 requests/hour
- **Authenticated endpoints**: 1000 requests/hour
- **Admin endpoints**: 5000 requests/hour

---

## 🔍 Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

This API documentation provides a complete reference for all endpoints in the RentManager Pro platform.
