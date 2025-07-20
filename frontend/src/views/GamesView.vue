<template>
  <div class="space-y-6">
    <!-- Search Section -->
    <MediaSearch
      :media-type="'game'"
      :search-results="searchResults"
      :loading="loading"
      :library-items="userGames"
      @search="handleSearch"
      @add-to-library="addGameToLibrary"
      @show-details="showGameDetails"
    />

    <!-- User Library -->
    <MediaLibrary
      :media-type="'game'"
      :library-items="userGames"
      @refresh-library="refreshLibrary"
      @show-details="showGameDetails"
      @update-status="updateStatus"
      @remove-from-library="removeGameFromLibrary"
      @update-quick-review="updateQuickReview"
    />

    <!-- Media Details Modal -->
    <MediaDetailsModal
      :is-open="showModal"
      :item="selectedGame"
      :media-type="'game'"
      :is-in-library="
        selectedGame
          ? isGameInLibrary(
              selectedGame.igdb_id || selectedGame.igdbId || selectedGame.id,
            )
          : false
      "
      :current-status="selectedGame?.status"
      @close="closeModal"
      @add-to-library="addGameToLibraryFromModal"
      @remove-from-library="removeGameFromLibrary"
      @update-status="updateGameStatusFromModal"
      @update-personal-rating="updatePersonalRating"
      @update-user-platform="updateUserPlatform"
      @update-quick-review="updateQuickReview"
    />
  </div>
</template>

<script setup>
/* global alert, console */
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useGamesStore } from "@/stores/games";
import MediaDetailsModal from "@/components/media/MediaDetailsModal.vue";
import MediaSearch from "@/components/media/MediaSearch.vue";
import MediaLibrary from "@/components/media/MediaLibrary.vue";

const route = useRoute();
const gamesStore = useGamesStore();

// Modal state
const showModal = ref(false);
const selectedGame = ref(null);

// Computed properties
const allUserGames = computed(() => gamesStore.games);
const searchResults = computed(() => gamesStore.searchResults);
const loading = computed(() => gamesStore.loading);

// Filtered games based on route query
const userGames = computed(() => {
  const statusFilter = route.query.status;

  if (!statusFilter || statusFilter === "all") {
    return allUserGames.value;
  }

  return allUserGames.value.filter((game) => game.status === statusFilter);
});

const handleSearch = (query) => {
  gamesStore.searchGames(query);
};

// Watch route changes to handle status filtering
watch(
  () => route.query.status,
  (newStatus) => {
    console.log("Status filter changed to:", newStatus || "all");
  },
);

const showGameDetails = async (game) => {
  // Check if this is a library game (has library-specific fields) or search result
  const isLibraryGame =
    Object.prototype.hasOwnProperty.call(game, "status") &&
    Object.prototype.hasOwnProperty.call(game, "userId");

  if (isLibraryGame) {
    // For library games, use the stored data directly since we now store everything
    selectedGame.value = game;
    showModal.value = true;
  } else {
    // For search results, fetch detailed information from IGDB
    selectedGame.value = game;
    showModal.value = true;

    const igdbId = game.id;
    if (igdbId) {
      const result = await gamesStore.getGameDetails(igdbId);
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

const addGameToLibrary = async (game) => {
  const result = await gamesStore.addGame({
    igdb_id: game.id,
    name: game.name,
    cover_url: game.cover_url,
    release_date: game.release_date,
    genres: game.genres,
    summary: game.summary,
    platforms: game.platforms,
    developer: game.developer,
    publisher: game.publisher,
    game_engine: game.game_engine,
    esrb_rating: game.esrb_rating,
    website: game.website,
    screenshots: game.screenshots,
    franchise: game.franchise,
    rating: game.rating,
    total_rating: game.total_rating,
    aggregated_rating: game.aggregated_rating,
    status: "want_to_play",
  });

  if (!result.success) {
    alert(result.error);
  }
};

const addGameToLibraryFromModal = async (game) => {
  await addGameToLibrary(game);
  closeModal();
};

const removeGameFromLibrary = async (game) => {
  console.log("removeGameFromLibrary called with:", game);
  console.log("Current userGames:", userGames.value);

  // Find the game in library by igdb_id
  const libraryGame = userGames.value.find((g) => {
    const matches = g.igdb_id === (game.igdb_id || game.igdbId || game.id);
    console.log(
      `Checking game ${g.name} (igdb_id: ${g.igdb_id}) against ${game.name || game.title} (igdb_id: ${game.igdb_id || game.igdbId || game.id}): ${matches}`,
    );
    return matches;
  });

  console.log("Found library game:", libraryGame);

  if (libraryGame) {
    console.log("Calling gamesStore.removeGame with ID:", libraryGame.id);
    const result = await gamesStore.removeGame(libraryGame.id);
    console.log("Remove result:", result);
    if (!result.success) {
      alert(result.error);
    } else {
      closeModal();
    }
  } else {
    console.log("Game not found in library!");
    alert("Game not found in your library");
  }
};

const updateStatus = async (gameId, status) => {
  const result = await gamesStore.updateGameStatus(gameId, status);
  if (!result.success) {
    alert(result.error);
  }
};

const updateGameStatusFromModal = async (gameId, status) => {
  // For library games, use the library game ID
  const libraryGame = userGames.value.find(
    (g) => g.igdb_id === gameId || g.id === gameId,
  );
  if (libraryGame) {
    await updateStatus(libraryGame.id, status);
    // Update the selected game status for the modal
    if (selectedGame.value) {
      selectedGame.value.status = status;
    }
  }
};

const updatePersonalRating = async (gameId, rating) => {
  // For library games, use the library game ID
  const libraryGame = userGames.value.find(
    (g) => g.igdb_id === gameId || g.id === gameId,
  );
  if (libraryGame) {
    // This would need to be implemented in the store/backend
    // For now, just update locally
    if (selectedGame.value) {
      selectedGame.value.personal_rating = rating;
    }
  }
};

const updateUserPlatform = async (gameId, platform) => {
  const libraryGame = userGames.value.find(
    (g) => g.igdb_id === gameId || g.id === gameId,
  );
  if (libraryGame) {
    const result = await gamesStore.updateGameDetails(libraryGame.id, {
      user_platform: platform,
    });
    if (result.success) {
      // Update local state
      libraryGame.user_platform = platform;
      if (selectedGame.value) {
        selectedGame.value.user_platform = platform;
      }
    } else {
      alert(result.error);
    }
  }
};

const updateQuickReview = async (gameId, reviewValue) => {
  const libraryGame = userGames.value.find(
    (g) => g.igdb_id === gameId || g.id === gameId,
  );
  if (libraryGame) {
    const result = await gamesStore.updateGameDetails(libraryGame.id, {
      quick_review: reviewValue,
    });
    if (result.success) {
      // Update local state
      libraryGame.quick_review = reviewValue;
      if (selectedGame.value) {
        selectedGame.value.quick_review = reviewValue;
      }
    } else {
      alert(result.error);
    }
  }
};

const isGameInLibrary = (gameId) => {
  return userGames.value.some(
    (game) => game.igdb_id === gameId || game.igdbId === gameId,
  );
};

const refreshLibrary = () => {
  gamesStore.getUserGames();
};

onMounted(() => {
  gamesStore.getUserGames();
});
</script>
