import imageCacheService from '../services/imageCache.js';

async function cacheRoutes(fastify, options) {
  // Get image cache statistics
  fastify.get('/stats', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const stats = await imageCacheService.getCacheStats();
      return reply.send(stats);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Failed to get cache statistics' });
    }
  });
}

export default cacheRoutes;
