# 🏢 RentManager Pro

**Full-Featured Property Rental & Booking Management Platform**

A comprehensive web platform similar to Jumia House or Airbnb, designed for managing rental properties, bookings, payments, tenants, and administrators with multi-role access control.

---

## ✨ Features

### 🎯 Core Capabilities
- **Multi-Role System**: Super Admin, Admin, Tenant, and Member roles
- **Property Management**: Complete property and unit management
- **Marketplace**: Public-facing listings for browsing and booking
- **Booking System**: Request, confirm, and track bookings
- **Payment Integration**: Secure payment processing with Flutterwave/Paystack
- **Tenancy Management**: Contract generation and rent tracking
- **Notifications**: Email, SMS, and in-app notifications
- **Audit Logging**: Complete activity tracking for security and compliance

### 👥 User Roles

**Super Administrator**
- Full system control
- Manage all admins and properties
- System-wide analytics and reporting

**System Administrator**
- Manage assigned properties
- Approve bookings
- Handle payments
- Generate reports

**Tenant**
- Browse and search properties
- Make bookings
- Process payments
- View booking history

**Member**
- Basic user access
- Browse public listings

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/Robotics1025/rent_upated.git
cd rent_upated

# Install dependencies
npm install

# Set up environment variables
cp .env.template .env
# Edit .env with your database URL and API keys

# Initialize database (choose your hosting provider first)
# See DATABASE_SETUP.md for detailed instructions
npm run setup-db

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database Setup

For detailed database setup instructions with hosted providers (Vercel Postgres, Supabase, Neon, Railway), see **[DATABASE_SETUP.md](./DATABASE_SETUP.md)**.

### Quick Database Setup

1. **Choose a hosting provider** (recommended: Vercel Postgres for Vercel deployments)
2. **Get your DATABASE_URL** from the provider
3. **Update your `.env` file** with the connection string
4. **Run the setup script**: `npm run setup-db`

The setup script will:
- Install dependencies
- Generate Prisma client
- Push schema to database
- Seed with sample data

---

## 📁 Project Structure

```
rent_upated/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Login/Signup pages
│   ├── (dashboard)/         # Admin dashboard
│   ├── api/                 # API routes
│   ├── components/          # Components
│   └── globals.css          # Global styles
├── prisma/
│   └── schema.prisma        # Database schema
├── docs/                    # Documentation
│   ├── database/            # Database docs
│   ├── api/                 # API docs
│   └── SYSTEM_ARCHITECTURE.md
└── components/              # Shared components
```

---

## 📚 Documentation

- **[Database Setup](./DATABASE_SETUP.md)** - Complete database setup guide for hosted providers
- **[Database Schema](./docs/database/DATABASE_SCHEMA.md)** - Complete database documentation
- **[API Routes](./docs/api/API_ROUTES.md)** - API endpoints reference
- **[System Architecture](./docs/SYSTEM_ARCHITECTURE.md)** - Architecture overview
- **[Prisma Schema](./prisma/schema.prisma)** - Database models

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL

**Integrations:**
- Flutterwave/Paystack (Payments)
- SendGrid (Email)
- Twilio (SMS)
- Cloudinary/S3 (File Storage)

---

## 🔐 Environment Variables

Create a `.env` file from the template:

```bash
cp .env.template .env
```

Required variables:

```env
# Database (get from your hosting provider)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Payment Gateway
FLUTTERWAVE_PUBLIC_KEY="your-key"
FLUTTERWAVE_SECRET_KEY="your-secret"

# Email
SENDGRID_API_KEY="your-key"
SENDGRID_FROM_EMAIL="noreply@rentmanager.com"

# SMS
TWILIO_ACCOUNT_SID="your-sid"
TWILIO_AUTH_TOKEN="your-token"

# Storage
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
```

---

## 📊 Database Schema Overview

### Key Tables
- **Users** - All system users with roles
- **Properties** - Property information and ownership
- **Units** - Individual rentable units
- **Listings** - Marketplace entries
- **Bookings** - Rental requests
- **Tenancies** - Active rental contracts
- **Payments** - Transaction records
- **Notifications** - System notifications
- **AuditLogs** - Activity tracking

See [Database Documentation](./docs/database/DATABASE_SCHEMA.md) for complete details.

---

## 🔄 Development Workflow

```bash
# Start development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run setup-db         # Complete database setup (install, generate, push, seed)
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database
npm run db:migrate       # Create and run migrations
npm run db:studio        # Open database GUI
npm run db:seed          # Seed database with sample data

# Deploy to Vercel
vercel                    # Deploy preview
vercel --prod            # Deploy production
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically

### Database Hosting Options
- **Neon** - Serverless PostgreSQL
- **Supabase** - PostgreSQL with real-time
- **Railway** - Simple database hosting

---

## 📈 API Overview

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - Logout

### Properties
- `GET /api/properties` - List properties
- `POST /api/properties` - Create property
- `GET /api/properties/:id` - Get property details

### Listings
- `GET /api/listings` - Browse marketplace
- `GET /api/listings/:id` - Listing details

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - User bookings

### Payments
- `POST /api/payments/initialize` - Start payment
- `GET /api/payments/verify/:id` - Verify payment

See [API Documentation](./docs/api/API_ROUTES.md) for complete reference.

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Joel Robotics**
- GitHub: [@Robotics1025](https://github.com/Robotics1025)

---

## 🙏 Acknowledgments

- Next.js Team
- shadcn/ui
- Prisma Team
- Vercel Platform

---

## 📞 Support

For support, email support@rentmanager.com or open an issue on GitHub.

---

**Built with ❤️ using Next.js and TypeScript**
