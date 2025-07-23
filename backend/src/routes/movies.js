import TMDBService from '../services/tmdb.js'

const statusMap = {
  'want_to_watch': 'WANT_TO_WATCH',
  'watching': 'WATCHING', 
  'watched': 'WATCHED',
  'dropped': 'DROPPED'
}

const reverseStatusMap = {
  'WANT_TO_WATCH': 'want_to_watch',
  'WATCHING': 'watching',
  'WATCHED': 'watched', 
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

// Helper function to get user's TMDB credentials
async function getUserTMDBCredentials(fastify, userId) {
  const credentials = await fastify.prisma.userApiCredential.findUnique({
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

async function moviesRoutes(fastify, options) {
  // Search movies via TMDB API
  fastify.get('/search', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { q } = request.query

    if (!q || q.trim().length === 0) {
      return reply.status(400).send({ 
        message: 'Search query is required' 
      })
    }

    try {
      // Get user's TMDB credentials
      const credentials = await getUserTMDBCredentials(fastify, request.user.userId)
      
      if (!credentials) {
        return reply.status(400).send({ 
          message: 'TMDB API credentials not configured. Please add your TMDB API key in Settings to search for movies.' 
        })
      }

      const tmdbService = new TMDBService(credentials.apiKey)
      const movies = await tmdbService.searchMovies(q.trim(), 20)
      
      return reply.send(movies)
    } catch (error) {
      fastify.log.error('Movie search failed:', error)
      
      // Check if it's a credentials error
      if (error.message && error.message.includes('credentials not configured')) {
        return reply.status(400).send({ 
          message: error.message 
        })
      }
      
      return reply.status(500).send({ 
        message: 'Failed to search movies' 
      })
    }
  })

  // Get user's movie library
  fastify.get('/user', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userMovies = await fastify.prisma.userMovie.findMany({
        where: { userId: request.user.userId },
        include: {
          movie: true
        },
        orderBy: { updatedAt: 'desc' }
      })

      const formattedMovies = userMovies.map(userMovie => ({
        id: userMovie.id,
        tmdbId: userMovie.movie.tmdbId,
        name: userMovie.movie.name,
        original_title: userMovie.movie.originalTitle,
        summary: userMovie.movie.summary,
        cover_url: userMovie.movie.coverUrl,
        backdrop_url: userMovie.movie.backdropUrl,
        release_date: userMovie.movie.releaseDate,
        genres: userMovie.movie.genres,
        director: userMovie.movie.director,
        cast: userMovie.movie.cast,
        runtime: userMovie.movie.runtime,
        rating: userMovie.movie.rating,
        vote_count: userMovie.movie.voteCount,
        certification: userMovie.movie.certification,
        trailer_key: userMovie.movie.trailerKey,
        status: reverseStatusMap[userMovie.status],
        personal_rating: userMovie.personalRating,
        quick_review: userMovie.quickReview ? reverseQuickReviewMap[userMovie.quickReview] : null,
        notes: userMovie.notes,
        watched_date: userMovie.watchedDate,
        added_at: userMovie.createdAt,
        updated_at: userMovie.updatedAt
      }))

      return reply.send(formattedMovies)
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to get user movies' 
      })
    }
  })

  // Get detailed movie information by TMDB ID
  fastify.get('/details/:tmdbId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { tmdbId } = request.params

    if (!tmdbId || isNaN(parseInt(tmdbId))) {
      return reply.status(400).send({ 
        message: 'Valid TMDB ID is required' 
      })
    }

    try {
      const userCredentials = await getUserTMDBCredentials(fastify, request.user.userId)
      
      if (!userCredentials) {
        return reply.status(400).send({ 
          message: 'TMDB API credentials not configured. Please add your TMDB API key in Settings to get movie details.' 
        })
      }

      const tmdbService = new TMDBService(userCredentials.apiKey)
      const movieDetails = await tmdbService.getMovieById(parseInt(tmdbId))
      return reply.send(movieDetails)
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to get movie details' 
      })
    }
  })

  // Add movie to user's library
  fastify.post('/', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { 
      tmdbId, 
      status = 'want_to_watch',
      personalRating,
      quickReview,
      notes 
    } = request.body

    if (!tmdbId) {
      return reply.status(400).send({ 
        message: 'TMDB ID is required' 
      })
    }

    const dbStatus = statusMap[status]
    if (!dbStatus) {
      return reply.status(400).send({ 
        message: 'Invalid status' 
      })
    }

    const dbQuickReview = quickReview ? quickReviewMap[quickReview] : null

    try {
      // Get movie details from TMDB to store in our database
      const userCredentials = await getUserTMDBCredentials(fastify, request.user.userId)
      
      if (!userCredentials) {
        return reply.status(400).send({ 
          message: 'TMDB API credentials not configured. Please add your TMDB API key in Settings.' 
        })
      }

      const tmdbService = new TMDBService(userCredentials.apiKey)
      const movieData = await tmdbService.getMovieById(parseInt(tmdbId))

      // Create or update movie in database
      const movie = await fastify.prisma.movie.upsert({
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

      // Create user movie entry
      const userMovie = await fastify.prisma.userMovie.create({
        data: {
          userId: request.user.userId,
          movieId: movie.id,
          status: dbStatus,
          personalRating,
          quickReview: dbQuickReview,
          notes,
          watchedDate: dbStatus === 'WATCHED' ? new Date() : null
        },
        include: {
          movie: true
        }
      })

      const formattedUserMovie = {
        id: userMovie.id,
        tmdbId: userMovie.movie.tmdbId,
        name: userMovie.movie.name,
        original_title: userMovie.movie.originalTitle,
        summary: userMovie.movie.summary,
        cover_url: userMovie.movie.coverUrl,
        backdrop_url: userMovie.movie.backdropUrl,
        release_date: userMovie.movie.releaseDate,
        genres: userMovie.movie.genres,
        director: userMovie.movie.director,
        cast: userMovie.movie.cast,
        runtime: userMovie.movie.runtime,
        rating: userMovie.movie.rating,
        vote_count: userMovie.movie.voteCount,
        certification: userMovie.movie.certification,
        trailer_key: userMovie.movie.trailerKey,
        status: reverseStatusMap[userMovie.status],
        personal_rating: userMovie.personalRating,
        quick_review: userMovie.quickReview ? reverseQuickReviewMap[userMovie.quickReview] : null,
        notes: userMovie.notes,
        watched_date: userMovie.watchedDate,
        added_at: userMovie.createdAt,
        updated_at: userMovie.updatedAt
      }

      return reply.status(201).send(formattedUserMovie)
    } catch (error) {
      if (error.code === 'P2002') {
        return reply.status(409).send({ 
          message: 'Movie is already in your library' 
        })
      }
      
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to add movie to library' 
      })
    }
  })

  // Update movie status, rating, review, or notes
  fastify.patch('/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params
    const { status, personalRating, quickReview, notes } = request.body

    if (!id || isNaN(parseInt(id))) {
      return reply.status(400).send({ 
        message: 'Valid movie ID is required' 
      })
    }

    const updateData = {}

    if (status !== undefined) {
      const dbStatus = statusMap[status]
      if (!dbStatus) {
        return reply.status(400).send({ 
          message: 'Invalid status' 
        })
      }
      updateData.status = dbStatus
      
      // Set watchedDate when status changes to watched
      if (dbStatus === 'WATCHED') {
        updateData.watchedDate = new Date()
      } else if (dbStatus !== 'WATCHED') {
        updateData.watchedDate = null
      }
    }

    if (personalRating !== undefined) {
      updateData.personalRating = personalRating
    }

    if (quickReview !== undefined) {
      updateData.quickReview = quickReview ? quickReviewMap[quickReview] : null
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    try {
      const userMovie = await fastify.prisma.userMovie.update({
        where: { 
          id: parseInt(id),
          userId: request.user.userId 
        },
        data: updateData,
        include: {
          movie: true
        }
      })

      const formattedUserMovie = {
        id: userMovie.id,
        tmdbId: userMovie.movie.tmdbId,
        name: userMovie.movie.name,
        original_title: userMovie.movie.originalTitle,
        summary: userMovie.movie.summary,
        cover_url: userMovie.movie.coverUrl,
        backdrop_url: userMovie.movie.backdropUrl,
        release_date: userMovie.movie.releaseDate,
        genres: userMovie.movie.genres,
        director: userMovie.movie.director,
        cast: userMovie.movie.cast,
        runtime: userMovie.movie.runtime,
        rating: userMovie.movie.rating,
        vote_count: userMovie.movie.voteCount,
        certification: userMovie.movie.certification,
        trailer_key: userMovie.movie.trailerKey,
        status: reverseStatusMap[userMovie.status],
        personal_rating: userMovie.personalRating,
        quick_review: userMovie.quickReview ? reverseQuickReviewMap[userMovie.quickReview] : null,
        notes: userMovie.notes,
        watched_date: userMovie.watchedDate,
        added_at: userMovie.createdAt,
        updated_at: userMovie.updatedAt
      }

      return reply.send(formattedUserMovie)
    } catch (error) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ 
          message: 'Movie not found in your library' 
        })
      }
      
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to update movie' 
      })
    }
  })

  // Remove movie from user's library
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params

    if (!id || isNaN(parseInt(id))) {
      return reply.status(400).send({ 
        message: 'Valid movie ID is required' 
      })
    }

    try {
      await fastify.prisma.userMovie.delete({
        where: { 
          id: parseInt(id),
          userId: request.user.userId 
        }
      })

      return reply.status(204).send()
    } catch (error) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ 
          message: 'Movie not found in your library' 
        })
      }
      
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to remove movie from library' 
      })
    }
  })

  // Get user's movie statistics
  fastify.get('/stats', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const stats = await fastify.prisma.userMovie.groupBy({
        by: ['status'],
        where: { userId: request.user.userId },
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
        const status = reverseStatusMap[stat.status]
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

      return reply.send(formattedStats)
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to get movie statistics' 
      })
    }
  })
}

export default moviesRoutes
