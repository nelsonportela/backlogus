import { cacheAllMediaImages } from './mediaImageCache.js'
import HardcoverService from './hardcover.js'
import imageCacheService from './imageCache.js'

class BookService {
  constructor(prisma, logger) {
    this.prisma = prisma
    this.logger = logger
  }

  /**
   * Gets user's Hardcover credentials
   */
  async getUserHardcoverCredentials(userId) {
    const credentials = await this.prisma.userApiCredential.findUnique({
      where: {
        userId_apiProvider: {
          userId: userId,
          apiProvider: 'hardcover'
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
   * Search books using Hardcover API
   */
  async searchBooks(userId, query, limit = 20) {
    console.log('here');
    
    try {
      const hardcoverService = new HardcoverService()
      return await hardcoverService.searchBooks(query.trim())

    } catch (error) {
      this.logger.error('Error searching books:', error)
      throw error
    }
  }

  /**
   * Get book details from Hardcover API
   */
  async getBookDetails(userId, hardcoverId) {
    try {
      const hardcoverService = new HardcoverService()
      return await hardcoverService.getBookById(parseInt(hardcoverId))
    } catch (error) {
      this.logger.error('Error getting book details:', error)
      throw error
    }
  }

  /**
   * Get all editions of a book by title from Hardcover API
   */
  async getEditionsByTitle(userId, title) {
    try {
      const hardcoverService = new HardcoverService()
      return await hardcoverService.getEditionsByTitle(title.trim())
    } catch (error) {
      this.logger.error('Error getting book editions:', error)
      throw error
    }
  }

  /**
   * Validates the request body for adding a book to library
   */
  validateAddBookRequest(body) {
    // Handle both camelCase and snake_case field names
    const hardcoverId = body.hardcoverId || body.hardcover_id
    const status = body.status
    const quick_review = body.quick_review

    if (!hardcoverId) {
      throw new Error('Hardcover ID is required')
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
   * Gets or creates a book record in the database from Hardcover data
   */
  async getOrCreateBook(hardcoverId, hardcoverService, optionalBookData = null) {
    // Try to find existing book
    let book = await this.prisma.book.findUnique({
      where: { hardcoverId: parseInt(hardcoverId) }
    })

    if (book) {
      return book
    }

    // Use provided rich data if available, otherwise fetch from API
    let bookData
    if (optionalBookData) {
      bookData = optionalBookData
    } else {
      bookData = await hardcoverService.getBookById(parseInt(hardcoverId))
    }
    
    // Create new book record with comprehensive data
    const formattedData = {
      hardcoverId: parseInt(hardcoverId),
      title: bookData.title || 'Unknown Title',
      subtitle: bookData.subtitle || null,
      alternativeTitles: bookData.alternative_titles || [],
      coverUrl: bookData.cover_url || null,
      releaseDate: bookData.release_date ? new Date(bookData.release_date) : null,
      description: bookData.description || null,
      pages: bookData.pages || null,
      authors: bookData.authors || [],
      series: bookData.series_names && bookData.series_names.length > 0 ? bookData.series_names[0] : null,
      seriesNames: bookData.series_names || [],
      seriesPosition: bookData.series_position || null,
      genres: bookData.genres || [],
      tags: bookData.tags || [],
      moods: bookData.moods || [],
      averageRating: bookData.rating || null,
      hasAudiobook: bookData.has_audiobook || false,
      hasEbook: bookData.has_ebook || false
    }
    
    book = await this.prisma.book.create({
      data: formattedData
    })

    // Cache the cover image in the background
    if (bookData.cover_url) {
      cacheAllMediaImages([{
        id: book.id,
        type: 'book',
        images: [bookData.cover_url]
      }])
    }

    return book
  }

  /**
   * Add a book to user's library
   */
  async addBookToLibrary(userId, bookData) {
    try {
      // Validate request
      this.validateAddBookRequest(bookData)

      // Extract fields from request body (handle both camelCase and snake_case)
      const hardcoverId = bookData.hardcoverId || bookData.hardcover_id
      const status = bookData.status || 'BACKLOG'

      if (!hardcoverId) {
        throw new Error('Hardcover ID is required')
      }

      // Get or create the book record using the rich data from frontend
      const book = await this.getOrCreateBook(hardcoverId, new HardcoverService(), bookData)

      // Check if user already has this book
      const existingBook = await this.prisma.userBook.findUnique({
        where: {
          userId_bookId: {
            userId: userId,
            bookId: book.id
          }
        }
      })

      if (existingBook) {
        throw new Error('Book already in your library')
      }

      // Create the user-book relationship
      const userBook = await this.prisma.userBook.create({
        data: {
          userId: userId,
          bookId: book.id,
          status: status,
          quickReview: bookData.quick_review || null,
          notes: bookData.notes || null,
          createdAt: new Date()
        },
        include: {
          book: true
        }
      })

      return await this.transformUserBookResponse(userBook)
    } catch (error) {
      this.logger.error('BookService.addBookToLibrary error:', error)
      throw error
    }
  }

  /**
   * Helper method to get book ID by Hardcover ID
   */
  async getBookIdByHardcoverId(hardcoverId) {
    const book = await this.prisma.book.findUnique({
      where: { hardcoverId: parseInt(hardcoverId) },
      select: { id: true }
    })
    return book?.id || null
  }

  /**
   * Update user book
   */
  async updateUserBook(userId, userBookId, body) {
    try {
      // Verify the user book belongs to the user
      const existingUserBook = await this.prisma.userBook.findFirst({
        where: {
          id: userBookId,
          userId: userId
        }
      })

      if (!existingUserBook) {
        throw new Error('Book not found in your library')
      }

      // Validate the update data
      const { status, quick_review, current_page, format, notes, started_date, finished_date } = body

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

      // Update the user book
      const updatedUserBook = await this.prisma.userBook.update({
        where: { id: userBookId },
        data: {
          ...(status && { status }),
          ...(quick_review !== undefined && { quickReview: quick_review }),
          ...(current_page !== undefined && { currentPage: current_page }),
          ...(format !== undefined && { format }),
          ...(notes !== undefined && { notes }),
          ...(started_date !== undefined && { startedDate: started_date ? new Date(started_date) : null }),
          ...(finished_date !== undefined && { finishedDate: finished_date ? new Date(finished_date) : null })
        },
        include: {
          book: true
        }
      })

      return updatedUserBook
    } catch (error) {
      this.logger.error('Error updating user book:', error)
      throw error
    }
  }

  /**
   * Remove book from user's library
   */
  async removeUserBook(userId, userBookId) {
    try {
      // Verify the user book belongs to the user
      const existingUserBook = await this.prisma.userBook.findFirst({
        where: {
          id: userBookId,
          userId: userId
        }
      })

      if (!existingUserBook) {
        throw new Error('Book not found in your library')
      }

      await this.prisma.userBook.delete({
        where: { id: userBookId }
      })

      return true
    } catch (error) {
      this.logger.error('Error removing user book:', error)
      throw error
    }
  }

  /**
   * Gets all books in user's library
   */
  async getUserLibrary(userId) {
    try {
      const userBooks = await this.prisma.userBook.findMany({
        where: { userId },
        include: { book: true },
        orderBy: { updatedAt: 'desc' }
      })

      // Transform for frontend with local image URLs where available
      const transformedBooks = await Promise.all(userBooks.map(async (userBook) => {
        return await this.transformUserBookResponse(userBook)
      }))

      return transformedBooks
    } catch (error) {
      this.logger.error('BookService.getUserLibrary error:', error)
      throw error
    }
  }

  /**
   * Get book by ID
   */
  async getBookById(userId, bookId) {
    try {
      const book = await this.prisma.book.findUnique({
        where: { id: bookId },
        include: {
          userBooks: {
            where: { userId: userId }
          }
        }
      })

      if (!book) {
        throw new Error('Book not found')
      }

      return this.transformBookResponse(book, book.userBooks[0] || null)
    } catch (error) {
      this.logger.error('Error getting book by ID:', error)
      throw error
    }
  }

  /**
   * Transform user book response to camelCase for frontend
   */
  async transformUserBookResponse(userBook) {
    const book = userBook.book

    return {
      // UserBook fields
      id: userBook.id,
      status: userBook.status,
      quick_review: userBook.quickReview,
      current_page: userBook.currentPage,
      format: userBook.format,
      notes: userBook.notes,
      started_date: userBook.startedDate,
      finished_date: userBook.finishedDate,
      created_at: userBook.createdAt,
      updated_at: userBook.updatedAt,
      // Book fields (flattened)
      hardcover_id: book.hardcoverId,
      title: book.title,
      name: book.title, // Add 'name' field for MediaLibraryItem compatibility
      subtitle: book.subtitle,
      alternative_titles: book.alternativeTitles,
      cover_url: book.coverUrl ? await imageCacheService.getLocalUrl(book.coverUrl) : null,
      release_date: book.releaseDate,
      description: book.description,
      pages: book.pages,
      authors: book.authors,
      series: book.series,
      series_names: book.seriesNames,
      series_position: book.seriesPosition,
      genres: book.genres,
      tags: book.tags,
      moods: book.moods,
      average_rating: book.averageRating,
      has_audiobook: book.hasAudiobook,
      has_ebook: book.hasEbook
    }
  }

  /**
   * Transform book response to camelCase for frontend
   */
  transformBookResponse(book, userBook = null) {
    return {
      id: book.id,
      hardcoverId: book.hardcoverId,
      title: book.title,
      subtitle: book.subtitle,
      alternativeTitles: book.alternativeTitles,
      coverUrl: book.coverUrl ? imageCacheService.getCachedUrl(book.coverUrl) : null,
      releaseDate: book.releaseDate,
      description: book.description,
      pages: book.pages,
      authors: book.authors,
      series: book.series,
      seriesNames: book.seriesNames,
      seriesPosition: book.seriesPosition,
      genres: book.genres,
      tags: book.tags,
      moods: book.moods,
      averageRating: book.averageRating,
      hasAudiobook: book.hasAudiobook,
      hasEbook: book.hasEbook,
      userBook: userBook ? {
        id: userBook.id,
        status: userBook.status,
        quickReview: userBook.quickReview,
        currentPage: userBook.currentPage,
        format: userBook.format,
        notes: userBook.notes,
        startedDate: userBook.startedDate,
        finishedDate: userBook.finishedDate,
        createdAt: userBook.createdAt,
        updatedAt: userBook.updatedAt
      } : null
    }
  }

}

export default BookService
