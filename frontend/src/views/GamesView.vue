<template>
  <div class="space-y-6">
    <!-- Search Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Search Games</h3>
      <div class="flex gap-4">
        <div class="flex-1">
          <input
            type="text"
            v-model="searchQuery"
            @input="debouncedSearch"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Search for games..."
          />
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="mt-4 space-y-2 max-h-96 overflow-y-auto">
        <div
          v-for="game in searchResults"
          :key="game.id"
          class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <div class="flex items-center space-x-4">
            <img
              v-if="game.cover_url"
              :src="game.cover_url"
              :alt="game.name"
              class="w-12 h-16 object-cover rounded"
            />
            <div class="w-12 h-16 bg-gray-200 rounded flex items-center justify-center" v-else>
              <span class="text-gray-400 text-xs">No Image</span>
            </div>
            <div>
              <h4 class="font-medium text-gray-900">{{ game.name }}</h4>
              <p class="text-sm text-gray-500" v-if="game.release_date">
                Released: {{ formatDate(game.release_date) }}
              </p>
              <p class="text-sm text-gray-500" v-if="game.genres">
                {{ game.genres.join(', ') }}
              </p>
            </div>
          </div>
          <button
            @click="addGameToLibrary(game)"
            class="btn-primary text-sm"
            :disabled="isGameInLibrary(game.id)"
          >
            {{ isGameInLibrary(game.id) ? 'Added' : 'Add to Library' }}
          </button>
        </div>
      </div>

      <div v-if="searchQuery && !loading && searchResults.length === 0" class="mt-4 text-center text-gray-500">
        No games found for "{{ searchQuery }}"
      </div>

      <div v-if="loading" class="mt-4 text-center text-gray-500">
        Searching...
      </div>
    </div>

    <!-- User Library -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">My Library</h3>
        <button @click="refreshLibrary" class="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      <div v-if="userGames.length === 0" class="text-center text-gray-500 py-8">
        No games in your library yet. Search and add some games!
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="game in userGames"
          :key="game.id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start space-x-4">
            <img
              v-if="game.cover_url"
              :src="game.cover_url"
              :alt="game.name"
              class="w-16 h-20 object-cover rounded"
            />
            <div class="w-16 h-20 bg-gray-200 rounded flex items-center justify-center" v-else>
              <span class="text-gray-400 text-xs">No Image</span>
            </div>
            <div class="flex-1">
              <h4 class="font-medium text-gray-900">{{ game.name }}</h4>
              <p class="text-sm text-gray-500 mb-2" v-if="game.release_date">
                {{ formatDate(game.release_date) }}
              </p>
              <select
                v-model="game.status"
                @change="updateStatus(game.id, game.status)"
                class="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="want_to_play">Want to Play</option>
                <option value="playing">Playing</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useGamesStore } from '@/stores/games'

export default {
  name: 'GamesView',
  setup() {
    const gamesStore = useGamesStore()
    const searchQuery = ref('')
    let searchTimeout = null

    const userGames = computed(() => gamesStore.games)
    const searchResults = computed(() => gamesStore.searchResults)
    const loading = computed(() => gamesStore.loading)

    const debouncedSearch = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        gamesStore.searchGames(searchQuery.value)
      }, 300)
    }

    const addGameToLibrary = async (game) => {
      const result = await gamesStore.addGame({
        igdb_id: game.id,
        name: game.name,
        cover_url: game.cover_url,
        release_date: game.release_date,
        genres: game.genres,
        status: 'want_to_play'
      })

      if (!result.success) {
        alert(result.error)
      }
    }

    const updateStatus = async (gameId, status) => {
      const result = await gamesStore.updateGameStatus(gameId, status)
      if (!result.success) {
        alert(result.error)
      }
    }

    const isGameInLibrary = (igdbId) => {
      return userGames.value.some(game => game.igdb_id === igdbId)
    }

    const refreshLibrary = () => {
      gamesStore.getUserGames()
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown'
      return new Date(dateString).toLocaleDateString()
    }

    onMounted(() => {
      gamesStore.getUserGames()
    })

    return {
      searchQuery,
      userGames,
      searchResults,
      loading,
      debouncedSearch,
      addGameToLibrary,
      updateStatus,
      isGameInLibrary,
      refreshLibrary,
      formatDate
    }
  }
}
</script>
