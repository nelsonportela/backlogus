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

  async searchShows(query, limit = 15) {
    this.validateCredentials()

    try {
      const response = await axios.get(`${this.baseUrl}/search/tv`, {
        params: {
          api_key: this.apiKey,
          query: query,
          page: 1
        }
      })

      // Return minimal search results - just what's needed for the search list
      const shows = response.data.results?.slice(0, limit).map(show => ({
        tmdbId: show.id,
        name: show.name || '',
        summary: show.overview || '',
        first_air_date: show.first_air_date || null,
        cover_url: show.poster_path ? `${this.imageBaseUrl}/w500${show.poster_path}` : null,
        rating: show.vote_average || 0,
        // Additional TV show specific info for search results
        seasons: show.number_of_seasons || null,
        episodes: show.number_of_episodes || null,
        status: show.status || null // "Ended", "Returning Series", "Cancelled", etc.
      })) || []

      return shows
    } catch (error) {
      throw new Error('Failed to search TV shows: ' + error.message)
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
        backdrop_url: movie.backdrop_path ? `${this.imageBaseUrl}/w1280${movie.backdrop_path}` : null,
        genres: movie.genres?.map(genre => genre.name) || [],
        director: null,
        cast: null,
        runtime: movie.runtime || null,
        rating: movie.vote_average || 0,
        vote_count: movie.vote_count || 0,
        budget: movie.budget || null,
        revenue: movie.revenue || null,
        homepage: movie.homepage || null,
        imdb_id: movie.imdb_id || null,
        tagline: movie.tagline || null,
        status: movie.status || null,
        original_language: movie.original_language || null,
        popularity: movie.popularity || 0,
        certification: null,
        trailer_key: null
      }

      // Extract director from credits
      if (movie.credits && movie.credits.crew) {
        const director = movie.credits.crew.find(person => person.job === 'Director')
        if (director) {
          formatted.director = director.name
        }
      }

      // Extract cast from credits (limit to top 10)
      if (movie.credits && movie.credits.cast) {
        formatted.cast = movie.credits.cast.slice(0, 10).map(actor => ({
          name: actor.name,
          character: actor.character,
          profile_path: actor.profile_path ? `${smallImageUrl}${actor.profile_path}` : null
        }))
      }

      // Extract certification from release dates
      if (movie.release_dates && movie.release_dates.results) {
        const usRelease = movie.release_dates.results.find(release => release.iso_3166_1 === 'US')
        if (usRelease && usRelease.release_dates && usRelease.release_dates.length > 0) {
          formatted.certification = usRelease.release_dates[0].certification || null
        }
      }

      // Extract trailer key from videos
      if (movie.videos && movie.videos.results) {
        const trailer = movie.videos.results.find(video => 
          video.type === 'Trailer' && 
          video.site === 'YouTube'
        )
        if (trailer) {
          formatted.trailer_key = trailer.key
        }
      }

      return formatted
    } catch (error) {
      console.error('Error formatting movie data:', error)
      throw new Error('Error formatting movie data: ' + error.message)
    }
  }

  async getShowById(tmdbId) {
    this.validateCredentials()

    try {
      const response = await axios.get(`${this.baseUrl}/tv/${tmdbId}`, {
        params: {
          api_key: this.apiKey,
          append_to_response: 'credits,videos,content_ratings,keywords'
        }
      })

      return this.formatShowData(response.data)
    } catch (error) {
      throw new Error('Failed to get TV show details: ' + error.message)
    }
  }

  formatShowData(show) {
    try {
      const formatted = {
        tmdbId: show.id,
        name: show.name || '',
        original_name: show.original_name || '',
        summary: show.overview || '',
        first_air_date: show.first_air_date || null,
        last_air_date: show.last_air_date || null,
        cover_url: show.poster_path ? `${this.imageBaseUrl}/w500${show.poster_path}` : null,
        backdrop_url: show.backdrop_path ? `${this.imageBaseUrl}/w1280${show.backdrop_path}` : null,
        genres: show.genres?.map(genre => genre.name) || [],
        networks: show.networks?.map(network => network.name) || [],
        seasons: show.number_of_seasons || 0,
        episodes: show.number_of_episodes || 0,
        episode_runtime: show.episode_run_time && show.episode_run_time.length > 0 ? show.episode_run_time[0] : null,
        rating: show.vote_average || 0,
        vote_count: show.vote_count || 0,
        original_language: show.original_language || '',
        popularity: show.popularity || 0,
        homepage: show.homepage || null,
        tagline: show.tagline || null,
        status: show.status || null, // "Ended", "Returning Series", "Cancelled"
        type: show.type || null // "Scripted", "Documentary", etc.
      }

      // Add creators
      if (show.created_by && show.created_by.length > 0) {
        formatted.creators = show.created_by.map(creator => creator.name)
      }

      // Add cast from credits (limit to top 10)
      if (show.credits && show.credits.cast) {
        formatted.cast = show.credits.cast.slice(0, 10).map(actor => ({
          name: actor.name,
          character: actor.character,
          profile_path: actor.profile_path ? `${this.imageBaseUrl}/w300${actor.profile_path}` : null
        }))
      }

      // Extract trailer key from videos
      if (show.videos && show.videos.results) {
        const trailer = show.videos.results.find(video => 
          video.type === 'Trailer' && 
          video.site === 'YouTube'
        )
        if (trailer) {
          formatted.trailer_key = trailer.key
        }
      }


      console.log(formatted);
      
      return formatted
    } catch (error) {
      console.error('Error formatting TV show data:', error)
      throw new Error('Error formatting TV show data: ' + error.message)
    }
  }
}

export default TMDBService