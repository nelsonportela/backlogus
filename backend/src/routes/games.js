import GameService from '../services/gameService.js'

async function gamesRoutes(fastify, options) {
  // Search games from IGDB
  fastify.get('/search', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { q } = request.query

    if (!q || q.trim().length < 2) {
      return reply.status(400).send({ 
        message: 'Search query must be at least 2 characters long' 
      })
    }

    const gameService = new GameService(fastify.prisma, fastify.log)

    try {
      const games = await gameService.searchGames(request.user.userId, q, 20)
      return reply.send(games)
    } catch (error) {
      if (error.message.includes('credentials not found') || error.message.includes('credentials not configured')) {
        return reply.status(400).send({ 
          message: 'IGDB API credentials not configured. Please add your IGDB credentials in Settings to search for games.' 
        })
      }

      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to search games' 
      })
    }
  })

  // Get user's games library
  fastify.get('/user', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const gameService = new GameService(fastify.prisma, fastify.log)

    try {
      const transformedGames = await gameService.getUserLibrary(request.user.userId)
      return reply.send(transformedGames)
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to fetch games' 
      })
    }
  })

  // Get detailed game information by IGDB ID
  fastify.get('/details/:igdbId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { igdbId } = request.params

    if (!igdbId || isNaN(parseInt(igdbId))) {
      return reply.status(400).send({ 
        message: 'Valid IGDB ID is required' 
      })
    }

    const gameService = new GameService(fastify.prisma, fastify.log)

    try {
      const gameDetails = await gameService.getGameDetails(request.user.userId, igdbId)
      return reply.send(gameDetails)
    } catch (error) {
      if (error.message.includes('credentials not found') || error.message.includes('credentials not configured')) {
        return reply.status(400).send({ 
          message: 'IGDB API credentials not configured. Please add your IGDB credentials in Settings to get game details.' 
        })
      }

      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to get game details' 
      })
    }
  })

  // Add game to user's library
  fastify.post('/', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const gameService = new GameService(fastify.prisma, fastify.log)

    try {
      const userGame = await gameService.addGameToLibrary(request.user.userId, request.body)
      return reply.status(201).send(userGame)
    } catch (error) {
      if (error.message.includes('credentials not found') || error.message.includes('credentials not configured')) {
        return reply.status(400).send({ 
          message: 'IGDB API credentials not configured. Please add your IGDB credentials in Settings.' 
        })
      }

      // Handle validation errors
      if (error.message === 'IGDB ID is required' ||
          error.message === 'Invalid status value' ||
          error.message === 'Invalid quick_review value') {
        return reply.status(400).send({ message: error.message })
      }

      if (error.message === 'Game already in your library') {
        return reply.status(409).send({ message: error.message })
      }

      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to add game to library' 
      })
    }
  })

  // Update game in user's library
  fastify.patch('/:userGameId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { userGameId } = request.params
    const gameService = new GameService(fastify.prisma, fastify.log)

    if (!userGameId || isNaN(parseInt(userGameId))) {
      return reply.status(400).send({ 
        message: 'Valid user game ID is required' 
      })
    }

    try {
      const responseGame = await gameService.updateUserGame(
        request.user.userId, 
        userGameId, 
        request.body
      )
      return reply.send(responseGame)
    } catch (error) {
      // Handle validation errors
      if (error.message === 'Invalid status value' ||
          error.message === 'Invalid quick review value' ||
          error.message === 'At least one field to update is required') {
        return reply.status(400).send({ message: error.message })
      }

      if (error.message === 'Game not found in your library') {
        return reply.status(404).send({ message: error.message })
      }

      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to update game' 
      })
    }
  })

  // Remove game from user's library
  fastify.delete('/:userGameId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { userGameId } = request.params
    const gameService = new GameService(fastify.prisma, fastify.log)

    if (!userGameId || isNaN(parseInt(userGameId))) {
      return reply.status(400).send({ 
        message: 'Valid user game ID is required' 
      })
    }

    try {
      const result = await gameService.removeGameFromLibrary(request.user.userId, userGameId)
      return reply.send(result)
    } catch (error) {
      if (error.message === 'Game not found in your library') {
        return reply.status(404).send({ message: error.message })
      }

      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to remove game from library' 
      })
    }
  })

  // Get user statistics
  fastify.get('/stats', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const gameService = new GameService(fastify.prisma, fastify.log)

    try {
      const stats = await gameService.getUserStatistics(request.user.userId)
      return reply.send(stats)
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to fetch statistics' 
      })
    }
  })
}

export default gamesRoutes
