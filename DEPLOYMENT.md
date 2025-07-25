# BackLogus Single-Container Deployment Guide

This project uses a single Docker container to serve both the Vue 3 frontend and Fastify backend. The frontend is built and copied into the backend's public directory, and all static files are served by Fastify.

## Build and Run Locally (Docker)

```bash
# From the project root
# Build the Docker image (replace <tag> as needed)
docker build -t backlogus:latest .

# Run the container (exposes backend+frontend on port 3001)
docker run -d --env-file backend/.env -p 3001:3001 backlogus:latest
```

- The app will be available at http://localhost:3001
- All API routes are under /api
- All frontend routes are handled by the SPA (served from /public)

## Production Deployment

1. Build and push the image to your registry (see your CI/CD workflow for tags).
2. Pull and run the image on your server:

```bash
docker pull <your-repo>/backlogus:latest
docker stop backlogus || true
docker rm backlogus || true
docker run -d --env-file /path/to/.env -p 3001:3001 --name backlogus <your-repo>/backlogus:latest
```

## Cleaning Up
- You can delete `frontend/Dockerfile` and `backend/Dockerfile`.
- Only the root `Dockerfile` is needed for deployment.

## Notes
- Make sure your backend Fastify server is configured to serve static files from `/public`.
- No nginx is needed in this setup.
- For environment variables, use the `.env` file in the backend directory.
