# EazyRent Database Setup Guide

## 🚀 Quick Setup Options

### Option 1: Vercel Postgres (Recommended for Vercel Deployment)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project → Storage → Create Database → Postgres
3. Copy the `DATABASE_URL` from the connection details
4. Add it to your `.env` file

### Option 2: Supabase (Free Tier Available)
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings → Database → Connection string
4. Copy the URI and add to your `.env` file

### Option 3: Neon (Serverless Postgres)
1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. Add to your `.env` file

### Option 4: Railway
1. Go to [Railway](https://railway.app)
2. Create a new project → Add PostgreSQL
3. Copy the `DATABASE_URL` from Variables tab
4. Add to your `.env` file

## 📋 Environment Setup

Create a `.env` file in your project root:

```bash
# Replace with your actual database URL
DATABASE_URL="postgresql://username:password@hostname:5432/database_name"

# Authentication (generate a secure random string)
NEXTAUTH_SECRET="your-super-secret-jwt-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## 🛠️ Database Commands

After setting up your database URL, run these commands:

```bash
# Install Prisma
npm install prisma @prisma/client

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Optional: Create migration
npx prisma migrate dev --name init

# View database in browser
npx prisma studio
```

## 🔧 Database Schema Overview

Your schema includes:

- **Users**: Authentication, roles, profiles
- **Properties**: Property listings with ownership details
- **Units**: Individual rooms/apartments within properties
- **Bookings**: Reservation system
- **Payments**: Payment processing and tracking
- **Tenancies**: Long-term rental agreements
- **Files**: Media and document storage
- **Notifications**: User communication system
- **Audit Logs**: Activity tracking

## 🚀 Next Steps

1. Choose a database provider above
2. Create your database instance
3. Copy the connection URL to `.env`
4. Run the database commands above
5. Start building your API routes!

Would you like me to help you set up a specific database provider?