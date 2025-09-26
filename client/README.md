# Ethiopian Heritage 360° - Cultural Heritage Platform

A comprehensive React-based platform for exploring Ethiopian cultural heritage through virtual museums, interactive maps, educational content, and immersive experiences.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application
Open your browser and navigate to:
```
http://localhost:5173
```

## 🎯 Core Features

### 🏛️ Virtual Museums
- **3D Artifact Viewing**: Interactive 3D models using Three.js
- **Virtual Exhibitions**: Curated collections of Ethiopian heritage
- **AR/VR Support**: Immersive experiences for compatible devices
- **High-Resolution Images**: Detailed artifact photography

### 🗺️ Interactive Heritage Map
- **GPS Integration**: Discover heritage sites across Ethiopia
- **Detailed Site Information**: Historical context and visiting details
- **Route Planning**: Navigation assistance to heritage locations
- **Multi-layer Mapping**: Different views and data layers

### 📚 Educational Content
- **Comprehensive Courses**: Learn about Ethiopian culture and history
- **Interactive Study Guides**: Engaging learning materials
- **Progress Tracking**: Monitor learning achievements
- **Certification System**: Earn certificates upon course completion

### 🌍 Multi-language Support
- **English** (Default)
- **Amharic** (አማርኛ)
- **Oromo** (Afaan Oromoo)
- **Tigrinya** (ትግርኛ)

### Navigation
- **Collapsible Sidebar**: Responsive navigation with icons
- **Top Bar**: Search functionality, notifications, and user menu
- **Page Routing**: Seamless navigation between different sections

### Tour Management
- **Tour Packages**: Create, edit, and manage tour offerings
- **Booking Management**: View and update booking statuses
- **Schedule View**: Calendar-based tour scheduling
- **Customer Messages**: Handle customer inquiries and communications

### User Interface
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional design with emerald color scheme
- **Accessibility**: Screen reader friendly with proper ARIA labels
- **Interactive Elements**: Hover effects, transitions, and animations

## 🏗️ Project Structure

```
client/
├── src/
│   ├── context/
│   │   └── DashboardContext.jsx    # Global state management
│   ├── routes/
│   │   └── AppRoutes.jsx           # Routing configuration
│   └── utils/
│       ├── cn.js                   # Class name utility
│       └── toast.js                # Toast notifications
├── components/
│   ├── dashboard/                  # Dashboard components
│   │   ├── layout/                 # Layout components
│   │   ├── widgets/                # Dashboard widgets
│   │   ├── modals/                 # Modal components
│   │   └── index.js                # Component exports
│   ├── ui/                         # UI components
│   └── pages/                      # Page components
└── README.md                       # This file
```

## 🎨 Design System

### Colors
- **Primary**: Emerald (emerald-600, emerald-700)
- **Secondary**: Stone grays (stone-50, stone-100, stone-200, stone-600, stone-800)
- **Semantic**: Green (success), Amber (warning), Red (error), Blue (info)

### Typography
- **Font**: Inter (via Tailwind CSS)
- **Hierarchy**: text-2xl, text-xl, text-lg, text-sm, text-xs
- **Weights**: font-semibold, font-medium, font-normal

### Spacing
- **Grid System**: 4px base (gap-4, p-6, space-y-6)
- **Responsive**: Mobile-first with breakpoint-specific layouts

## 🔧 Technical Stack

- **React 19**: Core framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Lucide React**: Icon library
- **Custom UI Components**: Built with accessibility in mind

## 📱 Responsive Features

- **Mobile-First**: Designed for mobile devices first
- **Collapsible Sidebar**: Adapts to smaller screens
- **Touch-Friendly**: Optimized for touch interactions
- **Breakpoint System**: Responsive grid layouts

## 🎯 Key Features

### Dashboard Widgets
- **Summary Cards**: Real-time statistics
- **Quick Actions**: Common task shortcuts
- **Recent Activities**: Live activity feed
- **Calendar View**: Interactive tour calendar

### Tour Management
- **Create Tours**: Comprehensive tour creation form
- **Edit Tours**: Update tour details and pricing
- **Delete Tours**: Safe deletion with confirmation
- **Tour Status**: Active, inactive, draft states

### Booking System
- **View Bookings**: Table view with filtering
- **Update Status**: Confirm, cancel, complete bookings
- **Contact Customers**: Email and phone integration
- **Export Data**: Download booking reports

### Customer Communication
- **Message Management**: View and reply to inquiries
- **Status Tracking**: Track message status
- **Search & Filter**: Find specific messages
- **Bulk Actions**: Manage multiple messages

## 🚀 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Development Tips
1. **Hot Reload**: Changes reflect immediately in the browser
2. **Console Logs**: Toast notifications appear in browser console
3. **Sample Data**: Dashboard comes with sample tour and booking data
4. **Responsive Testing**: Test on different screen sizes

## 🎉 Ready to Use

The Tour Organizer Dashboard is now ready to run! Simply start the development server and navigate to `/tour-organizer` to see the professional dashboard in action.

### Demo Features
- **Sample Tours**: 3 pre-loaded tour packages
- **Sample Bookings**: 3 example bookings with different statuses
- **Interactive Elements**: All buttons and forms are functional
- **Responsive Design**: Test on mobile and desktop

Enjoy exploring the Tour Organizer Dashboard! 🎯
