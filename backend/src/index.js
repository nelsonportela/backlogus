import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
})

// Initialize Prisma
const prisma = new PrismaClient()

// Register plugins
await fastify.register(cors, {
  origin: ['http://localhost:3000'],
  credentials: true
})

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET
})

// Serve static files (for platform logos)
await fastify.register(import('@fastify/static'), {
  root: path.join(__dirname, '../public'),
  prefix: '/'
})

// Add prisma to fastify instance
fastify.decorate('prisma', prisma)

// Auth decorator
fastify.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
})

// Register routes
await fastify.register(import('./routes/auth.js'), { prefix: '/api/auth' })
await fastify.register(import('./routes/games.js'), { prefix: '/api/games' })
await fastify.register(import('./routes/media.js'), { prefix: '/api/media' })

// Health check
fastify.get('/api/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down gracefully.`)
  await prisma.$disconnect()
  await fastify.close()
  process.exit(0)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3001
    await fastify.listen({ 
      port,
      host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'
    })
    
    console.log(`🚀 Server running on http://localhost:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
