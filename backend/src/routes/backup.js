import BackupService from '../services/backupService.js';

async function backupRoutes(fastify, options) {
  // Handle OPTIONS preflight for backup endpoint
  fastify.options('/backup', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', request.headers.origin || '*');
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    return reply.status(200).send();
  });

  // Create backup
  fastify.get('/backup', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      
      const backupService = new BackupService(fastify.prisma);
      const buffer = await backupService.createBackup(userId);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `backlogus-backup-${timestamp}.zip`;
      
      reply.type('application/zip');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      
      return reply.send(buffer);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Failed to create backup' });
    }
  });

  // Import backup
  fastify.post('/backup/import', {
    preHandler: [fastify.authenticate],
    config: {
      // Increase timeout specifically for backup imports
      requestTimeout: 600000, // 10 minutes
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      
      // Use more efficient streaming for large files
      const data = await request.file({
        limits: {
          fileSize: 500 * 1024 * 1024, // 500MB specifically for this route
        }
      });
      
      if (!data) {
        return reply.status(400).send({ message: 'No backup file provided' });
      }

      // Check file type
      if (!data.filename.endsWith('.zip')) {
        return reply.status(400).send({ message: 'Invalid file type. Please upload a .zip backup file.' });
      }

      const buffer = await data.toBuffer();
      
      fastify.log.info(`Processing backup file: ${data.filename}, size: ${buffer.length} bytes`);
      
      const backupService = new BackupService(fastify.prisma);
      const result = await backupService.importBackup(userId, buffer);
      
      return reply.send(result);
    } catch (error) {
      if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
        return reply.status(413).send({ 
          message: 'Backup file is too large. Maximum size is 500MB.' 
        });
      }
      
      fastify.log.error(error);
      return reply.status(500).send({ 
        message: 'Failed to import backup', 
        error: error.message 
      });
    }
  });
}

export default backupRoutes;
