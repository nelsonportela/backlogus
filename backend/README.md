# Media Tracker Backend

Fastify-based backend API for the Media Tracker app.

## Features

- RESTful API with Fastify
- JWT authentication
- IGDB API integration for game data
- PostgreSQL with Prisma ORM
- Comprehensive error handling
- Database migrations

## Tech Stack

- Node.js with ES modules
- Fastify web framework
- Prisma ORM
- PostgreSQL database
- JWT for authentication
- bcryptjs for password hashing
- IGDB API integration

## Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and API credentials

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:push

# Start development server
npm run dev

# Start production server
npm start

# Open Prisma Studio (database GUI)
npm run db:studio
```

## Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/media_tracker_db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
NODE_ENV=development
IGDB_CLIENT_ID="your-igdb-client-id"
IGDB_ACCESS_TOKEN="your-igdb-access-token"
```

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Games

- `GET /api/games/search?q={query}` - Search games from IGDB
- `GET /api/games/user` - Get user's game library
- `POST /api/games` - Add game to user's library
- `PATCH /api/games/:id` - Update game (status, rating, notes)
- `DELETE /api/games/:id` - Remove game from library

### Health Check

- `GET /api/health` - Server health status

## Database Schema

The application uses PostgreSQL with Prisma ORM:

- **Users**: Store user accounts
- **Games**: Store user's game library with IGDB references

## IGDB Integration

The app integrates with IGDB (Internet Game Database) API to fetch game information:
- Game search
- Cover images
- Release dates
- Genre information
