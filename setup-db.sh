#!/bin/bash

echo "🚀 Setting up EazyRent Database"
echo "================================"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your DATABASE_URL"
    echo "Check DATABASE_SETUP.md for instructions"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env; then
    echo "❌ DATABASE_URL not found in .env file!"
    echo "Please add your database URL to the .env file"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🗄️ Pushing schema to database..."
npx prisma db push

echo "🌱 Seeding database with sample data..."
npm run db:seed

echo "✅ Database setup complete!"
echo ""
echo "🎉 Your database is ready!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Visit http://localhost:3000 to see your app"
echo "3. Use 'npm run db:studio' to view your data in Prisma Studio"
echo ""
echo "API Endpoints:"
echo "- GET /api/properties - List all properties"
echo "- POST /api/properties - Create a new property"