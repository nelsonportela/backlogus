import { cacheAllMediaImages } from './mediaImageCache.js'
import IGDBService from './igdb.js'
import imageCacheService from './imageCache.js'

class GameService {
  constructor(prisma, logger) {
    this.prisma = prisma
    this.logger = logger
  }

  /**
   * Gets user's IGDB credentials
   */
  async getUserIGDBCredentials(userId) {
    const credentials = await this.prisma.userApiCredential.findUnique({
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

  /**
   * Search games using IGDB API
   */
  async searchGames(userId, query, limit = 20) {
    try {
      const credentials = await this.getUserIGDBCredentials(userId)
      if (!credentials) {
        throw new Error('IGDB credentials not found or inactive')
      }

      const igdbService = new IGDBService(credentials.clientId, credentials.accessToken)
      return await igdbService.searchGames(query.trim(), limit)
    } catch (error) {
      this.logger.error('Error searching games:', error)
      throw error
    }
  }

  /**
   * Get game details from IGDB API
   */
  async getGameDetails(userId, igdbId) {
    try {
      const credentials = await this.getUserIGDBCredentials(userId)
      if (!credentials) {
        throw new Error('IGDB credentials not found or inactive')
      }

      const igdbService = new IGDBService(credentials.clientId, credentials.accessToken)
      return await igdbService.getGameById(parseInt(igdbId))
    } catch (error) {
      this.logger.error('Error getting game details:', error)
      throw error
    }
  }

  /**
   * Validates the request body for adding a game to library
   */
  validateAddGameRequest(body) {
    const { igdb_id, status, quick_review } = body

    if (!igdb_id) {
      throw new Error('IGDB ID is required')
    }

    // Valid MediaStatus enum values
    const validStatuses = ['ACTIVE', 'PAUSED', 'COMPLETED', 'DROPPED', 'BACKLOG']

    if (status && !validStatuses.includes(status)) {
      throw new Error('Invalid status value')
    }

    // Valid QuickReview enum values
    const validQuickReviews = ['POSITIVE', 'NEUTRAL', 'NEGATIVE']

    if (quick_review && !validQuickReviews.includes(quick_review)) {
      throw new Error('Invalid quick_review value')
    }

    return true
  }

  /**
   * Gets or creates a game record in the database
   */
  async getOrCreateGame(igdbId, igdbService) {
    // Always fetch fresh detailed data from IGDB
    const gameData = await igdbService.getGameById(parseInt(igdbId))

    let game = await this.prisma.game.findUnique({
      where: { igdbId: parseInt(igdbId) }
    })

    if (!game) {
      game = await this.prisma.game.create({
        data: {
          igdbId: parseInt(igdbId),
          name: gameData.name,
          coverUrl: gameData.cover_url || null,
          bannerUrl: gameData.banner_url || null,
          artworks: Array.isArray(gameData.artworks) ? gameData.artworks : [],
          releaseDate: gameData.release_date ? new Date(gameData.release_date) : null,
          genres: Array.isArray(gameData.genres) ? gameData.genres : [],
          summary: gameData.summary || null,
          platforms: Array.isArray(gameData.platforms) ? gameData.platforms : [],
          developer: gameData.developer || null,
          publisher: gameData.publisher || null,
          gameEngine: gameData.game_engine || null,
          esrbRating: gameData.esrb_rating || null,
          website: gameData.website || null,
          screenshots: Array.isArray(gameData.screenshots) ? gameData.screenshots : [],
          franchise: gameData.franchise || null,
          rating: gameData.rating ? parseFloat(gameData.rating) : null,
          totalRating: gameData.total_rating ? parseFloat(gameData.total_rating) : null,
          aggregatedRating: gameData.aggregated_rating ? parseFloat(gameData.aggregated_rating) : null
        }
      })

      // Cache all images for this game (fire and forget)
      cacheAllMediaImages('game', game).catch((err) => {
        this.logger.warn('Failed to cache some game images:', err)
      })
    } else {
      // Update existing game with fresh data
      game = await this.prisma.game.update({
        where: { igdbId: parseInt(igdbId) },
        data: {
          name: gameData.name,
          coverUrl: gameData.cover_url || null,
          bannerUrl: gameData.banner_url || null,
          artworks: Array.isArray(gameData.artworks) ? gameData.artworks : [],
          releaseDate: gameData.release_date ? new Date(gameData.release_date) : null,
          genres: Array.isArray(gameData.genres) ? gameData.genres : [],
          summary: gameData.summary || null,
          platforms: Array.isArray(gameData.platforms) ? gameData.platforms : [],
          developer: gameData.developer || null,
          publisher: gameData.publisher || null,
          gameEngine: gameData.game_engine || null,
          esrbRating: gameData.esrb_rating || null,
          website: gameData.website || null,
          screenshots: Array.isArray(gameData.screenshots) ? gameData.screenshots : [],
          franchise: gameData.franchise || null,
          rating: gameData.rating ? parseFloat(gameData.rating) : null,
          totalRating: gameData.total_rating ? parseFloat(gameData.total_rating) : null,
          aggregatedRating: gameData.aggregated_rating ? parseFloat(gameData.aggregated_rating) : null
        }
      })

      // Cache updated images (fire and forget)
      cacheAllMediaImages('game', game).catch((err) => {
        this.logger.warn('Failed to cache some updated game images:', err)
      })
    }

    return game
  }

  /**
   * Checks if a user already has a game in their library
   */
  async checkExistingUserGame(userId, gameId) {
    const existingUserGame = await this.prisma.userGame.findUnique({
      where: {
        userId_gameId: {
          userId: userId,
          gameId: gameId
        }
      }
    })

    if (existingUserGame) {
      throw new Error('Game already in your library')
    }
  }

  /**
   * Creates a user-game relationship
   */
  async createUserGame(userId, gameId, gameData) {
    const { status = 'BACKLOG', quick_review, user_platform, notes } = gameData

    const userGame = await this.prisma.userGame.create({
      data: {
        userId: userId,
        gameId: gameId,
        status: status,
        quickReview: quick_review || null,
        userPlatform: user_platform || null,
        notes: notes || null
      },
      include: { game: true }
    })

    return userGame
  }

  /**
   * Transforms a user game for API response
   */
  transformUserGameResponse(userGame) {
    return {
      id: userGame.id,
      status: userGame.status,
      quick_review: userGame.quickReview,
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
  }

  /**
   * Main method to add a game to user's library
   */
  async addGameToLibrary(userId, gameData) {
    try {
      // Validate request
      this.validateAddGameRequest(gameData)

      // Get user's IGDB credentials
      const userCredentials = await this.getUserIGDBCredentials(userId)
      if (!userCredentials) {
        throw new Error('IGDB credentials not found or inactive')
      }

      // Create IGDB service instance
      const igdbService = new IGDBService(userCredentials.clientId, userCredentials.accessToken)

      // Get or create game record with fresh detailed data
      const game = await this.getOrCreateGame(gameData.igdb_id, igdbService)

      // Check if user already has this game
      await this.checkExistingUserGame(userId, game.id)

      // Create user-game relationship
      const userGame = await this.createUserGame(userId, game.id, gameData)

      // Transform for response
      return this.transformUserGameResponse(userGame)
    } catch (error) {
      this.logger.error('GameService.addGameToLibrary error:', error)
      throw error
    }
  }

  /**
   * Validates the request body for updating a user game
   */
  validateUpdateGameRequest(body) {
    const { status, personal_rating, notes, quick_review, user_platform } = body

    // Valid MediaStatus enum values
    const validStatuses = ['ACTIVE', 'PAUSED', 'COMPLETED', 'DROPPED', 'BACKLOG']
    
    // Valid QuickReview enum values
    const validQuickReviews = ['POSITIVE', 'NEUTRAL', 'NEGATIVE']

    const updateData = {}
    
    if (status) {
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status value')
      }
      updateData.status = status
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
      } else if (!validQuickReviews.includes(quick_review)) {
        throw new Error('Invalid quick review value')
      } else {
        updateData.quickReview = quick_review
      }
    }

    if (user_platform !== undefined) {
      updateData.userPlatform = user_platform || null
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('At least one field to update is required')
    }

    return updateData
  }

  /**
   * Updates a user's game in their library
   */
  async updateUserGame(userId, userGameId, updateData) {
    try {
      // Validate the update data
      const validatedUpdateData = this.validateUpdateGameRequest(updateData)

      // Check if user game exists and belongs to user
      const existingUserGame = await this.prisma.userGame.findFirst({
        where: {
          id: parseInt(userGameId),
          userId: userId
        },
        include: { game: true }
      })

      if (!existingUserGame) {
        throw new Error('Game not found in your library')
      }

      // Update user game
      const updatedUserGame = await this.prisma.userGame.update({
        where: { id: parseInt(userGameId) },
        data: validatedUpdateData,
        include: { game: true }
      })

      // Transform for response
      return this.transformUserGameResponse(updatedUserGame)
    } catch (error) {
      this.logger.error('GameService.updateUserGame error:', error)
      throw error
    }
  }

  /**
   * Gets all games in user's library with image URL transformation
   */
  async getUserLibrary(userId) {
    try {
      const userGames = await this.prisma.userGame.findMany({
        where: { userId },
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
          status: userGame.status,  // Use raw enum value
          quick_review: userGame.quickReview, // Use raw enum value
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

      return transformedGames
    } catch (error) {
      this.logger.error('GameService.getUserLibrary error:', error)
      throw error
    }
  }

  /**
   * Removes a game from user's library
   */
  async removeGameFromLibrary(userId, userGameId) {
    try {
      // Check if user game exists and belongs to user, then delete
      const deletedUserGame = await this.prisma.userGame.deleteMany({
        where: {
          id: parseInt(userGameId),
          userId: userId
        }
      })

      if (deletedUserGame.count === 0) {
        throw new Error('Game not found in your library')
      }

      return { message: 'Game removed from library' }
    } catch (error) {
      this.logger.error('GameService.removeGameFromLibrary error:', error)
      throw error
    }
  }

  /**
   * Gets comprehensive statistics for user's game library
   */
  async getUserStatistics(userId) {
    try {
      // Get all user games with details
      const userGames = await this.prisma.userGame.findMany({
        where: { userId },
        include: { game: true },
        orderBy: { updatedAt: 'desc' }
      })

      // Basic counts
      const totalGames = userGames.length
      const statusCounts = {}
      userGames.forEach(userGame => {
        const status = userGame.status  // Use raw enum value
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
          const review = userGame.quickReview.toLowerCase() // Convert enum to lowercase for counting
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
        status: userGame.status,  // Use raw enum value
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

      return stats
    } catch (error) {
      this.logger.error('GameService.getUserStatistics error:', error)
      throw error
    }
  }
}

export default GameService
