// Generic media routes for unified dashboard statistics
// This will serve as the foundation for movies, books, and other media types
import MediaService from '../services/mediaService.js'

async function mediaRoutes(fastify, options) {
  // Get unified statistics across all media types
  fastify.get('/stats', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { mediaType } = request.query // Optional filter: 'games', 'movies', 'books'
    const mediaService = new MediaService(fastify.prisma, fastify.log)
    
    try {
      const stats = await mediaService.getUnifiedStatistics(request.user.userId, mediaType)
      return reply.send(stats)
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to fetch media statistics' 
      })
    }
  })
}

export default mediaRoutes
