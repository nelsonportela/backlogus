
# BackLogus

A- 📱 **Fully Responsive**: Mobile-first design with dark/light theme support
- 📈 **Status Tracking**: Track media as Want to Play/Watch, Playing/Watching, Completed, or Dropped  
- ⭐ **Rating System**: Quick review system with thumbs up/down/neutralrn, responsive web application for tracking your media backlog across games, movies, TV shows, and more. Built with Vue 3 and Node.js (Fastify) with a focus on clean architecture, user experience, and extensibility. Features a comprehensive dashboard, smart recommendations, and "Surprise Me" functionality to help you decide what to play or watch next.


## ✨ Features

- 🎮 **Game Library Management**: Search and add games from the IGDB database
- 🎬 **Movie Tracking**: Search and manage movies with TMDB integration  
- 📺 **TV Show Tracking**: Complete TV show management with season/episode tracking
- 🎲 **"Surprise Me" Feature**: Random picker to help you decide what to play/watch next
- 📊 **Analytics Dashboard**: Visual charts and statistics across all your media
- 🎯 **Smart Recommendations**: Contextual suggestions based on your activity
-  **Secure Authentication**: JWT-based user authentication
- 📱 **Fully Responsive**: Mobile-first design with dark/light theme support
- � **Status Tracking**: Track media as Want to Play/Watch, Playing/Watching, Completed, or Dropped  
- ⭐ **Rating System**: Quick review system with thumbs up/down/neutral
- 🖼️ **Rich Media**: Cover art, screenshots, cast information, and detailed metadata
- 🎯 **Modern UI**: Clean interface with Tailwind CSS and smooth animations

## 🏗️ Tech Stack


### Frontend
- **Vue 3** with Composition API
- **Pinia** - State management 
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Interactive charts for analytics
- **Vite** - Fast build tool and development server


### Backend
- **Node.js** - JavaScript runtime
- **Fastify** - Fast web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **IGDB API** - Game database integration
- **TMDB API** - Movie and TV show database integration

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- PostgreSQL database (or Docker for development)
- IGDB API credentials ([Get them here](https://dev.twitch.tv/console/apps))
- TMDB API key ([Get it here](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd backlogus
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
   ```

4. **Set up database** (choose one option):

   **Option A: Using Docker (Recommended)**
   ```bash
   # Start PostgreSQL container using helper script
   ./dev-setup.sh start-db
   
   # Set up database schema
   ./dev-setup.sh setup-db
   ```
   
   **Option B: Local PostgreSQL**
   ```bash
   # Make sure PostgreSQL is running locally
   # Update DATABASE_URL in backend/.env to your local instance
   cd backend
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
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Database (PostgreSQL for production, SQLite for quick development)
DATABASE_URL="postgresql://user:password@localhost:5432/backlogus_db"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secure-jwt-secret-here"

# Server Configuration  
PORT=3001
NODE_ENV="development"
```

## 📱 Features Overview

### Analytics Dashboard
- **Unified Overview**: See statistics across all your media types or focus on specific ones
- **Visual Charts**: Beautiful charts showing status distribution, monthly activity, and trends
- **Smart Recommendations**: Get suggestions on what to continue, tackle from your backlog, or discover
- **Activity Timeline**: Track your recent additions and status changes
- **Popular Genres**: See your most-loved genres with visual rankings

### Media Management

#### Games
- **Search**: Real-time search through IGDB's extensive game database
- **Library**: Personal game collection with status tracking
- **Details**: Rich game information including screenshots, ratings, and metadata
- **Status Tracking**: Want to Play, Playing, Completed, Dropped
- **Quick Reviews**: Thumbs up/down/neutral rating system

#### Movies
- **TMDB Integration**: Search millions of movies with rich metadata
- **Complete Details**: Cast, crew, runtime, budget, and certification
- **Status Management**: Want to Watch, Watching, Watched, Dropped

#### TV Shows  
- **Full Show Tracking**: Complete TMDB integration for TV series
- **Season/Episode Progress**: Track exactly where you are in each show
- **Show Details**: Cast, creators, networks, episode counts, and air dates
- **Status Management**: Want to Watch, Watching, Watched, Dropped

### "Surprise Me" Feature
- **Random Pickers**: Get random suggestions from your want-to-play/watch lists
- **Multi-Media Support**: Works across games, movies, and TV shows
- **Quick Actions**: Instantly update status to "playing" or "watching"


### User Interface
- **Multi-Media Dashboard**: Unified view with analytics across all media types
- **Media Type Switching**: Seamlessly switch between games, movies, TV shows, or view all
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes with system preference detection


## 🗂️ Project Structure

```
backlogus/
├── frontend/                   # Vue 3 frontend application
│   ├── src/
│   │   ├── components/        # Reusable Vue components
│   │   │   ├── home/          # Dashboard components
│   │   │   ├── media/         # Media-specific components
│   │   │   ├── settings/      # User settings and preferences
│   │   │   └── ui/            # General UI components
│   │   ├── composables/       # Vue composition functions
│   │   ├── layouts/           # Page layouts (Dashboard, etc)
│   │   ├── router/            # Vue Router configuration
│   │   ├── services/          # API service layer
│   │   ├── stores/            # Pinia state management
│   │   └── views/             # Page components
│   └── ...
├── backend/                    # Node.js backend API
│   ├── prisma/                # Database schema and migrations
│   └── src/
│       ├── routes/            # API route handlers (auth, games, movies, shows)
│       ├── services/          # Business logic and external APIs
│       └── utils/             # Utility functions
├── dev-setup.sh               # Development helper script
└── README.md
```

## 🔌 API Reference

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user account
- `POST /api/auth/login` - Authenticate and receive JWT token
- `GET /api/auth/me` - Get current user profile

### Games Endpoints  
- `GET /api/games/search?q={query}` - Search games from IGDB
- `GET /api/games/user` - Get user's game library
- `GET /api/games/details/:igdbId` - Get detailed game information
- `POST /api/games` - Add game to user's library
- `PATCH /api/games/:id` - Update game status, rating, or notes
- `DELETE /api/games/:id` - Remove game from library
- `GET /api/games/stats` - Get user's game statistics

### Movies Endpoints
- `GET /api/movies/search?q={query}` - Search movies from TMDB
- `GET /api/movies/user` - Get user's movie library
- `GET /api/movies/details/:tmdbId` - Get detailed movie information
- `POST /api/movies` - Add movie to user's library
- `PATCH /api/movies/:id` - Update movie status, rating, or notes
- `DELETE /api/movies/:id` - Remove movie from library
- `GET /api/movies/stats` - Get user's movie statistics

### TV Shows Endpoints
- `GET /api/shows/search?q={query}` - Search TV shows from TMDB  
- `GET /api/shows/user` - Get user's TV show library
- `GET /api/shows/details/:tmdbId` - Get detailed show information
- `POST /api/shows` - Add show to user's library
- `PATCH /api/shows/:id` - Update show status, progress, rating, or notes
- `DELETE /api/shows/:id` - Remove show from library
- `GET /api/shows/stats` - Get user's TV show statistics

### Media Statistics
- `GET /api/media/stats` - Get unified statistics across all media types

## 🛠️ Development

### Available Scripts

**Root Directory**:
- `./dev-setup.sh start-db` - Start PostgreSQL Docker container
- `./dev-setup.sh setup-db` - Set up database schema  
- `./dev-setup.sh stop-db` - Stop database container

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
- **ESLint** - JavaScript/Vue linting
- **Prettier** - Code formatting
- **Prisma** - Type-safe database access

## 🎨 UI/UX Features

- **Analytics Charts** - Interactive charts showing your media consumption patterns
- **Smart Recommendations** - Contextual suggestions based on your library and activity
- **Random Pickers** - "Surprise Me" functionality to help decide what to enjoy next
- **Responsive Design** - Seamless experience across desktop, tablet, and mobile
- **Dark/Light Theme** - Toggle between themes with system preference detection
- **Real-time Search** - Instant search results across all media types

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔗 Links

- [IGDB API Documentation](https://api-docs.igdb.com/)
- [TMDB API Documentation](https://developer.themoviedb.org/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [Fastify Documentation](https://www.fastify.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
