# 📘 RentManager Pro - Database Schema Documentation

## System Overview

This database supports a **full-featured property rental & booking management platform** with multi-role access control, payment processing, and comprehensive property management capabilities.

---

## 📊 Entity Relationship Overview

### Core Modules

1. **User Management & Authentication**
2. **Property Management**
3. **Unit Management**
4. **Listings (Marketplace)**
5. **Bookings**
6. **Tenancies**
7. **Payments**
8. **Admin Assignments**
9. **Notifications**
10. **Files & Media**
11. **Audit Logs**

---

## 👥 User Management & Authentication

### User Table
Stores all system users with role-based access control.

**Fields:**
- `id` - Unique identifier (CUID)
- `email` - Unique email address
- `password` - Hashed password
- `firstName`, `lastName` - User name
- `phone` - Contact number
- `role` - SUPER_ADMIN | ADMIN | TENANT | MEMBER
- `status` - ACTIVE | SUSPENDED | INACTIVE | PENDING_VERIFICATION
- `avatar` - Profile picture URL
- `createdAt`, `updatedAt` - Timestamps
- `lastLoginAt` - Last login timestamp

**Roles:**
- **SUPER_ADMIN**: Full system control, manages all admins
- **ADMIN**: Manages assigned properties
- **TENANT**: Can browse and book units
- **MEMBER**: Basic user profile

### AuthProvider Table
Social authentication providers (Google, Facebook, Apple, Microsoft)

### Session Table
Active user sessions with device tracking
- Stores: token, IP address, user agent, device info
- Auto-expires after set duration

---

## 🏢 Property Management

### Property Table
Complete property information with ownership details.

**Key Fields:**
- `name` - Property name
- `propertyType` - APARTMENT_BUILDING | HOUSE | TOWNHOUSE | HOSTEL | COMMERCIAL_BUILDING | MIXED_USE
- `tenancyType` - MONTHLY_RENT | LONG_TERM_LEASE | SHORT_TERM_STAY | DAILY_RENTAL | FOR_SALE

**Ownership Information:**
- `ownerName`, `ownerType` (INDIVIDUAL | COMPANY | GOVERNMENT | TRUST)
- `ownerContact`, `ownerEmail`, `ownerPhone`
- `registrationNumber`

**Address:**
- Structured: `addressLine1`, `addressLine2`, `city`, `district`, `region`, `postalCode`, `country`
- GPS: `latitude`, `longitude`

**Status:**
- `isActive` - Property is available
- `isFeatured` - Promoted property

---

## 🏘️ Unit Management

### Unit Table
Individual rentable units within properties (rooms, apartments, houses).

**Identification:**
- `unitCode` - Unique code per property (e.g., "A101", "Room-B12")
- `name` - Display name

**Pricing:**
- `price` - Monthly/daily rate
- `currency` - Default: UGX
- `deposit` - Security deposit

**Features:**
- `bedrooms`, `bathrooms`, `squareMeters`, `floor`
- Booleans: `isFurnished`, `hasBalcony`, `hasWifi`, `hasAC`, `hasPet`, `hasParking`
- `amenities` - JSON for additional features

**Status:**
- AVAILABLE | BOOKED | OCCUPIED | MAINTENANCE | UNAVAILABLE

---

## 📦 Listings (Marketplace)

### Listing Table
Published units visible to tenants in the marketplace.

**Content:**
- `title`, `description` - Marketing copy
- `highlights` - JSON for key selling points
- `customPrice`, `customDeposit` - Override unit defaults

**Availability:**
- `availableFrom`, `availableTo` - Date range
- `minimumStay`, `maximumStay` - Stay duration limits (days)

**Settings:**
- `status` - DRAFT | PUBLISHED | PAUSED | ARCHIVED | EXPIRED
- `visibility` - PUBLIC | REGISTERED_USERS | VERIFIED_USERS | PRIVATE
- `isPromoted` - Featured listing flag
- `viewCount` - Analytics tracking

---

## 📅 Bookings

### Booking Table
Tenant requests to rent a unit.

**Identification:**
- `bookingNumber` - Unique booking reference

**Type:**
- SHORT_TERM | LONG_TERM | INSPECTION | VIEWING

**Status Flow:**
PENDING → CONFIRMED → COMPLETED
         ↓
    CANCELLED | EXPIRED

**Details:**
- `checkInDate`, `checkOutDate`
- `totalAmount`, `depositAmount`, `currency`
- `numberOfGuests`
- `specialRequests` - Tenant notes
- `adminNotes` - Internal notes

**Tracking:**
- `confirmedAt`, `cancelledAt`, `cancellationReason`

---

## 🏠 Tenancies

### Tenancy Table
Created after successful booking confirmation.

**Contract Details:**
- `tenancyNumber` - Unique reference
- `startDate`, `endDate`
- `monthlyRent`, `depositPaid`, `currency`
- `contractUrl` - PDF contract link
- `termsAccepted`, `termsAcceptedAt`

**Status:**
- PENDING | ACTIVE | EXPIRED | TERMINATED

**Lifecycle:**
- `activatedAt` - When tenant moves in
- `terminatedAt`, `terminationReason` - End of contract

---

## 💳 Payments

### Payment Table
All financial transactions.

**Identification:**
- `transactionId` - Unique transaction reference

**Details:**
- `amount`, `currency`
- `purpose` - BOOKING_DEPOSIT | MONTHLY_RENT | SECURITY_DEPOSIT | UTILITIES | MAINTENANCE_FEE | LATE_FEE | REFUND | OTHER
- `method` - MOBILE_MONEY | BANK_TRANSFER | CREDIT_CARD | DEBIT_CARD | CASH | PAYPAL | OTHER

**Status:**
- PENDING → PROCESSING → SUCCESS
                      ↓
                   FAILED | REFUNDED | CANCELLED

**Provider Integration:**
- `paymentProvider` - e.g., "FlutterWave", "Paystack"
- `providerTransactionId` - External reference
- `providerResponse` - JSON response from provider

**Receipts:**
- `receiptUrl` - PDF receipt link
- `paidAt`, `refundedAt`

### PaymentHistory Table
Timeline of all payment state changes for audit purposes.

**Events:**
- CREATED | PROCESSING | SUCCESS | FAILED | REFUND_INITIATED | REFUNDED | CANCELLED

---

## 🔐 Admin Assignments

### AdminAssignment Table
Links administrators to specific properties they manage.

**Fields:**
- `adminId` - User with ADMIN role
- `propertyId` - Assigned property
- `role` - Position title (e.g., "Property Manager")
- `assignedAt`, `assignedBy`

**Rules:**
- One admin can manage multiple properties
- One property can have multiple admins
- Unique constraint: (adminId, propertyId)

---

## 🔔 Notifications

### Notification Table
System-wide notification system.

**Type:**
- BOOKING_CONFIRMATION | PAYMENT_RECEIPT | RENT_REMINDER | SYSTEM_ALERT | ADMIN_UPDATE | MAINTENANCE_NOTICE | MESSAGE | OTHER

**Channel:**
- IN_APP | EMAIL | SMS | PUSH

**Status:**
- UNREAD | READ | ARCHIVED

**Content:**
- `title`, `message`
- `data` - JSON for additional context (e.g., booking ID, payment ID)

**Tracking:**
- `sentAt`, `readAt`

---

## 📁 Files & Media

### File Table
Storage for all uploaded documents and images.

**Type:**
- IMAGE | DOCUMENT | VIDEO | OTHER

**Category:**
- PROPERTY_IMAGE | UNIT_IMAGE | OWNERSHIP_DOCUMENT | CONTRACT | RECEIPT | ID_DOCUMENT | OTHER

**Metadata:**
- `fileName`, `fileUrl`, `mimeType`, `fileSize`
- `description`

**Relations:**
- Can belong to Property or Unit
- Supports multiple files per entity

---

## 🛡️ Audit Logs

### AuditLog Table
System-wide activity tracking for security and compliance.

**Actions:**
- CREATE | UPDATE | DELETE | LOGIN | LOGOUT | ROLE_CHANGE | STATUS_CHANGE | PAYMENT | BOOKING | ASSIGNMENT | OTHER

**Details:**
- `entityType` - Table name (e.g., "Property", "User")
- `entityId` - Record ID
- `oldValue`, `newValue` - Before/after JSON snapshots
- `metadata` - Additional context

**Tracking:**
- `ipAddress`, `userAgent`
- `createdAt`

**Use Cases:**
- Security monitoring
- Compliance reporting
- Debugging
- User activity tracking

---

## 🔄 Key Relationships

### Property → Units → Listings → Bookings → Tenancies
1. Property contains multiple Units
2. Unit can have multiple Listings (different time periods)
3. Listing receives Bookings from Tenants
4. Confirmed Booking creates a Tenancy
5. Payments link to Bookings

### User Relationships
- **Super Admin**: Views all data
- **Admin**: Assigned to Properties via AdminAssignment
- **Tenant**: Creates Bookings, makes Payments, has Tenancies

---

## 📈 Scalability Features

### Indexing Strategy
- All foreign keys indexed
- Search fields indexed (email, city, unitCode)
- Date fields indexed (createdAt, checkInDate)
- Status fields indexed for filtering

### Data Integrity
- Cascade deletes for dependent records
- Unique constraints on business keys
- Enum types for controlled values
- JSON fields for flexible metadata

### Performance Optimization
- Separate tables for historical data (PaymentHistory)
- Efficient querying with compound indexes
- Soft deletes via status fields where needed

---

## 🔒 Security Considerations

1. **Password Storage**: Hashed with bcrypt/argon2
2. **Session Management**: Token-based with expiration
3. **Audit Trail**: Complete activity logging
4. **Role-Based Access**: Enforced at application layer
5. **Data Encryption**: Sensitive fields encrypted at rest
6. **Provider Integration**: Secure external API connections

---

## 📊 Analytics & Reporting

The schema supports:
- Revenue tracking (Payments)
- Occupancy rates (Unit status)
- Booking conversion metrics (Listing views → Bookings)
- User activity (AuditLogs)
- Property performance (Bookings per property)
- Payment success rates (PaymentHistory)

---

## 🚀 Future Enhancements

Potential additions:
- Reviews & Ratings table
- Maintenance Requests table
- Utility Billing table
- Messaging/Chat system
- Service Providers table
- Discount/Promotion codes
- Lease Renewal workflow
- Automated rent reminders

---

## 📝 Notes

- **Currency**: Default is UGX (Ugandan Shilling), configurable per transaction
- **Timestamps**: All tables have `createdAt` and `updatedAt`
- **Soft Deletes**: Use status fields instead of hard deletes
- **JSON Fields**: Used for flexible, non-searchable data
- **CUIDs**: Collision-resistant unique identifiers

---

**Database Type**: PostgreSQL (recommended)
**ORM**: Prisma
**Version Control**: All migrations tracked
**Backup Strategy**: Daily automated backups recommended
