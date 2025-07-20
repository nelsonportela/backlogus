<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Media Tracker Project Instructions

This is a media tracker application with separate frontend and backend projects.

## Project Structure
- `frontend/` - Vue 3 application with Pinia, Vue Router, and Tailwind CSS
- `backend/` - Node.js Fastify API with Prisma ORM and PostgreSQL

## Key Guidelines
- **No TypeScript** - Use plain JavaScript for all files
- **Keep it simple** - Prioritize clean, maintainable code
- **Modern practices** - Use Vue 3 Composition API, ES modules, async/await
- **Consistent naming** - Use camelCase for JavaScript, kebab-case for CSS classes

## Frontend Patterns
- Use Vue 3 Composition API with `setup()` function
- Manage state with Pinia stores
- Apply Tailwind CSS utility classes for styling
- Handle async operations in stores, not components
- Use router guards for authentication

## Backend Patterns
- Use Fastify plugins and decorators
- Implement proper error handling and HTTP status codes
- Use Prisma for all database operations
- Validate input data before processing
- Apply JWT authentication for protected routes

## Database
- Use PostgreSQL with Prisma ORM
- Follow the existing schema patterns
- Always handle database errors gracefully

## API Integration
- IGDB API for game data
- Transform IGDB responses to match frontend expectations
- Cache commonly used data when possible

When suggesting code changes, ensure they follow these patterns and maintain consistency with the existing codebase.
