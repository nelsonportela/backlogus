import axios from 'axios'

class HardcoverService {
  constructor() {
    this.baseURL = 'https://api.hardcover.app/v1/graphql';
    this.credentials = null;
  }

  async initialize() {
    if (!this.credentials) {
      this.credentials = await this.getApiCredentials();
    }
  }

  async getApiCredentials() {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      const credentials = await prisma.userApiCredential.findFirst({
        where: {
          apiProvider: 'hardcover',
          isActive: true
        }
      });
      
      if (!credentials) {
        throw new Error('No Hardcover API credentials found');
      }
      
      return {
        apiKey: credentials.apiKey
      };
    } finally {
      await prisma.$disconnect();
    }
  }

  async makeGraphQLRequest(query, variables = {}) {
    await this.initialize();
    
    const requestData = {
      query,
      variables
    };
    
    try {
      const response = await axios.post(this.baseURL, requestData, {
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.errors) {
        throw new Error(`GraphQL Error: ${response.data.errors[0].message}`);
      }

      return response.data.data;
    } catch (error) {
      console.log('Hardcover API Error:', error.message);
      throw error;
    }
  }

  async searchBooks(query) {
    // Proper search query with the correct structure
    const searchQuery = `
      query BookSearch($query: String!) {
        search(
          query: $query
          query_type: "Book"
        ) {
          results
        }
      }
    `;

    const data = await this.makeGraphQLRequest(searchQuery, { query });
    
    if (!data.search?.results?.hits) {
      return [];
    }

    return data.search.results.hits.map(hit => this.formatSearchResult(hit.document));
  }

  formatSearchResult(book) {
    // Parse authors from author_names or contributions
    let authors = [];
    if (book.author_names && Array.isArray(book.author_names)) {
      authors = book.author_names.map(name => ({
        name: name,
        role: 'Author'
      }));
    } else if (book.contributions && Array.isArray(book.contributions)) {
      authors = book.contributions.map(contrib => ({
        name: contrib.author?.name || 'Unknown',
        role: contrib.contribution || 'Author'
      }));
    }

    return {
      hardcoverId: book.id?.toString(),
      alternative_titles: book.alternative_titles || [],
      title: book.title || null,
      authors: authors,
      description: book.description || null,
      series_names: book.series_names || [],
      series_position: book.featured_series_position || null,
      genres: book.genres || [],
      cover_url: book.image?.url || null,
      pages: book.pages || null,
      rating: book.rating || null,
      release_date: book.release_date || book.release_year || null,
      moods: book.moods || [],
      tags: book.tags || [],
      subtitle: book.alternative_titles?.[0] || null,
      has_audiobook: book.has_audiobook || false,
      has_ebook: book.has_ebook || false
    };
  }

  async getBookById(hardcoverId) {
    // Start with basic fields and gradually add more
    const bookQuery = `
      query GetBookDetails($id: Int!) {
        books(where: { id: { _eq: $id } }) {
          id
          title
          subtitle
          description
          pages
          image {
            url
          }
          contributions {
            author {
              name
            }
            contribution
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(bookQuery, { id: parseInt(hardcoverId) });
    
    if (!data.books || data.books.length === 0) {
      throw new Error('Book not found');
    }

    const book = data.books[0];
    return this.formatBookDetails(book);
  }

  formatBookDetails(book) {
    const authors = book.contributions?.map(contrib => ({
      name: contrib.author?.name || 'Unknown',
      role: contrib.contribution || 'Author'
    })) || [];

    return {
      hardcoverId: book.id?.toString(),
      title: book.title || null,
      subtitle: book.subtitle || null,
      alternative_titles: [],
      description: book.description || null,
      cover_url: book.image?.url || null,
      authors: authors,
      pages: book.pages || null,
      // These fields come from search API for richer data
      rating: null,
      release_date: null,
      genres: [],
      tags: [],
      moods: [],
      series_names: [],
      series_position: null,
      has_audiobook: false,
      has_ebook: false
    };
  }

  async getEditionsByTitle(title) {
    // Search for books by title to get different editions
    const searchQuery = `
      query BookEditionsSearch($query: String!) {
        search(
          query: $query
          query_type: "Book"
        ) {
          results
        }
      }
    `;

    const data = await this.makeGraphQLRequest(searchQuery, { query: title });
    
    if (!data.search?.results?.hits) {
      return [];
    }

    // Filter results to only include books with similar titles (different editions)
    const titleLower = title.toLowerCase().trim();
    const filteredResults = data.search.results.hits.filter(hit => {
      const bookTitle = hit.document?.title?.toLowerCase() || '';
      // Include if the title contains the search term or is very similar
      return bookTitle.includes(titleLower) || this.calculateSimilarity(bookTitle, titleLower) > 0.7;
    });

    return filteredResults.map(hit => this.formatSearchResult(hit.document));
  }

  // Helper method to calculate title similarity
  calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  // Levenshtein distance algorithm for string similarity
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

export default HardcoverService