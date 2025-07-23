# Prisma Cheatsheet for BackLogus

## What is Prisma?

**Prisma** is a modern **Object-Relational Mapping (ORM)** tool for Node.js and TypeScript. In simple terms:

- **ORM**: A tool that lets you interact with your database using JavaScript objects instead of writing raw SQL
- **Type-safe**: Provides autocompletion and prevents database errors at compile time
- **Database agnostic**: Works with PostgreSQL, MySQL, SQLite, MongoDB, etc.

In BackLogus, Prisma:
- Manages our PostgreSQL database structure
- Generates JavaScript code to interact with the database
- Handles database migrations (schema changes)
- Provides a visual database browser (Prisma Studio)

## Key Files in BackLogus

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema definition
│   └── migrations/        # Database version history
│       ├── migration_lock.toml
│       └── 20250721_*/    # Individual migration files
├── .env                   # Database connection string
└── package.json          # Contains Prisma scripts
```

## Core Concepts

### 1. Schema (`prisma/schema.prisma`)
Defines your database structure using Prisma's syntax:

```prisma
model User {
  id       Int    @id @default(autoincrement())
  email    String @unique
  username String @unique
  password String
  games    UserGame[]    // Relationship to games
  movies   UserMovie[]   // Relationship to movies
}

model UserGame {
  id     Int        @id @default(autoincrement())
  userId Int        @map("user_id")
  igdbId Int        @map("igdb_id")
  status GameStatus @default(WANT_TO_PLAY)
  user   User       @relation(fields: [userId], references: [id])
  
  @@unique([userId, igdbId])  // Prevent duplicate entries
  @@map("user_games")         // Maps to 'user_games' table
}
```

### 2. Migrations
Track changes to your database schema over time. Each migration is a step forward in your database evolution.

### 3. Prisma Client
Auto-generated JavaScript code that provides type-safe database access in your application.

## Essential Commands

### Database Setup & Management

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Push schema changes to database (development)
npx prisma db push

# Create and apply migration (production-ready)
npx prisma migrate dev

# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy
```

### Database Inspection

```bash
# Open Prisma Studio (visual database browser)
npx prisma studio

# View current database status
npx prisma migrate status

# Introspect existing database to generate schema
npx prisma db pull
```

### Development Helpers

```bash
# Format schema file
npx prisma format

# Validate schema without changes
npx prisma validate

# See what would change without applying
npx prisma migrate diff --preview-feature
```

## BackLogus-Specific npm Scripts

These are defined in `backend/package.json` and can be run with `npm run <script>`:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (quick development)
npm run db:push

# Create migration (production workflow)
npm run db:migrate

# Open database browser
npm run db:studio
```

## Common BackLogus Database Operations

### Using Prisma Client in Code

```javascript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Find user by email
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
})

// Add game to user's library
const userGame = await prisma.userGame.create({
  data: {
    userId: 1,
    igdbId: 12345,
    status: 'PLAYING',
    title: 'The Legend of Zelda',
    // ... other fields
  }
})

// Get user's games with status filter
const games = await prisma.userGame.findMany({
  where: {
    userId: 1,
    status: 'COMPLETED'
  },
  include: {
    user: true  // Include related user data
  }
})

// Update game status
await prisma.userGame.update({
  where: { id: gameId },
  data: { status: 'COMPLETED' }
})

// Delete game from library
await prisma.userGame.delete({
  where: { id: gameId }
})
```

## Development Workflow

### When Starting Project
```bash
# 1. Start database
./dev-setup.sh start-db

# 2. Apply schema to database
./dev-setup.sh setup-db
# OR manually:
cd backend && npm run db:push
```

### When Making Schema Changes
```bash
# 1. Edit prisma/schema.prisma
# 2. Push changes to database
cd backend && npm run db:push

# 3. Regenerate Prisma Client (usually automatic)
npm run db:generate
```

### When Working with Production
```bash
# 1. Create migration instead of db:push
cd backend && npm run db:migrate

# 2. Commit migration files to git
git add prisma/migrations/
git commit -m "Add new table for user preferences"

# 3. Deploy migrations on production server
npm run db:migrate deploy
```

## Troubleshooting

### Common Issues

**"Prisma Client not found"**
```bash
cd backend && npm run db:generate
```

**"Database connection failed"**
- Check `.env` file has correct `DATABASE_URL`
- Ensure database container is running: `./dev-setup.sh start-db`

**"Migration failed"**
```bash
# Reset and start fresh (⚠️ loses data)
cd backend && npx prisma migrate reset

# Or fix manually and try again
npm run db:migrate
```

**"Schema out of sync"**
```bash
# Push current schema to database
cd backend && npm run db:push --accept-data-loss
```

### Database Backup & Recovery

```bash
# Backup database (PostgreSQL)
docker exec backlogus-db pg_dump -U media_tracker_user media_tracker_db > backup.sql

# Restore database
docker exec -i backlogus-db psql -U media_tracker_user -d media_tracker_db < backup.sql

# Export data as seed script
npx prisma db seed
```

## Best Practices for BackLogus

1. **Use `db:push` for development** - Quick iterations
2. **Use `db:migrate` for production** - Trackable changes
3. **Always backup before major changes**
4. **Run `prisma generate` after schema changes**
5. **Use Prisma Studio to inspect data**: `npm run db:studio`
6. **Keep migrations in git** for team collaboration

## Useful Prisma Studio Features

Access via `npm run db:studio` (opens in browser):

- **Browse tables**: View all your users, games, movies
- **Edit data**: Add/modify records directly
- **Filter & search**: Find specific records
- **Relationship navigation**: Click through related data
- **Query builder**: Build complex queries visually

## Field Mapping (BackLogus Specific)

BackLogus uses snake_case in database but camelCase in JavaScript:

```prisma
model UserGame {
  userId    Int  @map("user_id")     // Database: user_id, JS: userId
  igdbId    Int  @map("igdb_id")     // Database: igdb_id, JS: igdbId
  createdAt DateTime @map("created_at") // Database: created_at, JS: createdAt
  
  @@map("user_games")  // Table name: user_games
}
```

This mapping is handled automatically by Prisma!

### Rating System Note

BackLogus has two types of ratings in the database:

- **`personalRating`** (Int 1-10): Numeric rating scale (exists in DB but currently unused in UI)
- **`quickReview`** (Enum): Simple POSITIVE/NEUTRAL/NEGATIVE rating (actively used in UI)

The frontend currently only implements `quick_review` functionality.

## Quick Reference

| Task | Command |
|------|---------|
| Start fresh database | `./dev-setup.sh start-db && ./dev-setup.sh setup-db` |
| View database | `cd backend && npm run db:studio` |
| Update schema | Edit `schema.prisma` → `npm run db:push` |
| Backup database | `docker exec backlogus-db pg_dump -U [user] [db] > backup.sql` |
| Reset everything | `npx prisma migrate reset` |
| Generate client code | `npm run db:generate` |

---

**💡 Pro Tip**: Keep Prisma Studio open while developing - it's incredibly helpful for understanding your data structure and debugging issues!
