import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useGamesStore = defineStore('games', () => {
  const games = ref([])
  const searchResults = ref([])
  const loading = ref(false)

  const searchGames = async (query) => {
    if (!query.trim()) {
      searchResults.value = []
      return
    }

    loading.value = true
    try {
      const response = await axios.get(`/api/games/search?q=${encodeURIComponent(query)}`)
      searchResults.value = response.data
    } catch (error) {
      console.error('Error searching games:', error)
      searchResults.value = []
    } finally {
      loading.value = false
    }
  }

  const getUserGames = async () => {
    loading.value = true
    try {
      const response = await axios.get('/api/games/user')
      games.value = response.data
    } catch (error) {
      console.error('Error fetching user games:', error)
    } finally {
      loading.value = false
    }
  }

  const addGame = async (gameData) => {
    try {
      const response = await axios.post('/api/games', gameData)
      games.value.push(response.data)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add game'
      }
    }
  }

  const updateGameStatus = async (gameId, status) => {
    try {
      const response = await axios.patch(`/api/games/${gameId}`, { status })
      const index = games.value.findIndex(g => g.id === gameId)
      if (index !== -1) {
        games.value[index] = response.data
      }
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update game status'
      }
    }
  }

  return {
    games,
    searchResults,
    loading,
    searchGames,
    getUserGames,
    addGame,
    updateGameStatus
  }
})
