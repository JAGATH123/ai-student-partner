#!/bin/bash

echo "🚀 AI Student Partner - Quick Start Script"
echo "=========================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi
echo "✅ Backend dependencies installed"
echo ""

# Create backend .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating backend .env file..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env and update MONGODB_URI"
fi
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend installation failed"
    exit 1
fi
echo "✅ Frontend dependencies installed"
echo ""

# Create frontend .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating frontend .env file..."
    cat > .env << EOL
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
EOL
    echo "✅ Frontend .env created"
fi
cd ..

echo ""
echo "🎉 Installation Complete!"
echo ""
echo "📚 Next Steps:"
echo "1. Ensure MongoDB is running (local or use MongoDB Atlas)"
echo "2. Update backend/.env with your MongoDB URI"
echo "3. Seed the database: cd backend && npm run seed"
echo "4. Start backend: cd backend && npm run dev"
echo "5. Start frontend (new terminal): cd frontend && npm run dev"
echo ""
echo "🌐 Access the app at: http://localhost:5173"
echo ""
echo "👤 Demo Credentials:"
echo "   Admin: admin@aistudent.com / admin123"
echo "   User:  john@example.com / password123"
echo ""
