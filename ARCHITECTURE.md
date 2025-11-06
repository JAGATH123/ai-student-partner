# 🏗️ System Architecture

## Overview

The AI Student Partner is a full-stack web application with microservices architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React + Three.js + Vite (Port 5173)                        │
│  - User Interface (Dashboard, Quiz, Progress)                │
│  - Admin Interface (Dashboard, Users, Analytics)             │
│  - 3D Cosmic Background (WebGL)                              │
│  - Real-time Socket.IO Client                                │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST API + WebSocket
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                    Backend API Server                        │
│  Node.js + Express (Port 5000)                              │
│  - RESTful API Endpoints                                     │
│  - JWT Authentication                                        │
│  - Socket.IO Server (Real-time)                             │
│  - Request Validation                                        │
└─────────────────┬───────────────────────────────────────────┘
                  │ Mongoose ODM
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                      MongoDB                                 │
│  - User Collection (auth, profiles, stats)                  │
│  - Progress Collection (topic mastery)                       │
│  - Attempt Collection (quiz history)                         │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                Python ML Service (Optional)                  │
│  FastAPI or Streamlit (Port 8000/8501)                      │
│  - ML Model Loading                                          │
│  - Recommendation Engine                                     │
│  - EMA/SM2 Algorithms                                        │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### User Registration/Login

```
User → Frontend → POST /api/auth/register
                 ↓
          Backend validates data
                 ↓
          Hash password (bcrypt)
                 ↓
          Save to MongoDB
                 ↓
          Generate JWT token
                 ↓
          Return user + token
                 ↓
Frontend → Store token → Redirect to dashboard
```

### Quiz Flow

```
User selects topic → GET /api/quiz/topics/:id
                    ↓
          Frontend displays question
                    ↓
User answers → POST /api/progress/submit-answer
                    ↓
Backend → Verify answer
       → Update Progress (EMA mastery)
       → Create Attempt record
       → Update User stats
       → Emit Socket.IO event
                    ↓
Frontend → Real-time update
        → Show feedback (✅/❌)
        → Display next question
```

### Admin Analytics

```
Admin opens dashboard → GET /api/admin/dashboard
                       ↓
Backend → Aggregate queries on MongoDB
       → User count
       → Recent activity
       → Topic performance
       → User growth trends
                       ↓
Frontend → Render charts
        → Display statistics
```

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: "user" | "admin",
  avatar: String (URL),
  bio: String,
  preferences: {
    theme: "dark" | "light" | "cosmic",
    studyGoalPerDay: Number,
    notifications: Boolean
  },
  stats: {
    totalAttempts: Number,
    totalCorrect: Number,
    currentStreak: Number,
    longestStreak: Number,
    lastStudyDate: Date
  },
  isActive: Boolean,
  createdAt: Date,
  lastLogin: Date,
  updatedAt: Date
}

Indexes:
- email (unique)
- role
- isActive
- createdAt
```

### Progress Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  topicId: String (indexed),
  subjectName: String,
  topicTitle: String,
  mastery: Number (0-1),
  attempts: Number,
  corrects: Number,
  lastReview: Date,
  nextReview: Date,
  emaAlpha: Number (0.3),
  easinessFactor: Number (SM2),
  interval: Number (SM2),
  repetitions: Number (SM2),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- { userId: 1, topicId: 1 } (unique compound)
- mastery
- lastReview
```

### Attempts Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  topicId: String (indexed),
  questionId: String,
  userAnswer: String,
  correctAnswer: String,
  isCorrect: Boolean,
  timeTaken: Number (seconds),
  timestamp: Date (indexed),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- { userId: 1, timestamp: -1 }
- { topicId: 1, isCorrect: 1 }
- timestamp
```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /register | Public | Create new user |
| POST | /login | Public | Login user |
| GET | /me | Protected | Get current user |
| PUT | /update-profile | Protected | Update user profile |

### Quiz (`/api/quiz`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /subjects | Protected | List all subjects |
| GET | /subjects/:slug | Protected | Get subject details |
| GET | /topics/:id | Protected | Get topic with questions |
| GET | /topics/:id/question | Protected | Get random question |

### Progress (`/api/progress`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /submit-answer | Protected | Submit quiz answer |
| GET | /my-progress | Protected | Get user's progress |
| GET | /topic/:id | Protected | Get topic progress |
| DELETE | /topic/:id/reset | Protected | Reset topic progress |

### Recommendations (`/api/recommendations`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | / | Protected | Get personalized recommendations |
| GET | /weak-areas | Protected | Get weak topics |
| GET | /ready-for-review | Protected | Get review-ready topics |

### Users (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /stats | Protected | Get user statistics |
| GET | /leaderboard | Protected | Get top performers |

### Admin (`/api/admin`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /dashboard | Admin | Dashboard statistics |
| GET | /users | Admin | List all users |
| GET | /users/:id | Admin | Get user details |
| PUT | /users/:id/toggle-status | Admin | Activate/deactivate user |
| DELETE | /users/:id | Admin | Delete user |
| GET | /analytics/overview | Admin | Analytics data |

## Security Features

### Authentication
- **JWT Tokens:** Issued on login, expire in 7 days
- **Password Hashing:** bcrypt with salt rounds = 10
- **Token Storage:** localStorage (frontend)
- **Token Verification:** Middleware on protected routes

### Authorization
- **Role-based:** user vs admin roles
- **Route Protection:** authorize middleware
- **Frontend Guards:** ProtectedRoute component

### Data Validation
- **express-validator:** Input sanitization
- **Mongoose Schemas:** Database-level validation
- **Type Checking:** Required fields enforced

### Security Headers
- **helmet:** Sets security HTTP headers
- **CORS:** Configured allowed origins
- **Rate Limiting:** (To be implemented)

## Real-time Features

### Socket.IO Events

**Client → Server:**
- `join-room` - User joins their personal room
- `disconnect` - User disconnects

**Server → Client:**
- `progress-updated` - Mastery level changed
- `account-status-changed` - Account activated/deactivated
- `new-achievement` - Badge unlocked (to be implemented)

### Connection Flow

```javascript
// Client connects
socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') }
});

// Join user's room
socket.emit('join-room', userId);

// Listen for updates
socket.on('progress-updated', (data) => {
  // Update UI in real-time
});
```

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── CosmicBackground.jsx    # Three.js 3D scene
│   ├── Navbar.jsx              # Navigation bar
│   ├── ProtectedRoute.jsx      # Route guard
│   ├── user/                   # User components
│   │   ├── StatsCard.jsx
│   │   ├── ProgressChart.jsx
│   │   └── QuizCard.jsx
│   └── admin/                  # Admin components
│       ├── UserTable.jsx
│       ├── AnalyticsChart.jsx
│       └── StatsWidget.jsx
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── user/
│   │   ├── Dashboard.jsx
│   │   ├── Quiz.jsx
│   │   ├── Progress.jsx
│   │   └── Profile.jsx
│   └── admin/
│       ├── Dashboard.jsx
│       ├── Users.jsx
│       ├── UserDetail.jsx
│       └── Analytics.jsx
├── lib/
│   ├── api.js                  # Axios instance & API calls
│   ├── socket.js               # Socket.IO client
│   └── utils.js                # Helper functions
├── store/
│   └── authStore.js            # Zustand auth state
├── App.jsx                     # Main app & routing
└── main.jsx                    # React entry point
```

### State Management

**Zustand Store:**
```javascript
authStore = {
  user: User | null,
  token: string | null,
  setAuth: (user, token) => void,
  logout: () => void,
  updateUser: (updates) => void
}
```

**React Query Cache:**
- API responses cached
- Automatic refetching
- Optimistic updates
- Background sync

### Routing

```javascript
Public Routes:
- /login
- /register

User Routes (Protected):
- /dashboard
- /quiz/:topicId?
- /progress
- /profile

Admin Routes (Protected + Role):
- /admin
- /admin/users
- /admin/users/:userId
- /admin/analytics
```

## ML Integration

### EMA (Exponential Moving Average) Algorithm

```javascript
mastery_new = α * result + (1 - α) * mastery_old

Where:
- α (alpha) = 0.3 (learning rate)
- result = 1 (correct) or 0 (incorrect)
- mastery ∈ [0, 1]
```

**Characteristics:**
- Fast real-time updates
- Smooth learning curve
- Recency bias (recent performance matters more)

### Recommendation Scoring

```javascript
score = (1 - mastery) * recency_factor

recency_factor = 1 + 0.5 * min(days_since / 30, 2.0)

Priority Rules:
- Lower mastery = Higher priority
- Older last review = Higher priority
- Recent struggle = Bonus priority
```

## Performance Optimizations

### Frontend
- **Code Splitting:** React.lazy() for routes
- **Three.js LOD:** Level of detail for 3D objects
- **Memoization:** React.memo for expensive components
- **Virtual Scrolling:** For large lists

### Backend
- **Database Indexes:** On frequently queried fields
- **Aggregation Pipeline:** For complex analytics
- **Connection Pooling:** MongoDB connection pool
- **Caching:** (To be implemented with Redis)

### Database
- **Compound Indexes:** userId + topicId
- **Projection:** Select only needed fields
- **Pagination:** Limit results in queries
- **Lean Queries:** Skip Mongoose hydration when possible

## Deployment Architecture

### Production Setup

```
                    ┌──────────────┐
                    │   Cloudflare │
                    │   DNS/CDN    │
                    └──────┬───────┘
                           │
         ┌─────────────────┴─────────────────┐
         │                                    │
    ┌────▼─────┐                        ┌────▼─────┐
    │  Vercel  │                        │ Railway  │
    │ Frontend │                        │ Backend  │
    │  (CDN)   │                        │  (API)   │
    └──────────┘                        └────┬─────┘
                                             │
                                        ┌────▼─────┐
                                        │ MongoDB  │
                                        │  Atlas   │
                                        └──────────┘
```

### Environment Variables

**Production Backend:**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong-random-string
CORS_ORIGIN=https://your-frontend.vercel.app
```

**Production Frontend:**
```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_SOCKET_URL=https://your-backend.railway.app
```

## Monitoring & Logging

### Recommended Tools
- **Backend Logs:** Winston, Morgan
- **Error Tracking:** Sentry
- **Performance:** New Relic, DataDog
- **Uptime:** UptimeRobot
- **Analytics:** Google Analytics, Mixpanel

---

**System designed for scalability, security, and user experience**
