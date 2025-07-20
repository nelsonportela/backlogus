import IGDBService from '../services/igdb.js'

const statusMap = {
  'want_to_play': 'WANT_TO_PLAY',
  'playing': 'PLAYING',
  'completed': 'COMPLETED',
  'dropped': 'DROPPED'
}

const reverseStatusMap = {
  'WANT_TO_PLAY': 'want_to_play',
  'PLAYING': 'playing',
  'COMPLETED': 'completed',
  'DROPPED': 'dropped'
}

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

    try {
      const games = await IGDBService.searchGames(q.trim(), 20)
      return reply.send(games)
    } catch (error) {
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
    try {
      const games = await fastify.prisma.game.findMany({
        where: { userId: request.user.userId },
        orderBy: { updatedAt: 'desc' }
      })

      // Transform status for frontend
      const transformedGames = games.map(game => ({
        ...game,
        status: reverseStatusMap[game.status],
        releaseDate: game.releaseDate?.toISOString() || null
      }))

      return reply.send(transformedGames)
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to fetch games' 
      })
    }
  })

  // Add game to user's library
  fastify.post('/', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { 
      igdb_id, 
      name, 
      cover_url, 
      release_date, 
      genres, 
      status = 'want_to_play',
      rating,
      notes 
    } = request.body

    if (!igdb_id || !name) {
      return reply.status(400).send({ 
        message: 'Game ID and name are required' 
      })
    }

    if (!statusMap[status]) {
      return reply.status(400).send({ 
        message: 'Invalid status value' 
      })
    }

    try {
      // Check if game already exists for user
      const existingGame = await fastify.prisma.game.findUnique({
        where: {
          userId_igdbId: {
            userId: request.user.userId,
            igdbId: parseInt(igdb_id)
          }
        }
      })

      if (existingGame) {
        return reply.status(409).send({ 
          message: 'Game already in your library' 
        })
      }

      // Create game entry
      const game = await fastify.prisma.game.create({
        data: {
          igdbId: parseInt(igdb_id),
          name,
          coverUrl: cover_url || null,
          releaseDate: release_date ? new Date(release_date) : null,
          genres: Array.isArray(genres) ? genres : [],
          status: statusMap[status],
          rating: rating ? parseInt(rating) : null,
          notes: notes || null,
          userId: request.user.userId
        }
      })

      // Transform for response
      const responseGame = {
        ...game,
        status: reverseStatusMap[game.status],
        releaseDate: game.releaseDate?.toISOString() || null
      }

      return reply.status(201).send(responseGame)
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to add game to library' 
      })
    }
  })

  // Update game in user's library
  fastify.patch('/:gameId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { gameId } = request.params
    const { status, rating, notes } = request.body

    if (!gameId || isNaN(parseInt(gameId))) {
      return reply.status(400).send({ 
        message: 'Valid game ID is required' 
      })
    }

    const updateData = {}
    
    if (status) {
      if (!statusMap[status]) {
        return reply.status(400).send({ 
          message: 'Invalid status value' 
        })
      }
      updateData.status = statusMap[status]
    }

    if (rating !== undefined) {
      updateData.rating = rating ? parseInt(rating) : null
    }

    if (notes !== undefined) {
      updateData.notes = notes || null
    }

    if (Object.keys(updateData).length === 0) {
      return reply.status(400).send({ 
        message: 'At least one field to update is required' 
      })
    }

    try {
      // Check if game belongs to user
      const existingGame = await fastify.prisma.game.findFirst({
        where: {
          id: parseInt(gameId),
          userId: request.user.userId
        }
      })

      if (!existingGame) {
        return reply.status(404).send({ 
          message: 'Game not found in your library' 
        })
      }

      // Update game
      const updatedGame = await fastify.prisma.game.update({
        where: { id: parseInt(gameId) },
        data: updateData
      })

      // Transform for response
      const responseGame = {
        ...updatedGame,
        status: reverseStatusMap[updatedGame.status],
        releaseDate: updatedGame.releaseDate?.toISOString() || null
      }

      return reply.send(responseGame)
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to update game' 
      })
    }
  })

  // Remove game from user's library
  fastify.delete('/:gameId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { gameId } = request.params

    if (!gameId || isNaN(parseInt(gameId))) {
      return reply.status(400).send({ 
        message: 'Valid game ID is required' 
      })
    }

    try {
      // Check if game belongs to user and delete
      const deletedGame = await fastify.prisma.game.deleteMany({
        where: {
          id: parseInt(gameId),
          userId: request.user.userId
        }
      })

      if (deletedGame.count === 0) {
        return reply.status(404).send({ 
          message: 'Game not found in your library' 
        })
      }

      return reply.send({ 
        message: 'Game removed from library' 
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to remove game from library' 
      })
    }
  })
}

export default gamesRoutes
