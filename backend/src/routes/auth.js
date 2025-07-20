import bcrypt from 'bcryptjs'

async function authRoutes(fastify, options) {
  // Register endpoint
  fastify.post('/register', async (request, reply) => {
    const { email, password } = request.body
    
    if (!email || !password) {
      return reply.status(400).send({ 
        message: 'Email and password are required' 
      })
    }

    if (password.length < 6) {
      return reply.status(400).send({ 
        message: 'Password must be at least 6 characters long' 
      })
    }

    try {
      // Check if user exists
      const existingUser = await fastify.prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return reply.status(409).send({ 
          message: 'User already exists' 
        })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user
      const user = await fastify.prisma.user.create({
        data: {
          email,
          password: hashedPassword
        },
        select: {
          id: true,
          email: true,
          createdAt: true
        }
      })

      // Generate JWT
      const token = fastify.jwt.sign({ 
        userId: user.id, 
        email: user.email 
      })

      return reply.send({
        message: 'User created successfully',
        user,
        token
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Internal server error' 
      })
    }
  })

  // Login endpoint
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body

    if (!email || !password) {
      return reply.status(400).send({ 
        message: 'Email and password are required' 
      })
    }

    try {
      // Find user
      const user = await fastify.prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        return reply.status(401).send({ 
          message: 'Invalid credentials' 
        })
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)

      if (!isValidPassword) {
        return reply.status(401).send({ 
          message: 'Invalid credentials' 
        })
      }

      // Generate JWT
      const token = fastify.jwt.sign({ 
        userId: user.id, 
        email: user.email 
      })

      return reply.send({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Internal server error' 
      })
    }
  })

  // Get current user profile
  fastify.get('/me', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.userId },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true
        }
      })

      if (!user) {
        return reply.status(404).send({ 
          message: 'User not found' 
        })
      }

      return reply.send({ user })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Internal server error' 
      })
    }
  })
}

export default authRoutes
