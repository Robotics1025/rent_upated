@echo off
echo 🚀 Setting up EazyRent Database
echo ================================

REM Check if .env exists
if not exist ".env" (
    echo ❌ .env file not found!
    echo Please create a .env file with your DATABASE_URL
    echo Check DATABASE_SETUP.md for instructions
    pause
    exit /b 1
)

REM Check if DATABASE_URL is set
findstr /C:"DATABASE_URL=" .env >nul
if errorlevel 1 (
    echo ❌ DATABASE_URL not found in .env file!
    echo Please add your database URL to the .env file
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
call npm install

echo 🔧 Generating Prisma client...
call npx prisma generate

echo 🗄️ Pushing schema to database...
call npx prisma db push

echo 🌱 Seeding database with sample data...
call npm run db:seed

echo ✅ Database setup complete!
echo.
echo 🎉 Your database is ready!
echo.
echo Next steps:
echo 1. Run 'npm run dev' to start the development server
echo 2. Visit http://localhost:3000 to see your app
echo 3. Use 'npm run db:studio' to view your data in Prisma Studio
echo.
echo API Endpoints:
echo - GET /api/properties - List all properties
echo - POST /api/properties - Create a new property
echo.
pause