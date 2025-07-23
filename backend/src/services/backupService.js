import archiver from 'archiver';
import yauzl from 'yauzl';
import imageCacheService from './imageCache.js';

class BackupService {
  constructor(prisma) {
    this.prisma = prisma;
    this.imageCache = imageCacheService;
  }

  // Helper to convert BigInt to numbers for JSON serialization
  convertBigInts(obj) {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));
  }

  // Get user data and API credentials
  async getUserData(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        apiCredentials: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.convertBigInts(user);
  }

  // Get complete database dump for the user
  async getDatabaseDump(userId) {
    const [userGames, userMovies, games, movies] = await Promise.all([
      this.prisma.userGame.findMany({
        where: { userId },
        include: { game: true }
      }),
      this.prisma.userMovie.findMany({
        where: { userId },
        include: { movie: true }
      }),
      this.prisma.game.findMany({
        where: {
          userGames: {
            some: { userId }
          }
        }
      }),
      this.prisma.movie.findMany({
        where: {
          userMovies: {
            some: { userId }
          }
        }
      })
    ]);

    return this.convertBigInts({
      userGames,
      userMovies,
      games,
      movies,
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        userId: userId,
        totalGames: games.length,
        totalMovies: movies.length,
        totalUserGames: userGames.length,
        totalUserMovies: userMovies.length
      }
    });
  }

  // Create backup ZIP with folder structure
  async createBackup(userId) {
    try {
      // Get all data
      const userData = await this.getUserData(userId);
      const dbDump = await this.getDatabaseDump(userId);
      const cachedImages = await this.imageCache.getAllCachedImages();

      // Create ZIP buffer
      return new Promise((resolve, reject) => {
        const archive = archiver('zip', { zlib: { level: 9 } });
        const chunks = [];

        archive.on('data', (chunk) => chunks.push(chunk));
        archive.on('end', () => resolve(Buffer.concat(chunks)));
        archive.on('error', reject);

        // 1. User data folder
        const userDataContent = {
          profile: {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            avatarUrl: userData.avatarUrl,
            timezone: userData.timezone,
            themePreference: userData.themePreference,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt
            // Note: hashedPassword is NOT included for security reasons
            // During disaster recovery, the user will need to reset their password
          },
          apiCredentials: userData.apiCredentials || []
        };

        archive.append(
          JSON.stringify(userDataContent, null, 2),
          { name: 'user-data/profile-and-credentials.json' }
        );

        // 2. Database dump folder
        archive.append(
          JSON.stringify(dbDump, null, 2),
          { name: 'database/dump.json' }
        );

        // 3. Images folder
        if (cachedImages && cachedImages.length > 0) {
          cachedImages.forEach(image => {
            const buffer = Buffer.from(image.data, 'base64');
            archive.append(buffer, { name: `images/${image.filename}` });
          });
        }

        // 4. Add a README
        const readme = `# BackLogus Backup

Created: ${new Date().toISOString()}
User ID: ${userId}

## Structure:
- user-data/profile-and-credentials.json - User profile and API credentials
- database/dump.json - Complete database dump (games, movies, user library)
- images/ - Cached media images
- README.md - This file

## Restore:
Use the "Import Backup" feature in BackLogus Settings to restore this backup.
All data will be linked to the user performing the restore.
`;

        archive.append(readme, { name: 'README.md' });

        // Finalize the archive
        archive.finalize();
      });

    } catch (error) {
      console.error('Backup creation failed:', error);
      throw error;
    }
  }

  // Parse backup ZIP file
  async parseBackup(buffer) {
    return new Promise((resolve, reject) => {
      yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(new Error('Invalid ZIP file format'));
          return;
        }

        const extractedData = {
          userData: null,
          dbDump: null,
          images: []
        };

        zipfile.readEntry();

        zipfile.on('entry', (entry) => {
          if (/\/$/.test(entry.fileName)) {
            // Directory entry, skip
            zipfile.readEntry();
          } else {
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                reject(err);
                return;
              }

              if (entry.fileName.startsWith('images/')) {
                // Image file
                const chunks = [];
                readStream.on('data', chunk => chunks.push(chunk));
                readStream.on('end', () => {
                  const buffer = Buffer.concat(chunks);
                  const filename = entry.fileName.replace('images/', '');
                  extractedData.images.push({
                    filename,
                    data: buffer.toString('base64'),
                    size: buffer.length
                  });
                  zipfile.readEntry();
                });
              } else {
                // JSON file
                let content = '';
                readStream.on('data', chunk => content += chunk.toString());
                readStream.on('end', () => {
                  try {
                    if (entry.fileName === 'user-data/profile-and-credentials.json') {
                      extractedData.userData = JSON.parse(content);
                    } else if (entry.fileName === 'database/dump.json') {
                      extractedData.dbDump = JSON.parse(content);
                    }
                    zipfile.readEntry();
                  } catch (parseError) {
                    reject(new Error(`Failed to parse ${entry.fileName}: ${parseError.message}`));
                  }
                });
              }
            });
          }
        });

        zipfile.on('end', () => {
          // Validate extracted data
          if (!extractedData.userData || !extractedData.dbDump) {
            reject(new Error('Invalid backup file: missing required data'));
            return;
          }
          resolve(extractedData);
        });

        zipfile.on('error', reject);
      });
    });
  }

  // Import backup
  async importBackup(userId, fileBuffer) {
    try {
      // Parse the backup
      const backupData = await this.parseBackup(fileBuffer);

      // Everything in one transaction to ensure atomicity
      const result = await this.prisma.$transaction(async (prisma) => {
        // Clear existing user data
        await prisma.userGame.deleteMany({ where: { userId } });
        await prisma.userMovie.deleteMany({ where: { userId } });
        await prisma.userApiCredential.deleteMany({ where: { userId } });

        // Update user profile with backup data (optional - only if user wants to restore profile)
        if (backupData.userData.profile) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              firstName: backupData.userData.profile.firstName,
              lastName: backupData.userData.profile.lastName,
              avatarUrl: backupData.userData.profile.avatarUrl,
              timezone: backupData.userData.profile.timezone,
              themePreference: backupData.userData.profile.themePreference
              // Note: email is NOT updated to avoid conflicts
            }
          });
        }

        // Restore API credentials
        if (backupData.userData.apiCredentials) {
          for (const cred of backupData.userData.apiCredentials) {
            await prisma.userApiCredential.create({
              data: {
                ...cred,
                userId: userId,
                id: undefined // Let database generate new ID
              }
            });
          }
        }

        // Restore games first
        const gameIdMapping = new Map();
        if (backupData.dbDump.games) {
          for (const game of backupData.dbDump.games) {
            const { id: oldId, ...gameData } = game;
            
            // Use upsert to handle existing games
            const existingOrNewGame = await prisma.game.upsert({
              where: { igdbId: gameData.igdbId },
              update: {}, // Don't update existing games, just use them
              create: gameData
            });
            
            gameIdMapping.set(oldId, existingOrNewGame.id);
          }
        }

        // Restore movies
        const movieIdMapping = new Map();
        if (backupData.dbDump.movies) {
          for (const movie of backupData.dbDump.movies) {
            const { id: oldId, ...movieData } = movie;
            
            // Use upsert to handle existing movies
            const existingOrNewMovie = await prisma.movie.upsert({
              where: { tmdbId: movieData.tmdbId },
              update: {}, // Don't update existing movies, just use them
              create: movieData
            });
            
            movieIdMapping.set(oldId, existingOrNewMovie.id);
          }
        }

        // Restore user games
        if (backupData.dbDump.userGames) {
          for (const userGame of backupData.dbDump.userGames) {
            const { id, userId: _, gameId, game, ...userGameData } = userGame;
            const newGameId = gameIdMapping.get(gameId);
            if (newGameId) {
              await prisma.userGame.create({
                data: {
                  ...userGameData,
                  userId: userId,
                  gameId: newGameId
                }
              });
            }
          }
        }

        // Restore user movies
        if (backupData.dbDump.userMovies) {
          for (const userMovie of backupData.dbDump.userMovies) {
            const { id, userId: _, movieId, movie, ...userMovieData } = userMovie;
            const newMovieId = movieIdMapping.get(movieId);
            if (newMovieId) {
              await prisma.userMovie.create({
                data: {
                  ...userMovieData,
                  userId: userId,
                  movieId: newMovieId
                }
              });
            }
          }
        }

        // Return summary data for response
        return {
          profile: !!backupData.userData.profile,
          apiCredentials: backupData.userData.apiCredentials?.length || 0,
          games: backupData.dbDump.games?.length || 0,
          movies: backupData.dbDump.movies?.length || 0,
          userGames: backupData.dbDump.userGames?.length || 0,
          userMovies: backupData.dbDump.userMovies?.length || 0,
          images: backupData.images?.length || 0
        };
      }, {
        maxWait: 60000, // 60 seconds max wait time for transaction
        timeout: 300000 // 5 minutes timeout for transaction
      });

      // Only restore images after successful database transaction
      if (backupData.images && backupData.images.length > 0) {
        try {
          await this.imageCache.restoreImages(backupData.images);
        } catch (imageError) {
          console.warn('Image restoration failed, but database restore was successful:', imageError);
          // Continue - database restore was successful, image failure is not critical
        }
      }

      return {
        success: true,
        message: 'Backup imported successfully',
        imported: result
      };

    } catch (error) {
      console.error('Backup import failed:', error);
      throw error;
    }
  }
}

export default BackupService;