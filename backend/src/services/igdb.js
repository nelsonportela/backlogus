import axios from 'axios'

class IGDBService {
  constructor() {
    this.clientId = process.env.IGDB_CLIENT_ID
    this.accessToken = process.env.IGDB_ACCESS_TOKEN
    this.baseUrl = 'https://api.igdb.com/v4'
  }

  async searchGames(query, limit = 10) {
    try {
      const response = await axios({
        url: `${this.baseUrl}/games`,
        method: 'POST',
        headers: {
          'Client-ID': this.clientId,
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'text/plain'
        },
        data: `
          search "${query}";
          fields name, cover.url, first_release_date, genres.name, summary, rating, 
                 platforms.name, involved_companies.company.name, involved_companies.developer, 
                 involved_companies.publisher, screenshots.url, game_engines.name, 
                 age_ratings.rating, age_ratings.category, websites.url, websites.category,
                 storyline, aggregated_rating, total_rating, artworks.url;
          limit ${limit};
          where category = 0 & version_parent = null;
        `
      })

      return response.data.map(game => this.formatGameData(game))
    } catch (error) {
      console.error('IGDB API Error:', error.response?.data || error.message)
      throw new Error('Failed to search games')
    }
  }

  async getGameById(gameId) {
    try {
      const response = await axios({
        url: `${this.baseUrl}/games`,
        method: 'POST',
        headers: {
          'Client-ID': this.clientId,
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'text/plain'
        },
        data: `
          fields name, cover.url, first_release_date, genres.name, summary, rating,
                 platforms.name, involved_companies.company.name, involved_companies.developer, 
                 involved_companies.publisher, screenshots.url, game_engines.name, 
                 age_ratings.rating, age_ratings.category, websites.url, websites.category,
                 storyline, aggregated_rating, total_rating, franchise.name, collection.name, artworks.url;
          where id = ${gameId};
        `
      })

      const game = response.data[0]
      if (!game) {
        throw new Error('Game not found')
      }

      return this.formatGameData(game)
    } catch (error) {
      console.error('IGDB API Error:', error.response?.data || error.message)
      throw new Error('Failed to get game details')
    }
  }

  formatGameData(game) {
    // Extract developers and publishers from involved_companies
    const developers = game.involved_companies?.filter(ic => ic.developer)?.map(ic => ic.company.name) || []
    const publishers = game.involved_companies?.filter(ic => ic.publisher)?.map(ic => ic.company.name) || []
    
    // Extract age rating (prefer ESRB if available)
    let ageRating = null
    if (game.age_ratings) {
      const esrbRating = game.age_ratings.find(ar => ar.category === 1) // ESRB
      const pegiRating = game.age_ratings.find(ar => ar.category === 2) // PEGI
      ageRating = esrbRating?.rating || pegiRating?.rating || game.age_ratings[0]?.rating
    }

    // Extract official website
    const officialWebsite = game.websites?.find(w => w.category === 1)?.url || null

    // Format screenshots
    const screenshots = game.screenshots?.map(s => `https:${s.url.replace('t_thumb', 't_screenshot_big')}`) || []

    // Format artworks for banner (use first artwork if available)
    const artworks = game.artworks?.map(a => `https:${a.url.replace('t_thumb', 't_1080p')}`) || []
    const banner_url = artworks.length > 0 ? artworks[0] : null

    return {
      id: game.id,
      name: game.name,
      cover_url: game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : null,
      banner_url: banner_url,
      release_date: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString() : null,
      genres: game.genres?.map(g => g.name) || [],
      summary: game.summary || game.storyline || '',
      rating: game.rating || game.total_rating || game.aggregated_rating || null,
      platforms: game.platforms?.map(p => p.name) || [],
      developer: developers.length > 0 ? developers[0] : null,
      publisher: publishers.length > 0 ? publishers[0] : null,
      game_engine: game.game_engines?.length > 0 ? game.game_engines[0].name : null,
      esrb_rating: this.formatAgeRating(ageRating),
      website: officialWebsite,
      screenshots: screenshots,
      franchise: game.franchise?.name || game.collection?.name || null
    }
  }

  formatAgeRating(rating) {
    if (!rating) return null
    
    // ESRB ratings mapping
    const esrbRatings = {
      6: 'RP', // Rating Pending
      7: 'EC', // Early Childhood
      8: 'E',  // Everyone
      9: 'E10+', // Everyone 10+
      10: 'T', // Teen
      11: 'M', // Mature
      12: 'AO' // Adults Only
    }
    
    return esrbRatings[rating] || `Rating ${rating}`
  }
}

export default new IGDBService()
