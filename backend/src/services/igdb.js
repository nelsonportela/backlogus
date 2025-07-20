import axios from 'axios'

class IGDBService {
  constructor() {
    this.clientId = process.env.IGDB_CLIENT_ID
    this.accessToken = process.env.IGDB_ACCESS_TOKEN
    this.baseUrl = 'https://api.igdb.com/v4'
  }

  async searchGames(query, limit = 15) {
    try {
      // First try standard search and include remasters field
      const standardResponse = await axios({
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
                 storyline, aggregated_rating, total_rating, artworks.url, remasters, remakes;
          limit ${Math.ceil(limit * 0.7)};
          where category = 0;
        `
      })

      // Collect all games including remasters
      const allGames = []
      const seenIds = new Set()

      // Add standard search results first
      for (const game of standardResponse.data) {
        if (!seenIds.has(game.id)) {
          seenIds.add(game.id)
          allGames.push(this.formatGameData(game))
        }

        // Debug logging
        console.log(`Game: ${game.name}, ID: ${game.id}, Remasters: ${JSON.stringify(game.remasters)}`)

        // If this game has remasters, fetch them too
        if (game.remasters && game.remasters.length > 0) {
          console.log(`Fetching remasters for ${game.name}: ${game.remasters}`)
          try {
            const remastersResponse = await axios({
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
                       storyline, aggregated_rating, total_rating, artworks.url;
                where id = (${game.remasters.join(',')});
              `
            })

            console.log(`Found ${remastersResponse.data.length} remasters`)
            
            // Add remastered versions
            for (const remaster of remastersResponse.data) {
              console.log(`Adding remaster: ${remaster.name}`)
              if (!seenIds.has(remaster.id)) {
                seenIds.add(remaster.id)
                allGames.push(this.formatGameData(remaster))
              }
            }
          } catch (remasterError) {
            console.warn('Failed to fetch remasters:', remasterError.message)
          }
        }
      }

      // Then try a broader name-based search to catch any other variations
      try {
        const broaderResponse = await axios({
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
                   storyline, aggregated_rating, total_rating, artworks.url;
            where name ~ *"${query}"* & category = 0;
            limit ${Math.ceil(limit * 0.4)};
          `
        })

        // Add broader search results
        for (const game of broaderResponse.data) {
          if (!seenIds.has(game.id)) {
            seenIds.add(game.id)
            allGames.push(this.formatGameData(game))
          }
        }
      } catch (broaderError) {
        console.warn('Broader search failed:', broaderError.message)
      }

      return allGames.slice(0, limit)
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
