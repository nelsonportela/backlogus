# Media Tracker Frontend

Vue 3 frontend application for the Media Tracker app.

## Features

- Modern, responsive design with Tailwind CSS
- JWT-based authentication
- Game search and library management
- Real-time status updates
- Clean, maintainable component architecture

## Tech Stack

- Vue 3 with Composition API
- Pinia for state management
- Vue Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- Vite for build tooling

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
src/
├── components/        # Reusable Vue components
├── layouts/          # Layout components
├── views/            # Page components
├── stores/           # Pinia stores
├── router/           # Vue Router configuration
├── App.vue           # Root component
├── main.js           # Application entry point
└── style.css         # Global styles
```

## Environment

The frontend expects the backend to be running on `http://localhost:3001`.

## Authentication Flow

1. Users land on login page if not authenticated
2. After login, users are redirected to the dashboard
3. JWT token is stored in localStorage and sent with API requests
4. Navigation guard protects authenticated routes
