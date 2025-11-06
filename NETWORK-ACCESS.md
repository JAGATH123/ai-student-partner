# 🌐 Network Access Guide

## 📱 Share This Link With Others on Your WiFi

### For Your Computer:
- **Frontend:** http://192.168.1.106:5173
- **Backend API:** http://192.168.1.106:5000

### For Other Devices (Phones, Tablets, Other Computers):
1. **Connect to the SAME WiFi network**
2. **Open browser and visit:**
   ```
   http://192.168.1.106:5173
   ```

---

## 🔑 Login Credentials

### Admin Account:
- **Email:** admin@aistudent.com
- **Password:** admin123

### User Accounts:
- **Email:** john@example.com | **Password:** password123
- **Email:** jane@example.com | **Password:** password123

---

## 🚀 How to Start

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```
Expected output:
```
✅ MongoDB Connected
🚀 Server running on port 5000
📡 Network access: http://192.168.1.106:5000
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
Expected output:
```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.106:5173/
```

---

## ⚠️ Troubleshooting

### If others can't access:

1. **Windows Firewall:**
   - Windows will ask "Allow Node.js to access network?" → Click **Allow**
   - Or manually allow ports 5000 and 5173

2. **Port Already in Use:**
   - Stop any other process using these ports
   - Check with: `netstat -ano | findstr :5173`

3. **IP Address Changed:**
   - Your IP might change if you reconnect to WiFi
   - Check current IP: `ipconfig`
   - Update `.env` files if needed

---

## 🔗 Direct Links for Testing

Click these from your device:
- http://192.168.1.106:5173
- http://192.168.1.106:5000/api/health

Share the first link with anyone on your WiFi!
