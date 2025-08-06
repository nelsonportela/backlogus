import UserService from '../services/userService.js';

async function userRoutes(fastify, options) {
  // Get user profile
  fastify.get('/profile', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userService = new UserService(fastify.prisma, fastify.log)

    try {
      const userProfile = await userService.getUserProfile(request.user.userId)
      return reply.send(userProfile)
    } catch (error) {
      if (error.message === 'User not found') {
        return reply.status(404).send({ message: error.message })
      }

      fastify.log.error(error)
      return reply.status(500).send({ message: 'Failed to fetch user profile' })
    }
  })

  // Update user profile
  fastify.patch('/profile', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userService = new UserService(fastify.prisma, fastify.log)

    try {
      const updatedProfile = await userService.updateUserProfile(
        request.user.userId,
        request.user.email,
        request.body
      )
      return reply.send(updatedProfile)
    } catch (error) {
      // Handle validation errors
      if (error.message === 'Email already in use' ||
          error.message === 'No valid fields to update') {
        return reply.status(400).send({ message: error.message })
      }

      fastify.log.error(error)
      return reply.status(500).send({ message: 'Failed to update profile' })
    }
  })

  // Change password
  fastify.patch('/password', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { current_password, new_password } = request.body
    const userService = new UserService(fastify.prisma, fastify.log)

    try {
      const result = await userService.changePassword(
        request.user.userId,
        current_password,
        new_password
      )
      return reply.send(result)
    } catch (error) {
      // Handle validation errors
      if (error.message === 'Current password and new password are required' ||
          error.message === 'New password must be at least 6 characters long' ||
          error.message === 'Current password is incorrect') {
        return reply.status(400).send({ message: error.message })
      }

      if (error.message === 'User not found') {
        return reply.status(404).send({ message: error.message })
      }

      fastify.log.error(error)
      return reply.status(500).send({ message: 'Failed to update password' })
    }
  })

  // Get user API credentials
  fastify.get('/api-credentials', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userService = new UserService(fastify.prisma, fastify.log)

    try {
      const credentials = await userService.getApiCredentials(request.user.userId)
      return reply.send(credentials)
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ message: 'Failed to fetch API credentials' })
    }
  })

  // Add or update API credentials
  fastify.put('/api-credentials/:provider', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { provider } = request.params
    const userService = new UserService(fastify.prisma, fastify.log)

    try {
      const credential = await userService.upsertApiCredentials(
        request.user.userId,
        provider,
        request.body
      )
      return reply.send(credential)
    } catch (error) {
      // Handle validation errors
      if (error.message.includes('Unsupported API provider') ||
          error.message.includes('requires') ||
          error.message.includes('client_id') ||
          error.message.includes('api_key')) {
        return reply.status(400).send({ message: error.message })
      }

      fastify.log.error(error)
      return reply.status(500).send({ message: 'Failed to save API credentials' })
    }
  })

  // Delete API credentials
  fastify.delete('/api-credentials/:provider', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { provider } = request.params
    const userService = new UserService(fastify.prisma, fastify.log)

    try {
      const result = await userService.deleteApiCredentials(request.user.userId, provider)
      return reply.send(result)
    } catch (error) {
      if (error.message === 'API credentials not found') {
        return reply.status(404).send({ message: error.message })
      }

      fastify.log.error(error)
      return reply.status(500).send({ message: 'Failed to delete API credentials' })
    }
  })
}

export default userRoutes;
