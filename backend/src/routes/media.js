// Generic media routes for unified dashboard statistics
// This will serve as the foundation for movies, books, and other media types

async function mediaRoutes(fastify, options) {
  // Get unified statistics across all media types
  fastify.get('/stats', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { mediaType } = request.query // Optional filter: 'games', 'movies', 'books'
    
    try {
      const userId = request.user.userId
      const stats = {}

      // For now, only games are implemented
      // Future: will aggregate stats from games, movies, books, etc.
      
      // Games statistics
      const gameStats = await getGameStats(fastify, userId)
      stats.games = gameStats

      // Placeholder for future media types
      stats.movies = {
        totalItems: 0,
        statusDistribution: {},
        topGenres: [],
        monthlyData: new Array(12).fill(0),
        recentActivity: [],
        completionRate: 0
      }

      stats.books = {
        totalItems: 0,
        statusDistribution: {},
        topGenres: [],
        monthlyData: new Array(12).fill(0),
        recentActivity: [],
        completionRate: 0
      }

      // Unified statistics (all media types combined)
      stats.unified = {
        totalItems: gameStats.totalItems,
        mediaBreakdown: {
          games: gameStats.totalItems,
          movies: 0,
          books: 0
        },
        recentActivity: gameStats.recentActivity.map(activity => ({
          ...activity,
          mediaType: 'game'
        })),
        monthlyData: gameStats.monthlyData,
        // Most active media type
        primaryMediaType: gameStats.totalItems > 0 ? 'games' : null
      }

      // Return specific media type if requested
      if (mediaType && stats[mediaType]) {
        return reply.send({
          mediaType,
          ...stats[mediaType],
          unified: stats.unified
        })
      }

      return reply.send(stats)
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to fetch media statistics' 
      })
    }
  })
}

// Helper function to get game statistics (extracted from games.js)
async function getGameStats(fastify, userId) {
  const statusMap = {
    'WANT_TO_PLAY': 'want_to_play',
    'PLAYING': 'playing',
    'COMPLETED': 'completed',
    'DROPPED': 'dropped'
  }

  const reviewMap = {
    'POSITIVE': 'positive',
    'NEUTRAL': 'neutral',
    'NEGATIVE': 'negative'
  }

  // Get all user games with details
  const userGames = await fastify.prisma.userGame.findMany({
    where: { userId },
    include: { game: true },
    orderBy: { updatedAt: 'desc' }
  })

  // Basic counts
  const totalItems = userGames.length
  const statusCounts = {}
  userGames.forEach(userGame => {
    const status = statusMap[userGame.status]
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

  // Monthly activity (items added per month this year)
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
      const review = reviewMap[userGame.quickReview]
      reviewCounts[review]++
    } else {
      reviewCounts.none++
    }
  })

  // Recent activity (last 20 items)
  const recentActivity = userGames.slice(0, 20).map(userGame => ({
    id: userGame.id,
    itemId: userGame.game.igdbId,
    title: userGame.game.name,
    coverUrl: userGame.game.coverUrl,
    status: statusMap[userGame.status],
    updatedAt: userGame.updatedAt.toISOString(),
    createdAt: userGame.createdAt.toISOString()
  }))

  return {
    totalItems,
    statusDistribution: statusCounts,
    topGenres,
    monthlyData,
    platformDistribution: Object.entries(platformCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })),
    reviewDistribution: reviewCounts,
    recentActivity,
    completionRate: totalItems > 0 ? Math.round((statusCounts.completed || 0) / totalItems * 100) : 0,
    averageRating: userGames.length > 0 ? 
      userGames.reduce((sum, game) => sum + (game.personalRating || 0), 0) / userGames.length : 0
  }
}

export default mediaRoutes
