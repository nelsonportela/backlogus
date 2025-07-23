import axios from 'axios'

class TMDBService {
  constructor(apiKey = null) {
    this.apiKey = apiKey
    this.baseUrl = 'https://api.themoviedb.org/3'
    this.imageBaseUrl = 'https://image.tmdb.org/t/p'
  }

  validateCredentials() {
    if (!this.apiKey) {
      throw new Error('TMDB API credentials not configured. Please add your TMDB API key in Settings to search for movies.')
    }
  }

  async searchMovies(query, limit = 15) {
    this.validateCredentials()

    try {
      const response = await axios.get(`${this.baseUrl}/search/movie`, {
        params: {
          api_key: this.apiKey,
          query: query,
          page: 1
        }
      })

      // Return minimal search results - just what's needed for the search list
      const movies = response.data.results?.slice(0, limit).map(movie => ({
        tmdbId: movie.id,
        name: movie.title || '',
        summary: movie.overview || '',
        release_date: movie.release_date || null,
        cover_url: movie.poster_path ? `${this.imageBaseUrl}/w500${movie.poster_path}` : null,
        rating: movie.vote_average || 0
      })) || []

      return movies
    } catch (error) {
      throw new Error('Failed to search movies: ' + error.message)
    }
  }

  async getMovieById(tmdbId) {
    this.validateCredentials()

    try {
      const response = await axios.get(`${this.baseUrl}/movie/${tmdbId}`, {
        params: {
          api_key: this.apiKey,
          append_to_response: 'credits,videos,release_dates,keywords'
        }
      })

      return this.formatMovieData(response.data)
    } catch (error) {
      throw new Error('Failed to fetch movie details: ' + error.message)
    }
  }

  formatMovieData(movie) {
    try {
      const baseImageUrl = `${this.imageBaseUrl}/w500`
      const smallImageUrl = `${this.imageBaseUrl}/w300`

      if (!movie || !movie.id) {
        throw new Error('Invalid movie object received from TMDB API')
      }

      const formatted = {
        tmdbId: movie.id,
        name: movie.title || '',
        original_title: movie.original_title || '',
        summary: movie.overview || '',
        release_date: movie.release_date || null,
        cover_url: movie.poster_path ? `${baseImageUrl}${movie.poster_path}` : null,
        backdrop_url: movie.backdrop_path ? `${baseImageUrl}${movie.backdrop_path}` : null,
        genres: movie.genres ? movie.genres.map(g => g.name) : [],
        rating: movie.vote_average || 0,
        vote_count: movie.vote_count || 0,
        runtime: movie.runtime || null,
        original_language: movie.original_language || '',
        popularity: movie.popularity || 0,
        budget: movie.budget || 0,
        revenue: movie.revenue || 0,
        homepage: movie.homepage || null,
        imdb_id: movie.imdb_id || null,
        tagline: movie.tagline || null,
        status: movie.status || null
      }

      // Add director and main cast
      if (movie.credits) {
        formatted.director = movie.credits.crew?.find(person => person.job === 'Director')?.name || null
        formatted.cast = movie.credits.cast?.slice(0, 5).map(actor => actor.name) || []
      }

      // Add trailer
      if (movie.videos && movie.videos.results) {
        const trailer = movie.videos.results.find(video => 
          video.type === 'Trailer' && video.site === 'YouTube'
        )
        formatted.trailer_key = trailer?.key || null
      }

      // Add certification/rating
      if (movie.release_dates && movie.release_dates.results) {
        const usRelease = movie.release_dates.results.find(release => release.iso_3166_1 === 'US')
        if (usRelease && usRelease.release_dates && usRelease.release_dates.length > 0) {
          formatted.certification = usRelease.release_dates[0].certification || null
        }
      }

      // Add keywords
      if (movie.keywords && movie.keywords.keywords) {
        formatted.keywords = movie.keywords.keywords.map(keyword => keyword.name)
      }

      return formatted
    } catch (error) {
      throw new Error('Error formatting movie data: ' + error.message)
    }
  }
}

export default TMDBService
