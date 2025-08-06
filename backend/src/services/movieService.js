import { cacheAllMediaImages } from './mediaImageCache.js'
import TMDBService from './tmdb.js'
import imageCacheService from './imageCache.js'

class MovieService {
  constructor(prisma, logger) {
    this.prisma = prisma
    this.logger = logger
  }

  /**
   * Gets user's TMDB credentials
   */
  async getUserTMDBCredentials(userId) {
    const credentials = await this.prisma.userApiCredential.findUnique({
      where: {
        userId_apiProvider: {
          userId: userId,
          apiProvider: 'tmdb'
        }
      }
    })

    if (!credentials || !credentials.isActive) {
      return null
    }

    return {
      apiKey: credentials.apiKey
    }
  }

  /**
   * Search movies using TMDB API
   */
  async searchMovies(userId, query, limit = 20) {
    try {
      const credentials = await this.getUserTMDBCredentials(userId)
      if (!credentials) {
        throw new Error('TMDB credentials not found or inactive')
      }

      const tmdbService = new TMDBService(credentials.apiKey)
      return await tmdbService.searchMovies(query.trim(), limit)
    } catch (error) {
      this.logger.error('Error searching movies:', error)
      throw error
    }
  }

  /**
   * Get movie details from TMDB API
   */
  async getMovieDetails(userId, tmdbId) {
    try {
      const credentials = await this.getUserTMDBCredentials(userId)
      if (!credentials) {
        throw new Error('TMDB credentials not found or inactive')
      }

      const tmdbService = new TMDBService(credentials.apiKey)
      return await tmdbService.getMovieById(parseInt(tmdbId))
    } catch (error) {
      this.logger.error('Error getting movie details:', error)
      throw error
    }
  }

  /**
   * Validates the request body for adding a movie to library
   */
  validateAddMovieRequest(body) {
    const { tmdbId, status, quick_review } = body

    if (!tmdbId) {
      throw new Error('TMDB ID is required')
    }

    const statusMap = {
      'want_to_watch': 'WANT_TO_WATCH',
      'watching': 'WATCHING', 
      'watched': 'WATCHED',
      'dropped': 'DROPPED'
    }

    if (!statusMap[status]) {
      throw new Error('Invalid status')
    }

    const quickReviewMap = {
      'positive': 'POSITIVE',
      'neutral': 'NEUTRAL',
      'negative': 'NEGATIVE'
    }

    if (quick_review && !quickReviewMap[quick_review]) {
      throw new Error('Invalid quick_review value')
    }

    return { statusMap, quickReviewMap }
  }

  /**
   * Gets or creates a movie record in the database from TMDB data
   */
  async getOrCreateMovie(tmdbId, tmdbService) {
    const movieData = await tmdbService.getMovieById(parseInt(tmdbId))

    const movie = await this.prisma.movie.upsert({
      where: { tmdbId: parseInt(tmdbId) },
      update: {
        name: movieData.name,
        originalTitle: movieData.original_title,
        summary: movieData.summary,
        coverUrl: movieData.cover_url,
        backdropUrl: movieData.backdrop_url,
        releaseDate: movieData.release_date ? new Date(movieData.release_date) : null,
        genres: movieData.genres,
        director: movieData.director,
        cast: movieData.cast,
        runtime: movieData.runtime,
        rating: movieData.rating,
        voteCount: movieData.vote_count,
        budget: movieData.budget,
        revenue: movieData.revenue,
        homepage: movieData.homepage,
        imdbId: movieData.imdb_id,
        tagline: movieData.tagline,
        status: movieData.status,
        originalLanguage: movieData.original_language,
        popularity: movieData.popularity,
        certification: movieData.certification,
        trailerKey: movieData.trailer_key
      },
      create: {
        tmdbId: parseInt(tmdbId),
        name: movieData.name,
        originalTitle: movieData.original_title,
        summary: movieData.summary,
        coverUrl: movieData.cover_url,
        backdropUrl: movieData.backdrop_url,
        releaseDate: movieData.release_date ? new Date(movieData.release_date) : null,
        genres: movieData.genres,
        director: movieData.director,
        cast: movieData.cast,
        runtime: movieData.runtime,
        rating: movieData.rating,
        voteCount: movieData.vote_count,
        budget: movieData.budget,
        revenue: movieData.revenue,
        homepage: movieData.homepage,
        imdbId: movieData.imdb_id,
        tagline: movieData.tagline,
        status: movieData.status,
        originalLanguage: movieData.original_language,
        popularity: movieData.popularity,
        certification: movieData.certification,
        trailerKey: movieData.trailer_key
      }
    })

    // Cache all images for this movie (fire and forget)
    cacheAllMediaImages('movie', movieData).catch((err) => {
      this.logger.warn('Failed to cache some movie images:', err)
    })

    return { movie, movieData }
  }

  /**
   * Creates a user-movie relationship
   */
  async createUserMovie(userId, movieId, movieData, statusMap, quickReviewMap) {
    const { status = 'want_to_watch', quick_review, notes } = movieData

    const dbStatus = statusMap[status]
    const dbQuickReview = quick_review ? quickReviewMap[quick_review] : null

    try {
      const userMovie = await this.prisma.userMovie.create({
        data: {
          userId: userId,
          movieId: movieId,
          status: dbStatus,
          quickReview: dbQuickReview,
          notes: notes || null,
        },
        include: {
          movie: true
        }
      })

      return userMovie
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Movie is already in your library')
      }
      throw error
    }
  }

  /**
   * Transforms a user movie for API response
   */
  async transformUserMovieResponse(userMovie) {
    const [coverUrl, backdropUrl] = await Promise.all([
      imageCacheService.getLocalUrl(userMovie.movie.coverUrl),
      imageCacheService.getLocalUrl(userMovie.movie.backdropUrl)
    ]);

    return {
      id: userMovie.id,
      tmdbId: userMovie.movie.tmdbId,
      name: userMovie.movie.name,
      original_title: userMovie.movie.originalTitle,
      summary: userMovie.movie.summary,
      cover_url: coverUrl,
      backdrop_url: backdropUrl,
      release_date: userMovie.movie.releaseDate,
      genres: userMovie.movie.genres,
      director: userMovie.movie.director,
      cast: userMovie.movie.cast,
      runtime: userMovie.movie.runtime,
      rating: userMovie.movie.rating,
      vote_count: userMovie.movie.voteCount,
      certification: userMovie.movie.certification,
      trailer_key: userMovie.movie.trailerKey,
      status: this.reverseStatusMap[userMovie.status],
      quick_review: userMovie.quickReview ? this.reverseQuickReviewMap[userMovie.quickReview] : null,
      notes: userMovie.notes,
      added_at: userMovie.createdAt,
      updated_at: userMovie.updatedAt
    }
  }

  /**
   * Main method to add a movie to user's library
   */
  async addMovieToLibrary(userId, movieData) {
    try {
      // Validate request
      const { statusMap, quickReviewMap } = this.validateAddMovieRequest(movieData)

      // Get user's TMDB credentials
      const userCredentials = await this.getUserTMDBCredentials(userId)
      if (!userCredentials) {
        throw new Error('TMDB credentials not found or inactive')
      }

      // Create TMDB service instance
      const tmdbService = new TMDBService(userCredentials.apiKey)

      // Get or create movie record
      const { movie } = await this.getOrCreateMovie(movieData.tmdbId, tmdbService)

      // Create user-movie relationship
      const userMovie = await this.createUserMovie(userId, movie.id, movieData, statusMap, quickReviewMap)

      return userMovie
    } catch (error) {
      this.logger.error('MovieService.addMovieToLibrary error:', error)
      throw error
    }
  }

  /**
   * Gets all movies in user's library with image URL transformation
   */
  async getUserLibrary(userId) {
    try {
      const userMovies = await this.prisma.userMovie.findMany({
        where: { userId },
        include: {
          movie: true
        },
        orderBy: { updatedAt: 'desc' }
      })

      const formattedMovies = await Promise.all(userMovies.map(async userMovie => {
        return await this.transformUserMovieResponse(userMovie)
      }))

      return formattedMovies
    } catch (error) {
      this.logger.error('MovieService.getUserLibrary error:', error)
      throw error
    }
  }

  /**
   * Validates the request body for updating a user movie
   */
  validateUpdateMovieRequest(body) {
    const { status, quick_review, notes } = body

    const statusMap = {
      'want_to_watch': 'WANT_TO_WATCH',
      'watching': 'WATCHING', 
      'watched': 'WATCHED',
      'dropped': 'DROPPED'
    }

    const quickReviewMap = {
      'positive': 'POSITIVE',
      'neutral': 'NEUTRAL',
      'negative': 'NEGATIVE'
    }

    const updateData = {}

    if (status !== undefined) {
      const dbStatus = statusMap[status]
      if (!dbStatus) {
        throw new Error('Invalid status')
      }
      updateData.status = dbStatus
    }

    if (quick_review !== undefined) {
      updateData.quickReview = quick_review ? quickReviewMap[quick_review] : null
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('At least one field to update is required')
    }

    return updateData
  }

  /**
   * Updates a user's movie in their library
   */
  async updateUserMovie(userId, userMovieId, updateData) {
    try {
      // Validate the update data
      const validatedUpdateData = this.validateUpdateMovieRequest(updateData)

      const userMovie = await this.prisma.userMovie.update({
        where: { 
          id: parseInt(userMovieId),
          userId: userId 
        },
        data: validatedUpdateData,
        include: {
          movie: true
        }
      })

      return userMovie
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Movie not found in your library')
      }
      this.logger.error('MovieService.updateUserMovie error:', error)
      throw error
    }
  }

  /**
   * Removes a movie from user's library
   */
  async removeMovieFromLibrary(userId, userMovieId) {
    try {
      await this.prisma.userMovie.delete({
        where: { 
          id: parseInt(userMovieId),
          userId: userId 
        }
      })

      return { message: 'Movie removed from library' }
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Movie not found in your library')
      }
      this.logger.error('MovieService.removeMovieFromLibrary error:', error)
      throw error
    }
  }

  /**
   * Gets user's movie statistics
   */
  async getUserStatistics(userId) {
    try {
      const stats = await this.prisma.userMovie.groupBy({
        by: ['status'],
        where: { userId },
        _count: {
          status: true
        }
      })

      const formattedStats = {
        total: 0,
        wantToWatch: 0,
        watching: 0,
        watched: 0,
        dropped: 0
      }

      stats.forEach(stat => {
        const status = this.reverseStatusMap[stat.status]
        const count = stat._count.status
        formattedStats.total += count
        
        switch (status) {
          case 'want_to_watch':
            formattedStats.wantToWatch = count
            break
          case 'watching':
            formattedStats.watching = count
            break
          case 'watched':
            formattedStats.watched = count
            break
          case 'dropped':
            formattedStats.dropped = count
            break
        }
      })

      return formattedStats
    } catch (error) {
      this.logger.error('MovieService.getUserStatistics error:', error)
      throw error
    }
  }

  // Getter methods for constants
  get reverseStatusMap() {
    return {
      'WANT_TO_WATCH': 'want_to_watch',
      'WATCHING': 'watching',
      'WATCHED': 'watched', 
      'DROPPED': 'dropped'
    }
  }

  get reverseQuickReviewMap() {
    return {
      'POSITIVE': 'positive',
      'NEUTRAL': 'neutral',
      'NEGATIVE': 'negative'
    }
  }
}

export default MovieService
