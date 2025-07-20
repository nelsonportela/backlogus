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
          fields name, cover.url, first_release_date, genres.name;
          limit ${limit};
          where category = 0 & version_parent = null;
        `
      })

      return response.data.map(game => ({
        id: game.id,
        name: game.name,
        cover_url: game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : null,
        release_date: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString() : null,
        genres: game.genres?.map(g => g.name) || []
      }))
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
          fields name, cover.url, first_release_date, genres.name, summary, rating;
          where id = ${gameId};
        `
      })

      const game = response.data[0]
      if (!game) {
        throw new Error('Game not found')
      }

      return {
        id: game.id,
        name: game.name,
        cover_url: game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : null,
        release_date: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString() : null,
        genres: game.genres?.map(g => g.name) || [],
        summary: game.summary || '',
        rating: game.rating || null
      }
    } catch (error) {
      console.error('IGDB API Error:', error.response?.data || error.message)
      throw new Error('Failed to get game details')
    }
  }
}

export default new IGDBService()
