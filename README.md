# RAD - Ad Display Platform (Demo)

A sophisticated ad display platform demo built with React, TypeScript, and localStorage persistence. RAD provides comprehensive ad management, scheduling, player preview, and analytics capabilities.

## Features

### 🔐 Authentication
- Demo login system with role-based access (Admin/Operator)
- Session management with localStorage persistence
- Demo credentials: `admin@rad.test` with any password

### 📊 Dashboard
- Real-time metrics (Active Ads, Daily Plays, Screen Status, Pending Reviews)
- Performance charts placeholder (ready for Chart.js integration)
- Recent activity feed with live updates
- Responsive card-based layout

### 🎬 Ad Management
- Complete CRUD operations for advertisements
- Support for image and video ad types
- File upload simulation with drag-and-drop interface
- Scheduling with time windows and date ranges
- Status tracking (Active, Scheduled, Ended)
- Advanced filtering and search capabilities

### 📅 Schedule Management
- Interactive weekly schedule grid
- HTML5 drag-and-drop for desktop scheduling
- Mobile-friendly tap-to-assign interface
- Multi-screen support with screen selection
- Real-time schedule updates and persistence

### 🎮 Player Preview
- Live ad playback simulation
- Current playlist management
- Screenshot capture functionality
- Screen status monitoring (brightness, temperature, uptime)
- Volume controls and playback management

### 🗺️ Interactive Map
- Click-to-create fixed points with customizable radius
- Screen binding to geographical locations
- Route tracking and hotspot detection
- SVG-based route visualization
- CSV export for route data

### 📋 Activity Logs
- Comprehensive event logging (Ad Play, Screenshots, System Events)
- Advanced filtering by date range, screen, and event type
- Pagination for large datasets
- CSV export functionality with custom field selection
- Real-time log updates

### ⚙️ Settings Panel
- Brightness control with range sliders
- Auto/manual brightness toggles
- Package upgrade simulation
- Driver binding management
- Debug panel with database reset and sample data loading

## Technology Stack

### Frontend
- **React 18** with TypeScript for component architecture
- **Tailwind CSS** for responsive styling and design system
- **Wouter** for client-side routing
- **TanStack Query** for state management
- **Shadcn/ui** for accessible UI components
- **Lucide React** for icons

### Data Management
- **localStorage** for client-side persistence
- **Custom Store class** with async simulation
- **JSON-based data structure** with relational modeling
- **CSV export utilities** for data portability

### Styling & Design
- **Mobile-first responsive design** (≤640px mobile, 641-1024 tablet, >1024 desktop)
- **RAD brand colors** (Primary: #0b6ef6, Accent: #ff7a00, Neutrals: greys)
- **Smooth animations** and transitions
- **Accessible design** with ARIA labels and keyboard navigation
- **BEM-like CSS** naming convention

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd rad-platform
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Development: `http://localhost:5000`
   - The app will automatically bind to host `0.0.0.0` for external access

### Building for Production

```bash
npm run build
npm start
