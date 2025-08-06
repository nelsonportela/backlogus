import AuthService from '../services/authService.js'

async function authRoutes(fastify, options) {
  // Register endpoint
  fastify.post('/register', async (request, reply) => {
    const { email, password } = request.body
    const authService = new AuthService(fastify.prisma, fastify.jwt, fastify.log)
    
    try {
      const result = await authService.registerUser(email, password)
      return reply.send({
        message: 'User created successfully',
        ...result
      })
    } catch (error) {
      // Handle validation errors
      if (error.message === 'Email and password are required' ||
          error.message === 'Password must be at least 6 characters long') {
        return reply.status(400).send({ message: error.message })
      }

      if (error.message === 'User already exists') {
        return reply.status(409).send({ message: error.message })
      }

      fastify.log.error(error)
      return reply.status(500).send({ message: 'Internal server error' })
    }
  })

  // Login endpoint
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body
    const authService = new AuthService(fastify.prisma, fastify.jwt, fastify.log)

    try {
      const result = await authService.loginUser(email, password)
      return reply.send({
        message: 'Login successful',
        ...result
      })
    } catch (error) {
      // Handle validation errors
      if (error.message === 'Email and password are required') {
        return reply.status(400).send({ message: error.message })
      }

      if (error.message === 'Invalid email or password') {
        return reply.status(401).send({ message: 'Invalid credentials' })
      }

      fastify.log.error(error)
      return reply.status(500).send({ message: 'Internal server error' })
    }
  })

  // Get current user profile
  fastify.get('/me', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const authService = new AuthService(fastify.prisma, fastify.jwt, fastify.log)

    try {
      const user = await authService.getAuthenticatedUser(request.user.userId)
      return reply.send({ user })
    } catch (error) {
      if (error.message === 'User not found') {
        return reply.status(404).send({ message: error.message })
      }

      fastify.log.error(error)
      return reply.status(500).send({ message: 'Internal server error' })
    }
  })
}

export default authRoutes
