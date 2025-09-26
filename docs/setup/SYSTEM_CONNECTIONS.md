# EthioHeritage360 - Complete System Connections

## ✅ SYSTEM STATUS: FULLY CONNECTED

All folders, files, database, and backend are properly connected and configured!

## 🏗️ PROJECT ARCHITECTURE

```
Project-for-G25/
├── client/                    # React Frontend (Port 5173)
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/           # Application pages
│   │   ├── services/        # API service calls
│   │   ├── store/           # Redux store configuration
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── server/                   # Node.js Backend (Port 5000)
│   ├── config/              # Configuration files
│   │   ├── database.js      # MongoDB connection
│   │   └── env.js           # Environment variables
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Authentication & validation
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API endpoints
│   ├── services/            # Business logic services
│   └── utils/               # Helper functions
├── docs/                    # Documentation
└── scripts/                 # Database seeding scripts
```

## 🔌 CONNECTIONS VERIFIED

### ✅ Database Connection
- **MongoDB**: Running on localhost:27017
- **Database**: ethioheritage360
- **Status**: Connected and operational
- **Models**: All 20+ models properly defined and indexed

### ✅ Backend Server
- **Framework**: Express.js
- **Port**: 5000
- **Environment**: Development
- **Status**: Running and connected to MongoDB
- **Health Check**: http://localhost:5000/api/health

### ✅ API Routes Connected
- **Authentication**: `/api/auth` ✅
- **Tour Packages**: `/api/tour-packages` ✅
- **Bookings**: `/api/bookings` ✅
- **Messages**: `/api/messages` ✅
- **Virtual Museum**: `/api/virtual-museum` ✅
- **Organizer**: `/api/organizer` ✅
- **Map**: `/api/map` ✅

### ✅ File Structure Connected
- All controllers properly linked to routes
- All models properly defined with Mongoose schemas
- Middleware properly configured for authentication
- Environment variables properly configured
- CORS configured for frontend communication

## 🚀 HOW TO START THE SYSTEM

### Option 1: Use the Automated Script
```bash
# Double-click this file or run in command prompt:
start-system.bat
```

### Option 2: Manual Startup

**1. Start Backend:**
```bash
cd server
node server.js
```

**2. Start Frontend (in new terminal):**
```bash
cd client
npm run dev
```

## 🔗 SYSTEM ENDPOINTS

### Backend API
- **Base URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **API Documentation**: http://localhost:5000 (JSON response with all endpoints)

### Frontend
- **Development URL**: http://localhost:5173
- **Production Build**: `npm run build` in client folder

## 📊 DATABASE MODELS

All database models are properly connected and include:

1. **User** - Authentication and user management
2. **TourPackage** - Tour packages and itineraries
3. **Booking** - Tour bookings and reservations
4. **Message** - User communications
5. **Museum** - Museum information and management
6. **Artifact** - Museum artifacts and collections
7. **Event** - Events and activities
8. **HeritageSite** - Ethiopian heritage sites
9. **Notification** - System notifications
10. **Analytics** - System analytics and reporting
11. **SystemSettings** - Application configuration
... and 10+ more models

## 🛡️ SECURITY FEATURES

- **Authentication**: JWT-based authentication
- **Password Hashing**: bcrypt implementation
- **Rate Limiting**: Express rate limiter
- **CORS**: Configured for secure cross-origin requests
- **Helmet**: Security headers middleware
- **Input Validation**: Express validator middleware

## 🎯 ROLE-BASED ACCESS CONTROL

- **Super Admin**: Full system control
- **Museum Admin**: Museum-specific management
- **Organizer**: Tour package management
- **User/Visitor**: Basic user features

## 📝 ENVIRONMENT CONFIGURATION

### Server (.env)
- PORT=5000
- MONGODB_URI=mongodb://localhost:27017/ethioheritage360
- JWT_SECRET=ethioheritage360_jwt_secret_key_2024
- NODE_ENV=development

### Client (.env)
- VITE_API_URL=http://localhost:5000/api

## 🔍 TESTING CONNECTIONS

### Test Backend Health:
```bash
curl http://localhost:5000/api/health
```

### Test Database Connection:
The server startup log will show "MongoDB Connected: localhost"

### Test API Endpoints:
All endpoints are documented at: http://localhost:5000

## 🎉 SYSTEM IS READY!

Your EthioHeritage360 system is fully connected and operational:
- ✅ Frontend React application
- ✅ Backend Express.js server  
- ✅ MongoDB database
- ✅ All API routes and controllers
- ✅ Authentication and security middleware
- ✅ File upload capabilities
- ✅ Real-time Socket.IO features
- ✅ Comprehensive error handling

You can now:
1. Register users through the auth endpoints
2. Create and manage tour packages
3. Handle bookings and reservations
4. Manage museums and heritage sites
5. Use the virtual museum features
6. Send messages and notifications

## 🆘 TROUBLESHOOTING

If you encounter issues:

1. **Port 5000 in use**: Stop existing Node processes
2. **MongoDB not running**: Start MongoDB service
3. **Dependencies missing**: Run `npm install` from root directory
4. **CORS errors**: Check client/server environment configurations

## 📞 SUPPORT

For technical support, refer to:
- Server logs in terminal
- Network tab in browser developer tools
- MongoDB logs (if database issues)
- Individual route documentation at http://localhost:5000
