#!/bin/bash

echo "🚀 Starting AI Student Partner Backend..."
echo ""

# Check MongoDB
echo "📊 Checking MongoDB..."
if pgrep -f mongod > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is NOT running"
    echo "Starting MongoDB..."
    brew services start mongodb-community
    sleep 3
fi

echo ""
echo "🔧 Configuration:"
echo "   Port: 5001 (avoiding conflict with port 5000)"
echo "   Database: Local MongoDB"
echo ""

# Navigate to backend
cd "$(dirname "$0")/backend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🌱 Seeding database..."
npm run seed

echo ""
echo "🚀 Starting backend server..."
echo "   Backend will run on: http://localhost:5001"
echo "   Frontend should connect to this port"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
