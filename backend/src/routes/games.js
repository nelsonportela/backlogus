import IGDBService from '../services/igdb.js'
import imageCacheService from '../services/imageCache.js'
import { cacheAllMediaImages } from '../services/mediaImageCache.js'

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

// Helper function to get user's IGDB credentials
async function getUserIGDBCredentials(fastify, userId) {
  const credentials = await fastify.prisma.userApiCredential.findUnique({
    where: {
      userId_apiProvider: {
        userId: userId,
        apiProvider: 'igdb'
      }
    }
  })

  if (!credentials || !credentials.isActive) {
    return null
  }

  return {
    clientId: credentials.clientId,
    accessToken: credentials.accessToken
  }
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
      // Get user's IGDB credentials
      const credentials = await getUserIGDBCredentials(fastify, request.user.userId)
      
      if (!credentials) {
        return reply.status(400).send({ 
          message: 'IGDB API credentials not configured. Please add your IGDB credentials in Settings to search for games.' 
        })
      }

      const igdbService = new IGDBService(credentials.clientId, credentials.accessToken)
      const games = await igdbService.searchGames(q.trim(), 20)
      return reply.send(games)
    } catch (error) {
      fastify.log.error(error)
      
      // Check if it's a credentials error
      if (error.message && error.message.includes('credentials not configured')) {
        return reply.status(400).send({ 
          message: error.message 
        })
      }
      
      return reply.status(500).send({ 
        message: 'Failed to search games. Please check your IGDB credentials in Settings.' 
      })
    }
  })

  // Get user's games library
  fastify.get('/user', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userGames = await fastify.prisma.userGame.findMany({
        where: { userId: request.user.userId },
        include: { game: true },
        orderBy: { updatedAt: 'desc' }
      })

      // Transform for frontend with local image URLs where available
      const transformedGames = await Promise.all(userGames.map(async (userGame) => {
        const game = userGame.game;
        
        // Convert image URLs to local URLs where cached
        const [coverUrl, bannerUrl, artworks, screenshots] = await Promise.all([
          imageCacheService.getLocalUrl(game.coverUrl),
          imageCacheService.getLocalUrl(game.bannerUrl),
          imageCacheService.getLocalUrls(game.artworks),
          imageCacheService.getLocalUrls(game.screenshots)
        ]);

        return {
          // UserGame fields
          id: userGame.id, // This is now the userGame ID for updates
          status: reverseStatusMap[userGame.status],
          quick_review: userGame.quickReview ? reverseQuickReviewMap[userGame.quickReview] : null,
          personal_rating: userGame.personalRating,
          user_platform: userGame.userPlatform,
          notes: userGame.notes,
          // Game fields with local URLs
          igdb_id: game.igdbId,
          name: game.name,
          cover_url: coverUrl,
          banner_url: bannerUrl,
          artworks: artworks,
          release_date: game.releaseDate?.toISOString() || null,
          genres: game.genres,
          summary: game.summary,
          platforms: game.platforms,
          developer: game.developer,
          publisher: game.publisher,
          game_engine: game.gameEngine,
          esrb_rating: game.esrbRating,
          website: game.website,
          screenshots: screenshots,
          franchise: game.franchise,
          rating: game.rating,
          total_rating: game.totalRating,
          aggregated_rating: game.aggregatedRating
        };
      }));

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
      const userCredentials = await getUserIGDBCredentials(fastify, request.user.userId)
      
      if (!userCredentials) {
        return reply.status(400).send({ 
          message: 'IGDB API credentials not configured. Please add your IGDB credentials in Settings to get game details.' 
        })
      }

      const igdbService = new IGDBService(userCredentials.clientId, userCredentials.accessToken)
      const gameDetails = await igdbService.getGameById(parseInt(igdbId))
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
      key_art, // Received but not stored (using banner_url instead)
      artworks,
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
      quick_review = null,
      user_platform = null,
      notes = null
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

    // Validate quick_review if provided
    if (quick_review && !quickReviewMap[quick_review]) {
      return reply.status(400).send({ 
        message: 'Invalid quick_review value' 
      })
    }

    try {
      // Get or create the game record first
      let game = await fastify.prisma.game.findUnique({
        where: { igdbId: parseInt(igdb_id) }
      })

      if (!game) {
        game = await fastify.prisma.game.create({
          data: {
            igdbId: parseInt(igdb_id),
            name,
            coverUrl: cover_url || null,
            bannerUrl: banner_url || null,
            artworks: Array.isArray(artworks) ? artworks : [],
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
            aggregatedRating: aggregated_rating ? parseFloat(aggregated_rating) : null
          }
        })

        // Cache all images for this game (unified approach)
        cacheAllMediaImages('game', game).catch((err) => {
          fastify.log.warn('Failed to cache some game images:', err);
        })
      }

      // Check if user already has this game
      const existingUserGame = await fastify.prisma.userGame.findUnique({
        where: {
          userId_gameId: {
            userId: request.user.userId,
            gameId: game.id
          }
        }
      })

      if (existingUserGame) {
        return reply.status(409).send({ 
          message: 'Game already in your library' 
        })
      }

      // Create user-game relationship
      const userGame = await fastify.prisma.userGame.create({
        data: {
          userId: request.user.userId,
          gameId: game.id,
          status: statusMap[status],
          quickReview: quick_review ? quickReviewMap[quick_review] : null,
          userPlatform: user_platform || null,
          notes: notes || null
        },
        include: { game: true }
      })

      // Transform for response
      const responseGame = {
        id: userGame.id,
        status: reverseStatusMap[userGame.status],
        quick_review: userGame.quickReview ? reverseQuickReviewMap[userGame.quickReview] : null,
        personal_rating: userGame.personalRating,
        user_platform: userGame.userPlatform,
        notes: userGame.notes,
        // Game data
        igdb_id: userGame.game.igdbId,
        name: userGame.game.name,
        cover_url: userGame.game.coverUrl,
        banner_url: userGame.game.bannerUrl,
        release_date: userGame.game.releaseDate?.toISOString() || null,
        genres: userGame.game.genres,
        summary: userGame.game.summary,
        platforms: userGame.game.platforms,
        developer: userGame.game.developer,
        publisher: userGame.game.publisher,
        game_engine: userGame.game.gameEngine,
        esrb_rating: userGame.game.esrbRating,
        website: userGame.game.website,
        screenshots: userGame.game.screenshots,
        franchise: userGame.game.franchise,
        rating: userGame.game.rating,
        total_rating: userGame.game.totalRating,
        aggregated_rating: userGame.game.aggregatedRating
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
  fastify.patch('/:userGameId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { userGameId } = request.params
    const { status, personal_rating, notes, quick_review, user_platform } = request.body

    if (!userGameId || isNaN(parseInt(userGameId))) {
      return reply.status(400).send({ 
        message: 'Valid user game ID is required' 
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
      // Check if user game exists and belongs to user
      const existingUserGame = await fastify.prisma.userGame.findFirst({
        where: {
          id: parseInt(userGameId),
          userId: request.user.userId
        },
        include: { game: true }
      })

      if (!existingUserGame) {
        return reply.status(404).send({ 
          message: 'Game not found in your library' 
        })
      }

      // Update user game
      const updatedUserGame = await fastify.prisma.userGame.update({
        where: { id: parseInt(userGameId) },
        data: updateData,
        include: { game: true }
      })

      // Transform for response
      const responseGame = {
        id: updatedUserGame.id,
        status: reverseStatusMap[updatedUserGame.status],
        quick_review: updatedUserGame.quickReview ? reverseQuickReviewMap[updatedUserGame.quickReview] : null,
        personal_rating: updatedUserGame.personalRating,
        user_platform: updatedUserGame.userPlatform,
        notes: updatedUserGame.notes,
        // Game data
        igdb_id: updatedUserGame.game.igdbId,
        name: updatedUserGame.game.name,
        cover_url: updatedUserGame.game.coverUrl,
        banner_url: updatedUserGame.game.bannerUrl,
        release_date: updatedUserGame.game.releaseDate?.toISOString() || null,
        genres: updatedUserGame.game.genres,
        summary: updatedUserGame.game.summary,
        platforms: updatedUserGame.game.platforms,
        developer: updatedUserGame.game.developer,
        publisher: updatedUserGame.game.publisher,
        game_engine: updatedUserGame.game.gameEngine,
        esrb_rating: updatedUserGame.game.esrbRating,
        website: updatedUserGame.game.website,
        screenshots: updatedUserGame.game.screenshots,
        franchise: updatedUserGame.game.franchise,
        rating: updatedUserGame.game.rating,
        total_rating: updatedUserGame.game.totalRating,
        aggregated_rating: updatedUserGame.game.aggregatedRating
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
  fastify.delete('/:userGameId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { userGameId } = request.params

    if (!userGameId || isNaN(parseInt(userGameId))) {
      return reply.status(400).send({ 
        message: 'Valid user game ID is required' 
      })
    }

    try {
      // Check if user game exists and belongs to user, then delete
      const deletedUserGame = await fastify.prisma.userGame.deleteMany({
        where: {
          id: parseInt(userGameId),
          userId: request.user.userId
        }
      })

      if (deletedUserGame.count === 0) {
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

  // Get user statistics
  fastify.get('/stats', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId

      // Get all user games with details
      const userGames = await fastify.prisma.userGame.findMany({
        where: { userId },
        include: { game: true },
        orderBy: { updatedAt: 'desc' }
      })

      // Basic counts
      const totalGames = userGames.length
      const statusCounts = {}
      userGames.forEach(userGame => {
        const status = reverseStatusMap[userGame.status]
        statusCounts[status] = (statusCounts[status] || 0) + 1
      })

      // Genre analysis
      const genreCounts = {}
      userGames.forEach(userGame => {
        if (userGame.game.genres && Array.isArray(userGame.game.genres)) {
          userGame.game.genres.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1
          })
        }
      })

      const topGenres = Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))

      // Monthly activity (games added per month this year)
      const currentYear = new Date().getFullYear()
      const monthlyData = new Array(12).fill(0)
      
      userGames.forEach(userGame => {
        const createdDate = new Date(userGame.createdAt)
        if (createdDate.getFullYear() === currentYear) {
          monthlyData[createdDate.getMonth()]++
        }
      })

      // Platform distribution
      const platformCounts = {}
      userGames.forEach(userGame => {
        if (userGame.userPlatform) {
          platformCounts[userGame.userPlatform] = (platformCounts[userGame.userPlatform] || 0) + 1
        }
      })

      // Quick review distribution
      const reviewCounts = {
        positive: 0,
        neutral: 0,
        negative: 0,
        none: 0
      }
      
      userGames.forEach(userGame => {
        if (userGame.quickReview) {
          const review = reverseQuickReviewMap[userGame.quickReview]
          reviewCounts[review]++
        } else {
          reviewCounts.none++
        }
      })

      // Recent activity (last 20 games)
      const recentActivity = userGames.slice(0, 20).map(userGame => ({
        id: userGame.id,
        gameId: userGame.game.igdbId,
        gameName: userGame.game.name,
        coverUrl: userGame.game.coverUrl,
        status: reverseStatusMap[userGame.status],
        updatedAt: userGame.updatedAt.toISOString(),
        createdAt: userGame.createdAt.toISOString()
      }))

      const stats = {
        totalGames,
        statusDistribution: statusCounts,
        topGenres,
        monthlyData,
        platformDistribution: Object.entries(platformCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, count })),
        reviewDistribution: reviewCounts,
        recentActivity,
        completionRate: totalGames > 0 ? Math.round((statusCounts.completed || 0) / totalGames * 100) : 0,
        averageRating: userGames.length > 0 ? 
          userGames.reduce((sum, game) => sum + (game.personalRating || 0), 0) / userGames.length : 0
      }

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
