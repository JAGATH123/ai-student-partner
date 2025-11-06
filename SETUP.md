# 🚀 Complete Setup Guide

## Step-by-Step Installation

### Step 1: Ensure Prerequisites

```bash
# Check Node.js version (should be 18+)
node --version

# Check Python version (should be 3.8+)
python3 --version

# Check if MongoDB is installed
mongod --version

# If MongoDB not installed, install it:
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb
# Windows: Download from mongodb.com
```

### Step 2: Install MongoDB

**Option A: Local MongoDB**
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Linux (Ubuntu)
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows
# Download installer from mongodb.com and run
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Update `backend/.env` with Atlas URI

### Step 3: Project Setup

```bash
# Navigate to project directory
cd ai-student-partner-main

# Install backend dependencies
cd backend
npm install

# If any peer dependency warnings, run:
npm install --legacy-peer-deps

# Go back to root
cd ..

# Install frontend dependencies
cd frontend
npm install

# If any issues with Three.js:
npm install three@latest @react-three/fiber@latest @react-three/drei@latest
```

### Step 4: Environment Configuration

**Backend (.env):**

```bash
cd backend
cp .env.example .env

# Edit .env file:
# If using local MongoDB:
MONGODB_URI=mongodb://localhost:27017/ai-student-partner

# If using MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-student-partner
```

**Frontend (.env):**

```bash
cd frontend
touch .env

# Add these lines:
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Step 5: Database Seeding

```bash
cd backend
npm run seed

# You should see:
# ✅ Connected to MongoDB
# ✅ Admin user created: admin@aistudent.com
# ✅ Sample user created: john@example.com
# ✅ Sample user created: jane@example.com
# 🎉 Database seeding completed successfully!
```

### Step 6: Start the Application

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev

# You should see:
# 🚀 Server running on port 5000
# ✅ MongoDB Connected
# 🌐 Environment: development
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev

# You should see:
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

**Terminal 3 - Python ML (Optional - for recommendations):**
```bash
# From project root
streamlit run app.py

# Or to run in background:
nohup streamlit run app.py &
```

### Step 7: Verify Installation

1. Open browser: http://localhost:5173
2. You should see the login page with cosmic background
3. Try logging in with demo credentials:
   - Admin: `admin@aistudent.com` / `admin123`
   - User: `john@example.com` / `password123`

## 🐛 Troubleshooting

### Issue: MongoDB Connection Failed

**Solution 1: Check if MongoDB is running**
```bash
# macOS/Linux
ps aux | grep mongod

# Start MongoDB
mongod --dbpath /usr/local/var/mongodb
```

**Solution 2: Use MongoDB Atlas**
- Sign up at mongodb.com/cloud/atlas
- Create free cluster
- Update MONGODB_URI in backend/.env

### Issue: Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Issue: Module Not Found Errors

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Three.js/WebGL Errors

- Ensure your browser supports WebGL 2.0
- Try disabling hardware acceleration in browser settings
- Update graphics drivers

### Issue: CORS Errors

- Verify backend is running on port 5000
- Check frontend .env has correct API_URL
- Clear browser cache and cookies

## 📱 Testing the Application

### As a User:
1. Register a new account at `/register`
2. Go to Dashboard - see welcome screen
3. Click "Start Quiz" - select a topic
4. Answer questions - see real-time feedback
5. View Progress - see mastery levels
6. Check Profile - update settings

### As an Admin:
1. Login with admin@aistudent.com
2. Dashboard shows system stats
3. Click "Users" - see all registered users
4. Click on a user - see detailed analytics
5. Use toggle to activate/deactivate users
6. View Analytics for system-wide metrics

## 🎨 Customizing the UI

### Change Theme Colors:

Edit `frontend/tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      cosmic: {
        500: '#YOUR_COLOR',  // Change primary color
        600: '#YOUR_COLOR',
        // ... etc
      }
    }
  }
}
```

### Modify 3D Background:

Edit `frontend/src/components/CosmicBackground.jsx`:
```js
// Change particle count
const particleCount = 2000;  // Increase for more particles

// Change colors
<pointsMaterial color="#YOUR_HEX_COLOR" />

// Change sphere color
<meshStandardMaterial color="#YOUR_HEX_COLOR" />
```

## 📊 Adding More Questions

Edit `data/subjects.json`:

```json
{
  "subjects": [
    {
      "subject_name": "Your Subject",
      "slug": "your-subject",
      "topics": [
        {
          "topic_id": "YOUR_T1",
          "title": "Your Topic",
          "questions": [
            {
              "q": "Your question?",
              "options": [
                "A. Option 1",
                "B. Option 2",
                "C. Option 3",
                "D. Option 4"
              ],
              "answer": "A"
            }
          ]
        }
      ]
    }
  ]
}
```

## 🔧 Development Tips

### Hot Reload Issues:
```bash
# Backend - Use nodemon
cd backend
npm install -g nodemon
nodemon server.js

# Frontend - Vite should auto-reload
# If not, check vite.config.js
```

### Debugging Backend:
```bash
# Add console.logs
console.log('Debug:', variable);

# Or use Node debugger
node --inspect server.js
```

### Debugging Frontend:
- Open browser DevTools (F12)
- Check Console for errors
- Use React DevTools extension
- Check Network tab for API calls

## 📦 Production Deployment

### Backend (Node.js):
```bash
cd backend
npm install --production
NODE_ENV=production node server.js

# Or use PM2
npm install -g pm2
pm2 start server.js --name "ai-student-api"
```

### Frontend (Static):
```bash
cd frontend
npm run build

# Serve with nginx, Vercel, Netlify, etc.
# Build output in: frontend/dist/
```

### Database:
- Use MongoDB Atlas for production
- Enable authentication
- Whitelist IP addresses
- Backup regularly

## 🌐 Deployment Platforms

### Backend:
- **Heroku** - Easy deployment, free tier
- **Railway** - Modern platform, automatic deployments
- **DigitalOcean** - VPS with full control
- **AWS/Azure** - Enterprise-grade

### Frontend:
- **Vercel** - Recommended for Vite/React
- **Netlify** - Easy CI/CD
- **GitHub Pages** - Free static hosting
- **Cloudflare Pages** - Fast CDN

### Database:
- **MongoDB Atlas** - Recommended, free tier available
- **AWS DocumentDB** - MongoDB-compatible
- **Azure Cosmos DB** - Multi-model database

## 🎯 Next Steps

1. ✅ Complete basic setup
2. ✅ Test all features
3. 📚 Add more questions to subjects.json
4. 🎨 Customize theme to your liking
5. 🚀 Deploy to production
6. 📱 Share with users!

## 💡 Pro Tips

- Use MongoDB Atlas for hassle-free database
- Deploy backend on Railway or Heroku
- Deploy frontend on Vercel
- Set up CI/CD with GitHub Actions
- Monitor with Sentry or LogRocket
- Add analytics with Google Analytics

## 🆘 Still Having Issues?

Common fixes:
1. Clear node_modules and reinstall
2. Check all environment variables
3. Verify MongoDB is running
4. Check firewall/antivirus settings
5. Try different browser
6. Update Node.js to latest LTS

---

**You're all set! 🎉 Start building your futuristic learning platform!**
