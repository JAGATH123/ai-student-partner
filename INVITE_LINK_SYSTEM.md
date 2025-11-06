# Invite Link System - Quick Start Guide

## 🎯 Overview

The AI Student Partner now has a **passwordless invite link system** that allows:
- **Admins** to generate unique invite links
- **Users** to join with just their name (no password needed)
- **Real-time tracking** of link usage and user submissions
- **Automatic sync** between user entries and admin panel

---

## 🚀 Quick Start

### For Admins

1. **Start the Backend & Frontend:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Login as Admin:**
   - Go to `http://localhost:5173/login`
   - Email: `admin@aistudent.com`
   - Password: `admin123`

3. **Create Invite Link:**
   - Click on **"Invite Links"** in the navigation
   - Click **"CREATE LINK"** button
   - Fill in the form:
     - **Label** (required): e.g., "Math Quiz Session"
     - **Description** (optional): e.g., "For grade 10 students"
     - **Max Uses** (optional): Leave empty for unlimited
     - **Expires In Days** (optional): Leave empty for no expiry
   - Click **"GENERATE LINK"**

4. **Share the Link:**
   - Click the **copy icon** next to the link
   - Share it with your users via email, messaging, etc.
   - Example link: `http://localhost:5173/join/a1b2c3d4e5f6...`

### For Users

1. **Click the Invite Link:**
   - User receives the link from admin
   - Clicks the link (e.g., `http://localhost:5173/join/abc123...`)

2. **Enter Name:**
   - No email or password required!
   - Just enter their name
   - Click **"[ INITIATE SESSION ]"**

3. **Start Using:**
   - Automatically logged in
   - Can take quizzes immediately
   - Results sync to admin panel in real-time

---

## 📊 Admin Features

### Invite Link Management (`/admin/invites`)

**Create Links:**
- Generate unlimited invite links
- Set expiration dates (optional)
- Limit number of uses (optional)
- Add labels and descriptions for organization

**Monitor Links:**
- See active/inactive status
- Track usage count (e.g., "3 / 10 uses")
- View recent users who used each link
- See expiration dates

**Link Actions:**
- **Copy**: One-click copy to clipboard
- **Deactivate**: Disable a link permanently

### User Dashboard (`/admin/users`)
- See all users who joined via invite links
- Track their quiz submissions in real-time
- View individual user performance
- No email/password information (since they don't have one)

---

## 🔧 Technical Details

### Backend Architecture

**New Models:**
- `InviteLink.js`: Stores invite codes, usage tracking, metadata
- `User.js`: Updated to support optional email/password

**New Routes:**
- `POST /api/invite/create` - Admin creates invite link
- `GET /api/invite/list` - Admin gets all their invite links
- `GET /api/invite/validate/:code` - Validate invite code
- `POST /api/invite/join` - User joins with name + invite code
- `POST /api/invite/quick-login` - Quick re-login with session token
- `DELETE /api/invite/:id` - Deactivate invite link

**Key Features:**
- Crypto-secure random invite codes (32 characters)
- Session tokens stored in localStorage for quick re-login
- Automatic usage tracking
- Link expiration and usage limits
- Real-time validation

### Frontend Components

**New Pages:**
- `Join.jsx` - User join page with invite code
- `admin/InviteLinks.jsx` - Admin invite link management

**Updated Components:**
- `App.jsx` - Added `/join/:inviteCode` route
- `Navbar.jsx` - Added "Invite Links" menu for admins
- `api.js` - Added invite API functions

**Styling:**
- Full cyberpunk theme integration
- Neon borders and glowing effects
- Animated status indicators
- Copy-to-clipboard functionality

---

## 🎨 User Flow

```
Admin Creates Link
       ↓
Admin Shares Link → http://localhost:5173/join/abc123...
       ↓
User Clicks Link
       ↓
User Enters Name (only!)
       ↓
System Creates User Account
       ↓
User Logs In Automatically
       ↓
User Takes Quizzes
       ↓
Admin Sees Results in Real-Time
```

---

## 💡 Use Cases

### 1. Classroom Quizzes
```
Teacher creates invite link for "Math Quiz #1"
Shares link with students via Google Classroom
Students click link, enter name, start quiz
Teacher monitors results in real-time on admin panel
```

### 2. Workshop Sessions
```
Workshop organizer creates link with 50 max uses
Shares with registered participants
Link expires after 7 days
Tracks completion rates
```

### 3. One-on-One Tutoring
```
Tutor creates personal link for each student
Each link labeled with student name
Unlimited validity
Tracks individual progress over time
```

---

## 🔒 Security Features

1. **Crypto-Secure Codes:**
   - 32-character random hex strings
   - Generated using Node.js `crypto` library
   - Virtually impossible to guess

2. **Link Validation:**
   - Checks active status
   - Verifies expiration date
   - Validates usage limits
   - Prevents duplicate registrations

3. **Session Management:**
   - JWT tokens for authentication
   - Session tokens for quick re-login
   - Automatic session expiration (7 days default)

4. **Admin Protection:**
   - Only admins can create links
   - Only admins can see link details
   - Users can only access their own data

---

## 📈 Real-Time Sync

**User Actions → Admin Panel:**
- User submits quiz answer
- Progress updated in database via Socket.IO
- Admin dashboard refreshes automatically
- Stats update in real-time

**Tracked Metrics:**
- Questions attempted
- Correct answers
- Accuracy percentage
- Topics studied
- Current streak
- Last activity

---

## 🐛 Troubleshooting

### "Invalid invite code" Error
- Check if link is still active
- Verify link hasn't expired
- Ensure max uses not reached
- Confirm link wasn't deactivated by admin

### User Can't Login Again
- User should use the same browser/device
- Session token stored in localStorage
- If cleared, user needs new invite link
- Alternative: Admin can enable email/password for user

### Backend Connection Issues
- Ensure MongoDB is running: `mongod` (or `brew services start mongodb-community`)
- Check backend is on port 5001: `npm run dev` in backend folder
- Verify `.env` file exists with correct settings

### Frontend Not Loading
- Check frontend is on port 5173: `npm run dev` in frontend folder
- Verify API URL in `.env`: `VITE_API_URL=http://localhost:5001/api`
- Clear browser cache and reload

---

## 🎯 Best Practices

1. **Label Your Links:**
   - Use descriptive labels like "Quiz #1 - Mathematics"
   - Add descriptions for context
   - Organize by date or topic

2. **Set Expiration Dates:**
   - For time-limited quizzes, set expiration
   - Workshop links: 1-7 days
   - Ongoing access: leave empty

3. **Limit Uses:**
   - Classroom: Set to number of students
   - Public workshops: Set reasonable limit
   - One-on-one: Set to 1

4. **Monitor Usage:**
   - Check "Recent Users" section
   - Track completion rates
   - Deactivate unused links

5. **Backup Links:**
   - Keep a spreadsheet of links and their purpose
   - Screenshot important link details
   - Export user data regularly

---

## 📝 API Examples

### Create Invite Link
```javascript
POST /api/invite/create
Headers: { Authorization: "Bearer <admin-token>" }
Body: {
  "label": "Math Quiz Session",
  "description": "For grade 10 students",
  "maxUses": 30,
  "expiresInDays": 7
}

Response: {
  "success": true,
  "inviteLink": {
    "code": "a1b2c3d4...",
    "url": "http://localhost:5173/join/a1b2c3d4...",
    "isActive": true,
    "expiresAt": "2025-11-12T...",
    "maxUses": 30,
    "usedCount": 0
  }
}
```

### User Join with Invite
```javascript
POST /api/invite/join
Body: {
  "name": "John Doe",
  "inviteCode": "a1b2c3d4..."
}

Response: {
  "success": true,
  "user": { ... },
  "token": "eyJhbGci..."
}
```

---

## 🎉 Benefits

✅ **No Registration Friction** - Users join instantly with just their name
✅ **Easy Sharing** - One link for entire class/group
✅ **Real-Time Tracking** - See submissions as they happen
✅ **Flexible Control** - Set limits, expiration, deactivation
✅ **Privacy Friendly** - No email collection required
✅ **Mobile Compatible** - Works on any device
✅ **Scalable** - Handle hundreds of users per link

---

## 🚀 Next Steps

1. **Start Backend:** `cd backend && npm run dev`
2. **Start Frontend:** `cd frontend && npm run dev`
3. **Login as Admin:** `admin@aistudent.com` / `admin123`
4. **Create Your First Link:** Click "Invite Links" → "CREATE LINK"
5. **Test It:** Copy link, open in incognito, join with a name
6. **Share with Users:** Send link via email, chat, QR code

---

## 📧 Support

For issues or questions:
- Check troubleshooting section above
- Review backend console for errors
- Check browser console for frontend errors
- Verify MongoDB is running
- Ensure all dependencies are installed

Enjoy your passwordless, cyberpunk-themed learning platform! 🎮✨
