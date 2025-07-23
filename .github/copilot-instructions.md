<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# BackLogus Project Instructions

A modern media backlog tracking application with Vue 3 frontend and Fastify backend. Supports games via IGDB API and movies via TMDB API, designed for expansion to TV shows, books, and other media types.

## Architecture Overview

**Monorepo Structure**: Two independent applications with shared patterns
- `frontend/` - Vue 3 SPA with Pinia, Vue Router, and Tailwind CSS
- `backend/` - Fastify API with Prisma ORM and PostgreSQL
- `dev-setup.sh` - Development helper script for database and Docker management

**Data Flow**: External APIs → Backend transformation → Prisma models → Frontend stores → Components
**Media Support**: Currently games (IGDB API), extensible for movies, TV shows, books, etc.

## Key Technical Constraints

- **No TypeScript** - Use plain JavaScript for all files
- **ES Modules only** - Use `import/export`, not CommonJS
- **Modern Vue 3** - Composition API with `<script setup>`, reactive refs, computed properties
- **Tailwind CSS** - Utility-first CSS framework for all styling
- **Dark/Light Mode** - Support both themes with proper CSS variables and Tailwind dark: classes
- **Snake_case ↔ camelCase mapping** - Database uses snake_case, JavaScript uses camelCase
- **Clean & Simple** - Prioritize readable, maintainable code over complex abstractions
- **Media Agnostic** - Design components and patterns to work across different media types

## Critical Development Workflows

### Database Setup
```bash
./dev-setup.sh start-db    # Start PostgreSQL container
./dev-setup.sh setup-db    # Run Prisma migrations
cd backend && npm run db:studio  # Open database GUI
```

### Development Servers
```bash
# Terminal 1 - Backend (port 3001)
cd backend && npm run dev

# Terminal 2 - Frontend (port 3000) 
cd frontend && npm run dev
```

## Data Architecture Patterns

### Media Status System (Currently Games, Expandable)
- **Database enum**: `WANT_TO_PLAY`, `PLAYING`, `COMPLETED`, `DROPPED`
- **Frontend values**: `want_to_play`, `playing`, `completed`, `dropped`
- **Future media**: Similar status patterns for books, movies, TV shows
- **Mapping handled in**: `backend/src/routes/games.js` (statusMap/reverseStatusMap)

### External API Integration (Expandable Architecture)
- **Current**: IGDB service in `backend/src/services/igdb.js`
- **Pattern**: Single API class with formatData() method for each media type
- **Field transformation**: External API → camelCase → database snake_case
- **Image URLs**: Replace thumbnails with appropriate sizes for UI needs
- **Future APIs**: TMDB (movies/TV), Google Books, etc.

### Authentication Flow
- **JWT tokens** stored in localStorage
- **Axios interceptors** auto-add Authorization headers (`frontend/src/services/api.js`)
- **Fastify decorator**: `authenticate` preHandler for protected routes

## Component Patterns

### Modern Vue 3 Practices
- **`<script setup>` syntax**: Use in all new components for cleaner, more performant code
- **Composition API**: Prefer `ref()`, `computed()`, `watch()` over Options API
- **Auto-imports**: Leverage Vue's reactivity system without explicit imports where configured
- **Component composition**: Small, focused components that can be reused across media types

### Frontend State Management
- **Stores in `frontend/src/stores/`**: Handle all API calls, never in components
- **Composables in `frontend/src/composables/`**: Reusable logic with `useApi()` and media-specific APIs
- **Error handling pattern**: Return `{ success: boolean, error?: string, data?: any }`

### Styling & Theming
- **Tailwind CSS**: Use utility classes exclusively, avoid custom CSS
- **Dark mode**: Use `dark:` prefix for dark theme variants
- **Responsive design**: Mobile-first approach with `sm:`, `md:`, `lg:` breakpoints
- **Component variants**: Use Tailwind's conditional classes for different states

### Modal System
- **MediaDetailsModal.vue**: Unified modal for search results and library items across all media types
- **State management**: `showModal` ref + `selectedItem` ref in parent components
- **Media type detection**: Distinguish between different media types and library vs search items

### Filtering System (Games Submenu)
- **URL-based filtering**: `/games?status=playing` format
- **DashboardLayout.vue**: Collapsible sidebar with game status filters
- **GamesView.vue**: `computed` property filters `allUserGames` based on `route.query.status`
- **Extensible pattern**: Same filtering approach will work for other media types

## Backend API Patterns

### Route Structure
```javascript
// Routes in backend/src/routes/
fastify.register(authRoutes, { prefix: '/api/auth' })
fastify.register(gamesRoutes, { prefix: '/api/games' })

// Auth endpoints: /api/auth/login, /api/auth/register, /api/auth/me
// Games endpoints: /api/games/search, /api/games/user, /api/games/:id
```

### Database Operations
- **Prisma relations**: User hasMany Games with cascade delete
- **Unique constraint**: `userId + igdbId` prevents duplicate library entries
- **Field mapping**: Always transform between database snake_case and API camelCase

### Error Handling Standards
```javascript
// Consistent error responses
return reply.status(400).send({ message: 'Descriptive error message' })

// Logging pattern
fastify.log.error(error)
```

## Environment Setup

### Required Environment Variables
```env
# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/backlogus_db"
JWT_SECRET="your-super-secret-jwt-key"
IGDB_CLIENT_ID="your-igdb-client-id" 
IGDB_ACCESS_TOKEN="your-igdb-access-token"
TMDB_API_KEY="your-tmdb-api-key"
```

### Docker Development
- **dev-setup.sh** handles Docker Compose operations
- **PostgreSQL container**: Persistent data with health checks
- **Development vs Production**: Different compose files for local/production environments

When making changes, maintain the established patterns for field mapping, error handling, and component state management. Always test the full flow from external APIs through to frontend display.
