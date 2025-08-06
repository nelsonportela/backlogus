import MovieService from '../services/movieService.js'

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

    const movieService = new MovieService(fastify.prisma, fastify.log)

    try {
      const movies = await movieService.searchMovies(request.user.userId, q, 20)
      return reply.send(movies)
    } catch (error) {
      if (error.message.includes('credentials not found') || error.message.includes('credentials not configured')) {
        return reply.status(400).send({ 
          message: 'TMDB API credentials not configured. Please add your TMDB API key in Settings to search for movies.' 
        })
      }

      fastify.log.error('Movie search failed:', error)
      return reply.status(500).send({ 
        message: 'Failed to search movies' 
      })
    }
  })

  // Get user's movie library
  fastify.get('/user', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const movieService = new MovieService(fastify.prisma, fastify.log)

    try {
      const formattedMovies = await movieService.getUserLibrary(request.user.userId)
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

    const movieService = new MovieService(fastify.prisma, fastify.log)

    try {
      const movieDetails = await movieService.getMovieDetails(request.user.userId, tmdbId)
      return reply.send(movieDetails)
    } catch (error) {
      if (error.message.includes('credentials not found') || error.message.includes('credentials not configured')) {
        return reply.status(400).send({ 
          message: 'TMDB API credentials not configured. Please add your TMDB API key in Settings to get movie details.' 
        })
      }

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
    const movieService = new MovieService(fastify.prisma, fastify.log)

    try {
      const userMovie = await movieService.addMovieToLibrary(
        request.user.userId, 
        request.body
      )

      const formattedUserMovie = await movieService.transformUserMovieResponse(userMovie)
      return reply.status(201).send(formattedUserMovie)
    } catch (error) {
      if (error.message.includes('credentials not found') || error.message.includes('credentials not configured')) {
        return reply.status(400).send({ 
          message: 'TMDB API credentials not configured. Please add your TMDB API key in Settings.' 
        })
      }

      // Handle validation errors
      if (error.message === 'TMDB ID is required' ||
          error.message === 'Invalid status' ||
          error.message === 'Invalid quick_review value') {
        return reply.status(400).send({ message: error.message })
      }

      if (error.message === 'Movie is already in your library') {
        return reply.status(409).send({ message: error.message })
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
    const movieService = new MovieService(fastify.prisma, fastify.log)

    if (!id || isNaN(parseInt(id))) {
      return reply.status(400).send({ 
        message: 'Valid movie ID is required' 
      })
    }

    try {
      const userMovie = await movieService.updateUserMovie(
        request.user.userId,
        id,
        request.body
      )

      const formattedUserMovie = await movieService.transformUserMovieResponse(userMovie)
      return reply.send(formattedUserMovie)
    } catch (error) {
      // Handle validation errors
      if (error.message === 'Invalid status' ||
          error.message === 'At least one field to update is required') {
        return reply.status(400).send({ message: error.message })
      }

      if (error.message === 'Movie not found in your library') {
        return reply.status(404).send({ message: error.message })
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
    const movieService = new MovieService(fastify.prisma, fastify.log)

    if (!id || isNaN(parseInt(id))) {
      return reply.status(400).send({ 
        message: 'Valid movie ID is required' 
      })
    }

    try {
      await movieService.removeMovieFromLibrary(request.user.userId, id)
      return reply.status(204).send()
    } catch (error) {
      if (error.message === 'Movie not found in your library') {
        return reply.status(404).send({ message: error.message })
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
    const movieService = new MovieService(fastify.prisma, fastify.log)

    try {
      const formattedStats = await movieService.getUserStatistics(request.user.userId)
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
