# TribeFit - Health & Wellness Tracker

## Features
- Calorie, workout, sleep, weight, period tracking
- Google OAuth login
- Dashboard with charts
- Fitness clubs/community

## Quick Start

### 1. Clone & Install
```bash
git clone <repo>
cd tribefit

# Backend
cd server
npm install

# Frontend  
cd ../client
npm install
```

### 2. Environment Setup

**Create `server/.env`:**
```
MONGO_URI=mongodb://localhost:27017/tribefit
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
CLIENT_URL=http://localhost:3000
```

**Create `client/.env`:**
```
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 3. Google OAuth Setup (Fix Access Block Error)
1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 → Web application
3. **Authorized JavaScript origins**: Add `http://localhost:3000`
4. Copy Client ID to both .env files above
5. **Test users**: Add your email OR publish app
6. Wait 5-10 min for changes to propagate

### 4. Run
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm start
```

App: http://localhost:3000

## Troubleshooting Google Login
- ❌ **Access block error**: Check Console → Authorized JS origins + test users
- ❌ **Client ID mismatch**: Ensure exact same Client ID in both .env files
- ❌ **Token invalid**: Clear browser cache, restart servers
- Check Network tab → POST /api/auth/google response

## Tech Stack
Frontend: React 18 + Tailwind + Chart.js
Backend: Express + MongoDB + JWT + Google Auth Library
