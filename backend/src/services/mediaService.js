class MediaService {
  constructor(prisma, logger) {
    this.prisma = prisma
    this.logger = logger
  }

  /**
   * Gets game statistics (extracted from duplicated logic)
   */
  async getGameStatistics(userId) {
    try {
      // Get all user games with details
      const userGames = await this.prisma.userGame.findMany({
        where: { userId },
        include: { game: true },
        orderBy: { updatedAt: 'desc' }
      })

      // Basic counts
      const totalItems = userGames.length
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
          const review = userGame.quickReview.toLowerCase() // Convert enum to lowercase for counting
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
        status: userGame.status,  // Use raw enum value
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
    } catch (error) {
      this.logger.error('MediaService.getGameStatistics error:', error)
      throw error
    }
  }

  /**
   * Gets movie statistics (placeholder for now, will be populated when movies are fully integrated)
   */
  async getMovieStatistics(userId) {
    try {
      // For now, return empty statistics
      // This will be populated with actual movie data when movies are fully integrated

      // Get basic movie count
      const userMovies = await this.prisma.userMovie.findMany({
        where: { userId },
        include: { movie: true },
        orderBy: { updatedAt: 'desc' }
      })

      const totalItems = userMovies.length
      const statusCounts = {}
      userMovies.forEach(userMovie => {
        const status = userMovie.status  // Use raw enum value
        statusCounts[status] = (statusCounts[status] || 0) + 1
      })

      // Genre analysis for movies
      const genreCounts = {}
      userMovies.forEach(userMovie => {
        if (userMovie.movie.genres && Array.isArray(userMovie.movie.genres)) {
          userMovie.movie.genres.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1
          })
        }
      })

      const topGenres = Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([name, count]) => ({
          name,
          count,
          percentage: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0
        }))

      // Basic monthly data
      const currentYear = new Date().getFullYear()
      const monthlyData = new Array(12).fill(0)
      userMovies.forEach(userMovie => {
        const createdDate = new Date(userMovie.createdAt)
        if (createdDate.getFullYear() === currentYear) {
          monthlyData[createdDate.getMonth()]++
        }
      })

      // Recent activity
      const recentActivity = userMovies.slice(0, 20).map(userMovie => ({
        id: userMovie.id,
        itemId: userMovie.movie.tmdbId,
        title: userMovie.movie.name,
        coverUrl: userMovie.movie.coverUrl,
        status: userMovie.status,  // Use raw enum value
        updatedAt: userMovie.updatedAt.toISOString(),
        createdAt: userMovie.createdAt.toISOString()
      }))

      return {
        totalItems,
        statusDistribution: statusCounts,
        topGenres: topGenres,
        monthlyData,
        platformDistribution: [], // Not applicable for movies
        reviewDistribution: { positive: 0, neutral: 0, negative: 0, none: 0 },
        recentActivity,
        completionRate: totalItems > 0 ? Math.round((statusCounts.COMPLETED || 0) / totalItems * 100) : 0,
        averageRating: 0 // Will be calculated from movie ratings
      }
    } catch (error) {
      this.logger.error('MediaService.getMovieStatistics error:', error)
      throw error
    }
  }

  /**
   * Gets placeholder book statistics
   */
  getBookStatistics() {
    return {
      totalItems: 0,
      statusDistribution: {},
      topGenres: [],
      monthlyData: new Array(12).fill(0),
      platformDistribution: [], // Not applicable for books
      reviewDistribution: { positive: 0, neutral: 0, negative: 0, none: 0 },
      recentActivity: [],
      completionRate: 0,
      averageRating: 0
    }
  }

  /**
   * Gets TV show statistics
   */
  async getShowStatistics(userId) {
    try {
      // Get all user shows with details
      const userShows = await this.prisma.userShow.findMany({
        where: { userId },
        include: { show: true },
        orderBy: { updatedAt: 'desc' }
      })

      // Basic counts
      const totalItems = userShows.length
      const statusCounts = {}
      userShows.forEach(userShow => {
        const status = userShow.status  // Use raw enum value
        statusCounts[status] = (statusCounts[status] || 0) + 1
      })

      // Genre analysis
      const genreCounts = {}
      userShows.forEach(userShow => {
        if (userShow.show.genres && Array.isArray(userShow.show.genres)) {
          userShow.show.genres.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1
          })
        }
      })

      const topGenres = Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([genre, count]) => ({ name: genre, count }))

      // Monthly data (shows added over the past 12 months)
      const currentYear = new Date().getFullYear()
      const monthlyData = new Array(12).fill(0)
      
      userShows.forEach(userShow => {
        const showDate = new Date(userShow.createdAt)
        if (showDate.getFullYear() === currentYear) {
          monthlyData[showDate.getMonth()]++
        }
      })

      // Recent activity (last 20 shows)
      const recentActivity = userShows.slice(0, 20).map(userShow => ({
        id: userShow.id,
        itemId: userShow.show.tmdbId,
        title: userShow.show.name,
        coverUrl: userShow.show.coverUrl,
        status: userShow.status,  // Use raw enum value
        updatedAt: userShow.updatedAt.toISOString(),
        createdAt: userShow.createdAt.toISOString()
      }))

      return {
        totalItems,
        statusDistribution: statusCounts,
        topGenres,
        monthlyData,
        recentActivity,
        completionRate: totalItems > 0 ? Math.round((statusCounts.COMPLETED || 0) / totalItems * 100) : 0,
        averageRating: 0 // Will be calculated from show ratings when implemented
      }
    } catch (error) {
      this.logger.error('MediaService.getShowStatistics error:', error)
      throw error
    }
  }

  /**
   * Aggregates unified statistics across all media types
   */
  aggregateUnifiedStats(gameStats, movieStats, showStats, bookStats) {
    const totalItems = gameStats.totalItems + movieStats.totalItems + showStats.totalItems + bookStats.totalItems

    // Combine recent activity from all media types
    const allRecentActivity = [
      ...gameStats.recentActivity.map(item => ({ ...item, mediaType: 'games' })),
      ...movieStats.recentActivity.map(item => ({ ...item, mediaType: 'movies' })),
      ...showStats.recentActivity.map(item => ({ ...item, mediaType: 'shows' })),
      ...bookStats.recentActivity.map(item => ({ ...item, mediaType: 'books' }))
    ]

    // Sort by updatedAt and take last 30, then limit to 20 for better representation
    const recentActivity = allRecentActivity
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 20)

    // Combine monthly data (sum across all media types)
    const monthlyData = gameStats.monthlyData.map((games, index) => 
      games + movieStats.monthlyData[index] + showStats.monthlyData[index] + bookStats.monthlyData[index]
    )

    // Combine top genres from all media types
    const allGenreCounts = {}
    
    // Add genres from games
    gameStats.topGenres.forEach(genre => {
      allGenreCounts[genre.name] = (allGenreCounts[genre.name] || 0) + genre.count
    })
    
    // Add genres from movies
    movieStats.topGenres.forEach(genre => {
      allGenreCounts[genre.name] = (allGenreCounts[genre.name] || 0) + genre.count
    })
    
    // Add genres from shows
    showStats.topGenres.forEach(genre => {
      allGenreCounts[genre.name] = (allGenreCounts[genre.name] || 0) + genre.count
    })
    
    // Add genres from books (when implemented)
    bookStats.topGenres.forEach(genre => {
      allGenreCounts[genre.name] = (allGenreCounts[genre.name] || 0) + genre.count
    })

    // Convert to sorted array and take top 10
    const topGenres = Object.entries(allGenreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0
      }))

    // Determine primary media type
    let primaryMediaType = null
    if (gameStats.totalItems > movieStats.totalItems && gameStats.totalItems > showStats.totalItems && gameStats.totalItems > bookStats.totalItems) {
      primaryMediaType = 'games'
    } else if (movieStats.totalItems > showStats.totalItems && movieStats.totalItems > bookStats.totalItems) {
      primaryMediaType = 'movies'
    } else if (showStats.totalItems > bookStats.totalItems) {
      primaryMediaType = 'shows'
    } else if (bookStats.totalItems > 0) {
      primaryMediaType = 'books'
    }

    return {
      totalItems,
      mediaBreakdown: {
        games: gameStats.totalItems,
        movies: movieStats.totalItems,
        shows: showStats.totalItems,
        books: bookStats.totalItems
      },
      recentActivity,
      monthlyData,
      topGenres,
      primaryMediaType
    }
  }

  /**
   * Gets unified statistics across all media types
   */
  async getUnifiedStatistics(userId, mediaTypeFilter = null) {
    try {
      const gameStats = await this.getGameStatistics(userId)
      const movieStats = await this.getMovieStatistics(userId)
      const showStats = await this.getShowStatistics(userId)
      const bookStats = this.getBookStatistics()

      const stats = {
        games: gameStats,
        movies: movieStats,
        shows: showStats,
        books: bookStats,
        unified: this.aggregateUnifiedStats(gameStats, movieStats, showStats, bookStats)
      }

      // Return specific media type if requested
      if (mediaTypeFilter && stats[mediaTypeFilter]) {
        return {
          mediaType: mediaTypeFilter,
          ...stats[mediaTypeFilter],
          unified: stats.unified
        }
      }

      return stats
    } catch (error) {
      this.logger.error('MediaService.getUnifiedStatistics error:', error)
      throw error
    }
  }
}

export default MediaService
