# Media Tracker

A modern web application for tracking your games and media using Vue 3 and Node.js.

## Project Structure

```
├── frontend/          # Vue 3 frontend application
├── backend/           # Node.js backend API
└── README.md         # This file
```

## Features

- 🎮 **Game Tracking**: Search and add games from IGDB database
- 🔐 **Authentication**: Secure JWT-based authentication
- 📱 **Responsive Design**: Modern dashboard with Tailwind CSS
- 📊 **Library Management**: Track game status (Want to Play, Playing, Completed, Dropped)
- 🎯 **Clean Architecture**: Separate frontend and backend projects

## Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Fastify** - Web framework
- **Prisma** - ORM and database toolkit
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- IGDB API credentials

### Development Setup (with Docker)

1. **Start the database**:
```bash
# Using the helper script
./dev-setup.sh start-db

# Or manually with docker-compose
docker-compose -f docker-compose.dev.yml up -d
```

2. **Set up the database schema**:
```bash
# Using the helper script
./dev-setup.sh setup-db

# Or manually
cd backend
npm run db:generate
npm run db:push
cd ..
```

3. **Start development servers**:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### Environment Variables

Backend (`.env`):
```env
DATABASE_URL="postgresql://media_tracker_user:media_tracker_password@localhost:5432/media_tracker_db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
NODE_ENV=development
IGDB_CLIENT_ID="your-igdb-client-id"
IGDB_ACCESS_TOKEN="your-igdb-access-token"
```

## Development

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database Studio: `npm run db:studio` (in backend directory)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Games
- `GET /api/games/search?q={query}` - Search games from IGDB
- `GET /api/games/user` - Get user's game library
- `POST /api/games` - Add game to library
- `PATCH /api/games/:id` - Update game status/rating
- `DELETE /api/games/:id` - Remove game from library

## Database Schema

- **Users**: User accounts with email/password
- **Games**: User's game library with IGDB integration

## Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the ISC License.
