import TMDBService from './tmdb.js'
import imageCacheService from './imageCache.js'

class ShowService {
  constructor(prisma, logger) {
    this.prisma = prisma
    this.logger = logger
  }

  /**
   * Get or create a show record with fresh detailed data from TMDB
   */
  async getOrCreateShow(tmdbId, tmdbService) {
    try {
      // Always fetch fresh detailed data from TMDB
      const showData = await tmdbService.getShowById(tmdbId)
      
      // Check if show exists in database
      const existingShow = await this.prisma.show.findUnique({
        where: { tmdbId: parseInt(tmdbId) }
      })

      if (existingShow) {
        // Update existing show with fresh data
        return await this.prisma.show.update({
          where: { tmdbId: parseInt(tmdbId) },
          data: {
            name: showData.name,
            originalName: showData.original_name,
            coverUrl: showData.cover_url,
            backdropUrl: showData.backdrop_url,
            firstAirDate: showData.first_air_date ? new Date(showData.first_air_date) : null,
            lastAirDate: showData.last_air_date ? new Date(showData.last_air_date) : null,
            genres: showData.genres || [],
            summary: showData.summary,
            networks: showData.networks || [],
            creators: showData.creators || [],
            cast: showData.cast || [],
            seasons: showData.seasons,
            episodes: showData.episodes,
            episodeRuntime: showData.episode_runtime,
            rating: showData.rating,
            voteCount: showData.vote_count,
            homepage: showData.homepage,
            imdbId: showData.imdb_id,
            tagline: showData.tagline,
            status: showData.status,
            type: showData.type,
            originalLanguage: showData.original_language,
            popularity: showData.popularity,
            certification: showData.certification,
            trailerKey: showData.trailer_key,
            updatedAt: new Date()
          }
        })
      } else {
        // Create new show
        return await this.prisma.show.create({
          data: {
            tmdbId: parseInt(tmdbId),
            name: showData.name,
            originalName: showData.original_name,
            coverUrl: showData.cover_url,
            backdropUrl: showData.backdrop_url,
            firstAirDate: showData.first_air_date ? new Date(showData.first_air_date) : null,
            lastAirDate: showData.last_air_date ? new Date(showData.last_air_date) : null,
            genres: showData.genres || [],
            summary: showData.summary,
            networks: showData.networks || [],
            creators: showData.creators || [],
            cast: showData.cast || [],
            seasons: showData.seasons,
            episodes: showData.episodes,
            episodeRuntime: showData.episode_runtime,
            rating: showData.rating,
            voteCount: showData.vote_count,
            homepage: showData.homepage,
            imdbId: showData.imdb_id,
            tagline: showData.tagline,
            status: showData.status,
            type: showData.type,
            originalLanguage: showData.original_language,
            popularity: showData.popularity,
            certification: showData.certification,
            trailerKey: showData.trailer_key
          }
        })
      }
    } catch (error) {
      this.logger.error('ShowService.getOrCreateShow error:', error)
      throw error
    }
  }

  /**
   * Validates the request body for adding a show
   */
  validateAddShowRequest(body) {
    const { tmdb_id, status = 'BACKLOG', quick_review, current_season, current_episode, notes } = body

    if (!tmdb_id) {
      throw new Error('tmdb_id is required')
    }

    // Valid MediaStatus enum values
    const validStatuses = ['ACTIVE', 'PAUSED', 'COMPLETED', 'DROPPED', 'BACKLOG']

    if (status && !validStatuses.includes(status)) {
      throw new Error('Invalid status')
    }

    // Valid QuickReview enum values
    const validQuickReviews = ['POSITIVE', 'NEUTRAL', 'NEGATIVE']

    if (quick_review && !validQuickReviews.includes(quick_review)) {
      throw new Error('Invalid quick_review value')
    }

    return true
  }

  /**
   * Gets the user's TMDB API credentials
   */
  async getUserTMDBCredentials(userId) {
    return await this.prisma.userApiCredential.findFirst({
      where: {
        userId: userId,
        apiProvider: 'tmdb',
        isActive: true
      }
    })
  }

  /**
   * Checks if user already has this show in their library
   */
  async checkExistingUserShow(userId, showId) {
    const existing = await this.prisma.userShow.findUnique({
      where: {
        userId_showId: {
          userId: userId,
          showId: showId
        }
      }
    })

    if (existing) {
      throw new Error('Show is already in your library')
    }
  }

  /**
   * Creates a user-show relationship
   */
  async createUserShow(userId, showId, showData) {
    const { status = 'BACKLOG', quick_review, current_season, current_episode, notes } = showData

    const userShow = await this.prisma.userShow.create({
      data: {
        userId: userId,
        showId: showId,
        status: status,
        quickReview: quick_review || null,
        currentSeason: current_season ? parseInt(current_season) : null,
        currentEpisode: current_episode ? parseInt(current_episode) : null,
        notes: notes || null
      },
      include: { show: true }
    })

    return userShow
  }

  /**
   * Transforms a user show for API response
   */
  async transformUserShowResponse(userShow) {
    // Convert image URLs to local URLs where cached
    const [coverUrl, backdropUrl] = await Promise.all([
      imageCacheService.getLocalUrl(userShow.show.coverUrl),
      imageCacheService.getLocalUrl(userShow.show.backdropUrl)
    ])

    return {
      id: userShow.id,
      status: userShow.status,
      quick_review: userShow.quickReview,
      current_season: userShow.currentSeason,
      current_episode: userShow.currentEpisode,
      notes: userShow.notes,
      // Show data with local URLs
      tmdbId: userShow.show.tmdbId,
      name: userShow.show.name,
      original_name: userShow.show.originalName,
      cover_url: coverUrl,
      backdrop_url: backdropUrl,
      first_air_date: userShow.show.firstAirDate?.toISOString() || null,
      last_air_date: userShow.show.lastAirDate?.toISOString() || null,
      genres: userShow.show.genres,
      summary: userShow.show.summary,
      networks: userShow.show.networks,
      creators: userShow.show.creators,
      cast: userShow.show.cast,
      seasons: userShow.show.seasons,
      episodes: userShow.show.episodes,
      episode_runtime: userShow.show.episodeRuntime,
      rating: userShow.show.rating,
      vote_count: userShow.show.voteCount,
      homepage: userShow.show.homepage,
      imdb_id: userShow.show.imdbId,
      tagline: userShow.show.tagline,
      show_status: userShow.show.status,
      type: userShow.show.type,
      original_language: userShow.show.originalLanguage,
      popularity: userShow.show.popularity,
      certification: userShow.show.certification,
      trailer_key: userShow.show.trailerKey
    }
  }

  /**
   * Main method to add a show to user's library
   */
  async addShowToLibrary(userId, showData) {
    try {
      // Validate request
      this.validateAddShowRequest(showData)

      // Get user's TMDB credentials
      const userCredentials = await this.getUserTMDBCredentials(userId)
      if (!userCredentials || !userCredentials.apiKey) {
        throw new Error('TMDB API credentials not found. Please add your TMDB API key in Settings.')
      }

      // Create TMDB service instance
      const tmdbService = new TMDBService(userCredentials.apiKey)

      // Get or create show record with fresh detailed data
      const show = await this.getOrCreateShow(showData.tmdb_id, tmdbService)

      // Check if user already has this show
      await this.checkExistingUserShow(userId, show.id)

      // Create user-show relationship
      const userShow = await this.createUserShow(userId, show.id, showData)

      // Transform for response
      return await this.transformUserShowResponse(userShow)
    } catch (error) {
      this.logger.error('ShowService.addShowToLibrary error:', error)
      throw error
    }
  }

  /**
   * Search for shows using TMDB
   */
  async searchShows(userId, query) {
    try {
      // Get user's TMDB credentials
      const userCredentials = await this.getUserTMDBCredentials(userId)
      if (!userCredentials || !userCredentials.apiKey) {
        throw new Error('TMDB API credentials not found. Please add your TMDB API key in Settings.')
      }

      // Create TMDB service instance
      const tmdbService = new TMDBService(userCredentials.apiKey)

      // Search shows
      const shows = await tmdbService.searchShows(query)

      return shows
    } catch (error) {
      this.logger.error('ShowService.searchShows error:', error)
      throw error
    }
  }

  /**
   * Gets all shows in user's library
   */
  async getUserLibrary(userId) {
    try {
      const userShows = await this.prisma.userShow.findMany({
        where: { userId },
        include: { show: true },
        orderBy: { updatedAt: 'desc' }
      })

      // Transform for frontend with local image URLs where available
      const transformedShows = await Promise.all(userShows.map(async (userShow) => {
        return await this.transformUserShowResponse(userShow)
      }))

      return transformedShows
    } catch (error) {
      this.logger.error('ShowService.getUserLibrary error:', error)
      throw error
    }
  }

  /**
   * Updates a show in user's library
   */
  async updateUserShow(userId, userShowId, updateData) {
    try {
      // Validate the user show exists and belongs to the user
      const existingUserShow = await this.prisma.userShow.findUnique({
        where: { 
          id: parseInt(userShowId),
          userId: userId
        },
        include: { show: true }
      })

      if (!existingUserShow) {
        throw new Error('Show not found in your library')
      }

      // Prepare update data
      const updateFields = {}

      // Update status if provided
      if (updateData.status) {
        // Valid MediaStatus enum values
        const validStatuses = ['ACTIVE', 'PAUSED', 'COMPLETED', 'DROPPED', 'BACKLOG']
        if (!validStatuses.includes(updateData.status)) {
          throw new Error('Invalid status value')
        }
        updateFields.status = updateData.status
      }

      // Update quick review if provided
      if (updateData.quick_review !== undefined) {
        if (updateData.quick_review) {
          // Valid QuickReview enum values
          const validQuickReviews = ['POSITIVE', 'NEUTRAL', 'NEGATIVE']
          if (!validQuickReviews.includes(updateData.quick_review)) {
            throw new Error('Invalid quick review value')
          }
          updateFields.quickReview = updateData.quick_review
        } else {
          updateFields.quickReview = null
        }
      }

      // Update current season if provided
      if (updateData.current_season !== undefined) {
        updateFields.currentSeason = updateData.current_season ? parseInt(updateData.current_season) : null
      }

      // Update current episode if provided
      if (updateData.current_episode !== undefined) {
        updateFields.currentEpisode = updateData.current_episode ? parseInt(updateData.current_episode) : null
      }

      // Update notes if provided
      if (updateData.notes !== undefined) {
        updateFields.notes = updateData.notes || null
      }

      // Update user platform if provided
      if (updateData.user_platform !== undefined) {
        updateFields.userPlatform = updateData.user_platform || null
      }

      // Perform the update
      const updatedUserShow = await this.prisma.userShow.update({
        where: { id: parseInt(userShowId) },
        data: {
          ...updateFields,
          updatedAt: new Date()
        },
        include: { show: true }
      })

      // Transform for frontend response
      return await this.transformUserShowResponse(updatedUserShow)
    } catch (error) {
      this.logger.error('ShowService.updateUserShow error:', error)
      throw error
    }
  }

  /**
   * Gets show details by TMDB ID for search/preview purposes
   */
  async getShowDetailsByTmdbId(userId, tmdbId) {
    try {
      // Get user's TMDB credentials
      const credentials = await this.getUserTMDBCredentials(userId)
      if (!credentials) {
        throw new Error('TMDB API credentials not found. Please configure your TMDB API key in Settings.')
      }

      // Create TMDB service instance
      const tmdbService = new (await import('./tmdb.js')).default(credentials.apiKey)
      
      // Get show details from TMDB
      const showData = await tmdbService.getShowById(tmdbId)
      
      return showData
    } catch (error) {
      this.logger.error('ShowService.getShowDetailsByTmdbId error:', error)
      throw error
    }
  }

  /**
   * Removes a show from user's library
   */
  async removeShowFromLibrary(userId, userShowId) {
    try {
      // Validate the user show exists and belongs to the user
      const existingUserShow = await this.prisma.userShow.findUnique({
        where: { 
          id: parseInt(userShowId),
          userId: userId
        }
      })

      if (!existingUserShow) {
        throw new Error('Show not found in your library')
      }

      // Delete the user show relationship
      await this.prisma.userShow.delete({
        where: { id: parseInt(userShowId) }
      })

      this.logger.info(`Show removed from library for user ${userId}: ${userShowId}`)
    } catch (error) {
      this.logger.error('ShowService.removeShowFromLibrary error:', error)
      throw error
    }
  }
}

export default ShowService
