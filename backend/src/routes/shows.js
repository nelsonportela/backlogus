import ShowService from '../services/showService.js'

async function showsRoutes(fastify, options) {
  // Search TV shows via TMDB API
  fastify.get('/search', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { q } = request.query

    if (!q || q.trim().length === 0) {
      return reply.status(400).send({ 
        message: 'Search query is required' 
      })
    }

    const showService = new ShowService(fastify.prisma, fastify.log)

    try {
      const shows = await showService.searchShows(request.user.userId, q)
      return reply.send(shows)
    } catch (error) {
      if (error.message.includes('credentials not found') || error.message.includes('credentials not configured')) {
        return reply.status(400).send({ 
          message: 'TMDB API credentials not configured. Please add your TMDB API key in Settings to search for TV shows.' 
        })
      }

      fastify.log.error('TV show search failed:', error)
      return reply.status(500).send({ 
        message: 'Failed to search TV shows' 
      })
    }
  })

  // Get user's TV show library
  fastify.get('/user', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const showService = new ShowService(fastify.prisma, fastify.log)

    try {
      const shows = await showService.getUserLibrary(request.user.userId)
      return reply.send(shows)
    } catch (error) {
      fastify.log.error('Get user show library failed:', error)
      return reply.status(500).send({ 
        message: 'Failed to retrieve your TV show library' 
      })
    }
  })

  // Add TV show to user's library
  fastify.post('/', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const showService = new ShowService(fastify.prisma, fastify.log)

    try {
      const userShow = await showService.addShowToLibrary(request.user.userId, request.body)
      return reply.status(201).send(userShow)
    } catch (error) {
      if (error.message.includes('credentials not found') || error.message.includes('credentials not configured')) {
        return reply.status(400).send({ 
          message: 'TMDB API credentials not configured. Please add your TMDB API key in Settings to add TV shows.' 
        })
      }

      // Handle validation errors
      if (error.message.includes('tmdb_id is required') ||
          error.message.includes('Invalid status') ||
          error.message.includes('Invalid quick_review')) {
        return reply.status(400).send({ message: error.message })
      }

      if (error.message.includes('Show is already in your library')) {
        return reply.status(409).send({ message: error.message })
      }

      fastify.log.error('Add show to library failed:', error)
      return reply.status(500).send({ 
        message: 'Failed to add TV show to your library' 
      })
    }
  })

  // Update TV show in user's library
  fastify.patch('/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params
    const showService = new ShowService(fastify.prisma, fastify.log)

    try {
      const updatedShow = await showService.updateUserShow(request.user.userId, id, request.body)
      return reply.send(updatedShow)
    } catch (error) {
      if (error.message.includes('not found')) {
        return reply.status(404).send({ message: error.message })
      }

      fastify.log.error('Update show failed:', error)
      return reply.status(500).send({ 
        message: 'Failed to update TV show' 
      })
    }
  })

  // Remove TV show from user's library
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params
    const showService = new ShowService(fastify.prisma, fastify.log)

    try {
      await showService.removeShowFromLibrary(request.user.userId, id)
      return reply.status(204).send()
    } catch (error) {
      if (error.message.includes('not found')) {
        return reply.status(404).send({ message: error.message })
      }

      fastify.log.error('Remove show failed:', error)
      return reply.status(500).send({ 
        message: 'Failed to remove TV show from library' 
      })
    }
  })

  // Get specific TV show details by TMDB ID
  fastify.get('/details/:tmdbId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { tmdbId } = request.params
    const showService = new ShowService(fastify.prisma, fastify.log)

    try {
      const showDetails = await showService.getShowDetailsByTmdbId(request.user.userId, tmdbId)
      return reply.send(showDetails)
    } catch (error) {
      if (error.message.includes('credentials not found') || error.message.includes('credentials not configured')) {
        return reply.status(400).send({ 
          message: 'TMDB API credentials not configured. Please add your TMDB API key in Settings to view TV show details.' 
        })
      }

      fastify.log.error('Get show details by TMDB ID failed:', error)
      return reply.status(500).send({ 
        message: 'Failed to get TV show details' 
      })
    }
  })

  // Get specific TV show details
  fastify.get('/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params
    const showService = new ShowService(fastify.prisma, fastify.log)

    try {
      const show = await showService.getShowById(request.user.userId, id)
      return reply.send(show)
    } catch (error) {
      if (error.message.includes('not found')) {
        return reply.status(404).send({ message: error.message })
      }

      if (error.message.includes('credentials not found') || error.message.includes('credentials not configured')) {
        return reply.status(400).send({ 
          message: 'TMDB API credentials not configured. Please add your TMDB API key in Settings to view TV show details.' 
        })
      }

      fastify.log.error('Get show details failed:', error)
      return reply.status(500).send({ 
        message: 'Failed to get TV show details' 
      })
    }
  })
}

export default showsRoutes
