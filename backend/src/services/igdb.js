import axios from 'axios'

class IGDBService {
  constructor(clientId = null, accessToken = null) {
    this.clientId = clientId
    this.accessToken = accessToken
    this.baseUrl = 'https://api.igdb.com/v4'
  }

  async searchGames(query, limit = 15) {
    if (!this.clientId || !this.accessToken) {
      throw new Error('IGDB credentials not configured. Please add your IGDB API credentials in Settings.')
    }

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
                storyline, aggregated_rating, total_rating, artworks.url, artworks.width, artworks.height;
          limit ${limit};
          where category = (0,1,2,3,4,5,8,9,10,11);
        `
      })

      return response.data.map(game => this.formatGameData(game))
    } catch (error) {
      const errorMessage = error.response?.data || error.message
      throw new Error(`Failed to search games: ${errorMessage}`)
    }
  }

  async getGameById(gameId) {
    if (!this.clientId || !this.accessToken) {
      throw new Error('IGDB credentials not configured. Please add your IGDB API credentials in Settings.')
    }

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
                 storyline, aggregated_rating, total_rating, franchise.name, collection.name, artworks.url, artworks.width, artworks.height;
          where id = ${gameId};
        `
      })

      const game = response.data[0]
      if (!game) {
        throw new Error('Game not found')
      }

      return this.formatGameData(game)
    } catch (error) {
      const errorMessage = error.response?.data || error.message
      throw new Error(`Failed to get game details: ${errorMessage}`)
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

    // Format artworks and select best key art
    const artworks = game.artworks?.map(a => ({
      url: `https:${a.url.replace('t_thumb', 't_1080p')}`,
      width: a.width || 0,
      height: a.height || 0,
      aspectRatio: a.width && a.height ? a.width / a.height : 1
    })) || []
    
    // Select key art with preference for landscape orientation (key art is usually wide)
    let keyArt = null
    if (artworks.length > 0) {
      // Prefer landscape artworks (aspect ratio > 1.2) as they work better as banners
      const landscapeArt = artworks.find(art => art.aspectRatio > 1.2)
      keyArt = landscapeArt || artworks[0] // Fallback to first artwork
    }
    
    // Create banner_url with improved fallback strategy:
    // 1. Key art (landscape artwork preferred)
    // 2. First screenshot as banner (if available) 
    // 3. Cover image as banner (if available)
    let banner_url = null
    if (keyArt) {
      banner_url = keyArt.url
    } else if (game.screenshots?.length > 0) {
      banner_url = `https:${game.screenshots[0].url.replace('t_thumb', 't_1080p')}`
    } else if (game.cover?.url) {
      // Use cover as banner fallback, but with a larger size
      banner_url = `https:${game.cover.url.replace('t_thumb', 't_1080p')}`
    }

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
      artworks: artworks.map(a => a.url), // All artworks as URLs
      key_art: keyArt?.url || null, // Best key art specifically
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

export default IGDBService
