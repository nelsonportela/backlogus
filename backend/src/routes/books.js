import BookService from '../services/bookService.js'

async function booksRoutes(fastify, options) {
  // Search books via Hardcover API
  fastify.get('/search', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { q } = request.query

    if (!q || q.trim().length === 0) {
      return reply.status(400).send({ 
        message: 'Search query is required' 
      })
    }

    const bookService = new BookService(fastify.prisma, fastify.log)

    try {
      const books = await bookService.searchBooks(request.user.userId, q, 20)
      return reply.send(books)
    } catch (error) {
      if (error.message.includes('credentials not found') || error.message.includes('credentials not configured')) {
        return reply.status(400).send({ 
          message: 'Hardcover API credentials not configured. Please add your Hardcover API key in Settings to search for books.' 
        })
      }

      fastify.log.error('Book search failed:', error)
      return reply.status(500).send({ 
        message: 'Failed to search books' 
      })
    }
  })

  // Get user's book library
  fastify.get('/user', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const bookService = new BookService(fastify.prisma, fastify.log)

    try {
      const formattedBooks = await bookService.getUserLibrary(request.user.userId)
      return reply.send(formattedBooks)
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to get user books' 
      })
    }
  })

  // Get detailed book information by Hardcover ID
  fastify.get('/details/:hardcoverId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { hardcoverId } = request.params

    if (!hardcoverId || isNaN(parseInt(hardcoverId))) {
      return reply.status(400).send({ 
        message: 'Valid Hardcover ID is required' 
      })
    }

    const bookService = new BookService(fastify.prisma, fastify.log)

    try {
      const bookDetails = await bookService.getBookDetails(request.user.userId, hardcoverId)
      return reply.send(bookDetails)
    } catch (error) {
      if (error.message.includes('credentials not found') || error.message.includes('credentials not configured')) {
        return reply.status(400).send({ 
          message: 'Hardcover API credentials not configured. Please add your Hardcover API key in Settings to get book details.' 
        })
      }

      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to get book details' 
      })
    }
  })

  // Get all editions of a book by title
  fastify.get('/editions/:title', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { title } = request.params

    if (!title || title.trim().length === 0) {
      return reply.status(400).send({ 
        message: 'Book title is required' 
      })
    }

    const bookService = new BookService(fastify.prisma, fastify.log)

    try {
      const editions = await bookService.getEditionsByTitle(request.user.userId, decodeURIComponent(title))
      return reply.send(editions)
    } catch (error) {
      if (error.message.includes('credentials not found') || error.message.includes('credentials not configured')) {
        return reply.status(400).send({ 
          message: 'Hardcover API credentials not configured. Please add your Hardcover API key in Settings to get book editions.' 
        })
      }

      fastify.log.error('Get editions failed:', error)
      return reply.status(500).send({ 
        message: 'Failed to get book editions' 
      })
    }
  })

  // Add book to user's library
  fastify.post('/', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const bookService = new BookService(fastify.prisma, fastify.log)
    try {
      const userBook = await bookService.addBookToLibrary(
        request.user.userId, 
        request.body
      )

      return reply.status(201).send(userBook)
    } catch (error) {
      if (error.message.includes('credentials not found') || error.message.includes('credentials not configured')) {
        return reply.status(400).send({ 
          message: 'Hardcover API credentials not configured. Please add your Hardcover API key in Settings.' 
        })
      }

      // Handle validation errors
      if (error.message === 'Hardcover ID is required' ||
          error.message === 'Invalid status' ||
          error.message === 'Invalid quick_review value') {
        return reply.status(400).send({ message: error.message })
      }

      if (error.message.includes('already in your library')) {
        return reply.status(409).send({ message: error.message })
      }

      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to add book to library' 
      })
    }
  })

  // Update book in user's library
  fastify.put('/:userBookId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userBookId = parseInt(request.params.userBookId)
    
    if (isNaN(userBookId)) {
      return reply.status(400).send({ 
        message: 'Valid user book ID is required' 
      })
    }

    const bookService = new BookService(fastify.prisma, fastify.log)

    try {
      const updatedUserBook = await bookService.updateUserBook(
        request.user.userId,
        userBookId,
        request.body
      )

      const formattedUserBook = await bookService.transformUserBookResponse(updatedUserBook)
      return reply.send(formattedUserBook)
    } catch (error) {
      if (error.message.includes('not found')) {
        return reply.status(404).send({ 
          message: 'Book not found in your library' 
        })
      }

      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to update book' 
      })
    }
  })

  // Remove book from user's library
  fastify.delete('/:userBookId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userBookId = parseInt(request.params.userBookId)
    
    if (isNaN(userBookId)) {
      return reply.status(400).send({ 
        message: 'Valid user book ID is required' 
      })
    }

    const bookService = new BookService(fastify.prisma, fastify.log)

    try {
      await bookService.removeUserBook(request.user.userId, userBookId)
      return reply.status(204).send()
    } catch (error) {
      if (error.message.includes('not found')) {
        return reply.status(404).send({ 
          message: 'Book not found in your library' 
        })
      }

      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to remove book from library' 
      })
    }
  })

  // Get book by ID (for library items)
  fastify.get('/:bookId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const bookId = parseInt(request.params.bookId)
    
    if (isNaN(bookId)) {
      return reply.status(400).send({ 
        message: 'Valid book ID is required' 
      })
    }

    const bookService = new BookService(fastify.prisma, fastify.log)

    try {
      const book = await bookService.getBookById(request.user.userId, bookId)
      return reply.send(book)
    } catch (error) {
      if (error.message.includes('not found')) {
        return reply.status(404).send({ 
          message: 'Book not found' 
        })
      }

      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to get book' 
      })
    }
  })

  // Refresh existing books with complete data
  fastify.post('/refresh', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const bookService = new BookService(fastify.prisma, fastify.log)

    try {
      const result = await bookService.refreshExistingBooks()
      return reply.send({ message: `Refreshed ${result.updated} books` })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ 
        message: 'Failed to refresh books' 
      })
    }
  })
}

export default booksRoutes
