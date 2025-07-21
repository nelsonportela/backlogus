# Media Tracker

A modern, responsive web application for tracking your games and media collection. Built with Vue 3 and Node.js with a focus on clean architecture and user experience.

## ✨ Features

- 🎮 **Game Library Management**: Search and add games from the IGDB database
- 🔐 **Secure Authentication**: JWT-based user authentication with password hashing
- 📱 **Fully Responsive**: Mobile-first design with dark/light theme support
- 📊 **Status Tracking**: Track games as Want to Play, Playing, Completed, or Dropped  
- ⭐ **Rating System**: Quick review system with thumbs up/down/neutral
- 🖼️ **Rich Media**: Game screenshots, cover art, and detailed information
- 🎯 **Modern UI**: Clean interface with Tailwind CSS and smooth animations

## 🏗️ Tech Stack

### Frontend
- **Vue 3** with Composition API - Progressive JavaScript framework
- **Pinia** - Intuitive state management
- **Vue Router** - Client-side routing with navigation guards  
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **Axios** - Promise-based HTTP client
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime environment
- **Fastify** - Fast and low overhead web framework
- **Prisma** - Next-generation ORM with type safety
- **SQLite** - Lightweight database for development
- **JWT** - Secure authentication tokens
- **bcryptjs** - Password hashing and verification
- **IGDB API** - Game database integration

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- IGDB API credentials ([Get them here](https://dev.twitch.tv/console/apps))

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd tracky
   ```

2. **Install dependencies**:
   ```bash
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies  
   cd ../frontend && npm install
   ```

3. **Set up environment variables**:
   ```bash
   # Copy example environment file
   cd ../backend
   cp .env.example .env
   
   # Edit .env with your configuration
   # Add your IGDB_CLIENT_ID and IGDB_ACCESS_TOKEN
   ```

4. **Initialize the database**:
   ```bash
   # Generate Prisma client and create database
   npm run db:generate
   npm run db:push
   ```

5. **Start development servers**:
   ```bash
   # Terminal 1 - Backend (from backend directory)
   npm run dev
   
   # Terminal 2 - Frontend (from frontend directory)
   cd ../frontend && npm run dev
   ```

6. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Database (SQLite for development)
DATABASE_URL="file:./dev.db"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secure-jwt-secret-here"

# Server Configuration  
PORT=3001
NODE_ENV="development"

# IGDB API Configuration (required)
IGDB_CLIENT_ID="your-igdb-client-id"
IGDB_ACCESS_TOKEN="your-igdb-access-token"
```

## 📱 Features Overview

### Authentication System
- User registration and login
- JWT-based session management
- Secure password hashing
- Protected routes and API endpoints

### Game Management
- **Search**: Real-time search through IGDB's extensive game database
- **Library**: Personal game collection with status tracking
- **Details**: Rich game information including screenshots, ratings, and metadata
- **Status Tracking**: Want to Play, Playing, Completed, Dropped
- **Quick Reviews**: Thumbs up/down/neutral rating system
- **Platform Tracking**: Record which platform you're playing on

### User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes with system preference detection  
- **Modal System**: Clean, accessible modals for game details and actions
- **Error Handling**: User-friendly error messages and loading states
- **Keyboard Navigation**: Full keyboard accessibility support

## 🗂️ Project Structure

```
tracky/
├── frontend/                   # Vue 3 frontend application
│   ├── src/
│   │   ├── components/        # Reusable Vue components
│   │   │   ├── media/         # Media-specific components
│   │   │   └── ui/            # General UI components
│   │   ├── composables/       # Vue composition functions
│   │   ├── layouts/           # Page layouts
│   │   ├── router/            # Vue Router configuration
│   │   ├── services/          # API service layer
│   │   ├── stores/            # Pinia state management
│   │   └── views/             # Page components
│   └── ...
├── backend/                    # Node.js backend API
│   ├── prisma/                # Database schema and migrations
│   └── src/
│       ├── routes/            # API route handlers
│       └── services/          # Business logic and external APIs
└── README.md
```

## 🔌 API Reference

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user account
- `POST /api/auth/login` - Authenticate and receive JWT token

### Games Endpoints  
- `GET /api/games/search?q={query}` - Search games from IGDB
- `GET /api/games/user` - Get user's game library
- `GET /api/games/details/:igdbId` - Get detailed game information
- `POST /api/games` - Add game to user's library
- `PATCH /api/games/:id` - Update game status, rating, or notes
- `DELETE /api/games/:id` - Remove game from library

## 🛠️ Development

### Available Scripts

**Frontend** (run in `frontend/` directory):
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint and fix code
- `npm run format` - Format code with Prettier

**Backend** (run in `backend/` directory):  
- `npm run dev` - Start development server with hot reload
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)

### Code Quality
- **ESLint** - JavaScript/Vue linting with modern rules
- **Prettier** - Code formatting for consistency
- **Type Safety** - Prisma provides full TypeScript support
- **Error Boundaries** - Comprehensive error handling throughout the app

## 🎨 UI/UX Features

- **Modern Scrollbars** - Custom-styled scrollbars for better aesthetics
- **Loading States** - Skeleton loaders and spinners for better perceived performance  
- **Toast Notifications** - Non-intrusive error and success messages
- **Image Carousels** - Interactive screenshot galleries
- **Responsive Grid Layouts** - Adaptive layouts that work on all screen sizes
- **Theme Persistence** - Theme preferences saved across sessions

## 📄 License

This project is licensed under the ISC License - see the package.json files for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔗 Links

- [IGDB API Documentation](https://api-docs.igdb.com/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Fastify Documentation](https://www.fastify.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
