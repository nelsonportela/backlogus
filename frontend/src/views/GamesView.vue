<template>
  <div class="space-y-6">
    <!-- Error Message -->
    <div
      v-if="errorMessage"
      class="fixed top-4 right-4 z-[100] max-w-md p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg shadow-lg">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium">{{ errorMessage }}</p>
        <button
          @click="errorMessage = null"
          class="ml-3 text-red-400 hover:text-red-600 dark:text-red-300 dark:hover:text-red-100">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- User Library -->
    <MediaLibrary
      :media-type="'game'"
      :library-items="userGames"
      @refresh-library="refreshLibrary"
      @show-details="showGameDetails"
      @update-status="updateStatus"
      @remove-from-library="removeGameFromLibrary" />

    <!-- Floating Action Button for adding games -->
    <FloatingActionButton
      :media-type="'game'"
      :search-results="searchResults"
      :loading="loading"
      :library-items="userGames"
      @search="handleSearch"
      @add-to-library="addGameToLibrary"
      @show-details="showGameDetails"
      @refresh-library="refreshLibrary" />

    <!-- Media Details Modal -->
    <MediaDetailsModal
      :is-open="showModal"
      :item="selectedGame"
      :media-type="'game'"
      :is-in-library="
        selectedGame
          ? isGameInLibrary(
              selectedGame.igdb_id || selectedGame.igdbId || selectedGame.id
            )
          : false
      "
      :current-status="selectedGame?.status"
      @close="closeModal"
      @add-to-library="addGameToLibraryFromModal"
      @remove-from-library="removeGameFromLibrary"
      @update-item="updateGameItem" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useGamesStore } from "@/stores/games";
import MediaDetailsModal from "@/components/media/MediaDetailsModal.vue";
import MediaLibrary from "@/components/media/MediaLibrary.vue";
import FloatingActionButton from "@/components/ui/FloatingActionButton.vue";

const route = useRoute();
const gamesStore = useGamesStore();

// Modal state
const showModal = ref(false);
const selectedGame = ref(null);

// Error handling
const errorMessage = ref(null);

const showError = (message) => {
  errorMessage.value = message;
  // Auto-clear error after 5 seconds
  setTimeout(() => {
    errorMessage.value = null;
  }, 5000);
};

// Computed properties
const allUserGames = computed(() => gamesStore.items);
const searchResults = computed(() => gamesStore.searchResults);
const loading = computed(() => gamesStore.loading);
const searchError = computed(() => gamesStore.searchError);

// Watch for search errors
watch(searchError, (newError) => {
  if (newError) {
    showError(newError);
  }
});

// Filtered games based on route query
const userGames = computed(() => {
  const statusFilter = route.query.status;

  if (!statusFilter || statusFilter === "all") {
    return allUserGames.value;
  }

  return allUserGames.value.filter((game) => game.status === statusFilter);
});

const handleSearch = (query) => {
  gamesStore.search(query);
};

// Watch route changes to handle status filtering
watch(
  () => route.query.status,
  () => {
    // Filter status changed - no action needed as computed property handles this
  }
);

const showGameDetails = async (game) => {
  // Check if this is a library game or search result
  // Library games have status and igdb_id fields, search results have id (IGDB ID) but no status
  const isLibraryGame =
    Object.prototype.hasOwnProperty.call(game, "status") &&
    Object.prototype.hasOwnProperty.call(game, "igdb_id");

  if (isLibraryGame) {
    // For library games, use the stored data directly - do NOT fetch from IGDB
    selectedGame.value = game;
    showModal.value = true;
  } else {
    // For search results, fetch detailed information from IGDB
    selectedGame.value = game;
    showModal.value = true;

    const igdbId = game.id;
    if (igdbId) {
      const result = await gamesStore.getItemDetails(igdbId);
      if (result.success) {
        // Merge the detailed data with the current game data
        selectedGame.value = {
          ...selectedGame.value,
          ...result.data,
        };
      }
    }
  }
};

const closeModal = () => {
  showModal.value = false;
  selectedGame.value = null;
};

const addGameToLibrary = async (libraryData) => {
  // Handle both old format (just game object) and new format (enhanced data from modal)
  let gameData, status, quickReview, userPlatform, notes;

  if (libraryData.item) {
    // New format from AddToLibraryModal
    gameData = libraryData.item;
    status = libraryData.status;
    quickReview = libraryData.quick_review;
    userPlatform = libraryData.user_platform;
    notes = libraryData.notes;
  } else {
    // Old format - direct game object
    gameData = libraryData;
    status = "want_to_play"; // default status
    quickReview = null;
    userPlatform = null;
    notes = null;
  }

  const result = await gamesStore.addItem({
    igdb_id: gameData.id,
    name: gameData.name,
    cover_url: gameData.cover_url,
    banner_url: gameData.banner_url,
    key_art: gameData.key_art,
    artworks: gameData.artworks,
    release_date: gameData.release_date,
    genres: gameData.genres,
    summary: gameData.summary,
    platforms: gameData.platforms,
    developer: gameData.developer,
    publisher: gameData.publisher,
    game_engine: gameData.game_engine,
    esrb_rating: gameData.esrb_rating,
    website: gameData.website,
    screenshots: gameData.screenshots,
    franchise: gameData.franchise,
    rating: gameData.rating,
    total_rating: gameData.total_rating,
    aggregated_rating: gameData.aggregated_rating,
    status: status,
    quick_review: quickReview,
    user_platform: userPlatform,
    notes: notes,
  });

  if (!result.success) {
    showError(result.error);
  }
};

const addGameToLibraryFromModal = async (game) => {
  await addGameToLibrary(game);
  closeModal();
};

const removeGameFromLibrary = async (game) => {
  // Find the game in library by igdb_id
  const libraryGame = userGames.value.find(
    (g) => g.igdb_id === (game.igdb_id || game.igdbId || game.id)
  );

  if (libraryGame) {
    const result = await gamesStore.removeItem(libraryGame.id);
    if (!result.success) {
      showError(result.error);
    } else {
      closeModal();
    }
  } else {
    showError("Game not found in your library");
  }
};

const updateStatus = async (gameId, status) => {
  const result = await gamesStore.updateItem(gameId, { status });
  if (!result.success) {
    showError(result.error);
  }
};

const updateGameItem = async (gameId, updateData) => {
  // Find the library game by igdb_id
  const libraryGame = userGames.value.find(
    (g) => g.igdb_id === gameId || g.id === gameId
  );

  if (!libraryGame) {
    showError("Game not found in your library");
    return;
  }

  const result = await gamesStore.updateItem(libraryGame.id, updateData);

  if (result.success) {
    // Update local state
    Object.keys(updateData).forEach((key) => {
      libraryGame[key] = updateData[key];
      if (selectedGame.value) {
        selectedGame.value[key] = updateData[key];
      }
    });
  } else {
    showError(result.error);
  }
};

const isGameInLibrary = (gameId) => {
  return userGames.value.some(
    (game) => game.igdb_id === gameId || game.igdbId === gameId
  );
};

const refreshLibrary = () => {
  gamesStore.getUserItems();
};

onMounted(() => {
  gamesStore.getUserItems();
});
</script>
