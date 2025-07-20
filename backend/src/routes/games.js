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

const quickReviewMap = {
  'positive': 'POSITIVE',
  'neutral': 'NEUTRAL',
  'negative': 'NEGATIVE'
}

const reverseQuickReviewMap = {
  'POSITIVE': 'positive',
  'NEUTRAL': 'neutral',
  'NEGATIVE': 'negative'
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
        quick_review: game.quickReview ? reverseQuickReviewMap[game.quickReview] : null,
        releaseDate: game.releaseDate?.toISOString() || null,
        // Map database field names to frontend expected names
        igdb_id: game.igdbId, // Map igdbId to igdb_id for frontend consistency
        release_date: game.releaseDate?.toISOString() || null,
        cover_url: game.coverUrl,
        banner_url: game.bannerUrl,
        game_engine: game.gameEngine,
        esrb_rating: game.esrbRating,
        personal_rating: game.personalRating,
        total_rating: game.totalRating,
        aggregated_rating: game.aggregatedRating,
        user_platform: game.userPlatform
      }))

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

    try {
      const gameDetails = await IGDBService.getGameById(parseInt(igdbId))
      return reply.send(gameDetails)
    } catch (error) {
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
    const { 
      igdb_id, 
      name, 
      cover_url, 
      banner_url,
      release_date, 
      genres,
      summary,
      platforms,
      developer,
      publisher,
      game_engine,
      esrb_rating,
      website,
      screenshots,
      franchise,
      rating,
      total_rating,
      aggregated_rating,
      status = 'want_to_play',
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

      // Create game entry with comprehensive data
      const game = await fastify.prisma.game.create({
        data: {
          igdbId: parseInt(igdb_id),
          name,
          coverUrl: cover_url || null,
          bannerUrl: banner_url || null,
          releaseDate: release_date ? new Date(release_date) : null,
          genres: Array.isArray(genres) ? genres : [],
          summary: summary || null,
          platforms: Array.isArray(platforms) ? platforms : [],
          developer: developer || null,
          publisher: publisher || null,
          gameEngine: game_engine || null,
          esrbRating: esrb_rating || null,
          website: website || null,
          screenshots: Array.isArray(screenshots) ? screenshots : [],
          franchise: franchise || null,
          rating: rating ? parseFloat(rating) : null,
          totalRating: total_rating ? parseFloat(total_rating) : null,
          aggregatedRating: aggregated_rating ? parseFloat(aggregated_rating) : null,
          status: statusMap[status],
          notes: notes || null,
          userId: request.user.userId
        }
      })

      // Transform for response
      const responseGame = {
        ...game,
        status: reverseStatusMap[game.status],
        quick_review: game.quickReview ? reverseQuickReviewMap[game.quickReview] : null,
        releaseDate: game.releaseDate?.toISOString() || null,
        // Map database field names to frontend expected names
        igdb_id: game.igdbId, // Map igdbId to igdb_id for frontend consistency
        release_date: game.releaseDate?.toISOString() || null,
        cover_url: game.coverUrl,
        banner_url: game.bannerUrl,
        game_engine: game.gameEngine,
        esrb_rating: game.esrbRating,
        personal_rating: game.personalRating,
        total_rating: game.totalRating,
        aggregated_rating: game.aggregatedRating
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
    const { status, personal_rating, notes, quick_review, user_platform } = request.body

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

    if (personal_rating !== undefined) {
      updateData.personalRating = personal_rating ? parseInt(personal_rating) : null
    }

    if (notes !== undefined) {
      updateData.notes = notes || null
    }

    if (quick_review !== undefined) {
      if (quick_review === null) {
        updateData.quickReview = null
      } else if (!quickReviewMap[quick_review]) {
        return reply.status(400).send({ 
          message: 'Invalid quick review value' 
        })
      } else {
        updateData.quickReview = quickReviewMap[quick_review]
      }
    }

    if (user_platform !== undefined) {
      updateData.userPlatform = user_platform || null
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
        quick_review: updatedGame.quickReview ? reverseQuickReviewMap[updatedGame.quickReview] : null,
        releaseDate: updatedGame.releaseDate?.toISOString() || null,
        // Map database field names to frontend expected names
        release_date: updatedGame.releaseDate?.toISOString() || null,
        cover_url: updatedGame.coverUrl,
        game_engine: updatedGame.gameEngine,
        esrb_rating: updatedGame.esrbRating,
        personal_rating: updatedGame.personalRating,
        total_rating: updatedGame.totalRating,
        aggregated_rating: updatedGame.aggregatedRating,
        user_platform: updatedGame.userPlatform
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
