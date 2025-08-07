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
      :media-type="'show'"
      :library-items="userShows"
      @refresh-library="refreshLibrary"
      @show-details="showShowDetails"
      @update-status="updateStatus"
      @remove-from-library="removeShowFromLibrary" />

    <!-- Floating Action Button for adding shows -->
    <AddToLibraryButton
      :media-type="'show'"
      :search-results="searchResults"
      :loading="loading"
      :library-items="userShows"
      @search="handleSearch"
      @add-to-library="addShowToLibrary"
      @show-details="showShowDetails"
      @refresh-library="refreshLibrary" />

    <!-- Media Details Modal -->
    <MediaDetailsModal
      :is-open="showModal"
      :item="selectedShow"
      :media-type="'show'"
      :is-in-library="isShowInLibrary(selectedShow)"
      :current-status="selectedShow?.status"
      @close="closeModal"
      @add-to-library="addShowToLibraryFromModal"
      @remove-from-library="removeShowFromLibrary"
      @update-item="updateShowItem" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useShowsStore } from "@/stores/shows";
import MediaDetailsModal from "@/components/media/MediaDetailsModal.vue";
import MediaLibrary from "@/components/media/MediaLibrary.vue";
import AddToLibraryButton from "@/components/ui/AddToLibraryButton.vue";

const route = useRoute();
const showsStore = useShowsStore();

// Modal state
const showModal = ref(false);
const selectedShow = ref(null);

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
const allUserShows = computed(() => showsStore.items);
const searchResults = computed(() => showsStore.searchResults);
const loading = computed(() => showsStore.loading);
const searchError = computed(() => showsStore.searchError);

// Watch for search errors
watch(searchError, (newError) => {
  if (newError) {
    showError(newError);
  }
});

// Filtered shows based on route query
const userShows = computed(() => {
  const statusFilter = route.query.status;

  if (!statusFilter || statusFilter === "all") {
    return allUserShows.value;
  }

  return allUserShows.value.filter((show) => show.status === statusFilter);
});

const handleSearch = (query) => {
  showsStore.search(query);
};

// Watch route changes to handle status filtering
watch(
  () => route.query.status,
  () => {
    // Filter status changed - no action needed as computed property handles this
  }
);

// Modal methods
const showShowDetails = (show) => {
  selectedShow.value = show;
  showModal.value = true;
};

const isShowInLibrary = (show) => {
  if (!show) return false;
  // Try to match by id or tmdbId
  return userShows.value.some(
    (s) => s.id === show.id || s.tmdbId === show.tmdbId
  );
};

const closeModal = () => {
  showModal.value = false;
  selectedShow.value = null;
};

// Library management methods
const addShowToLibrary = async (libraryData) => {
  // Handle both old format (just show object) and new format (enhanced data from modal)
  let showData, status, quickReview, notes, currentSeason, currentEpisode;

  if (libraryData.item) {
    // New format from AddToLibraryModal
    showData = libraryData.item;
    status = libraryData.status;
    quickReview = libraryData.quick_review;
    notes = libraryData.notes;
    currentSeason = libraryData.current_season;
    currentEpisode = libraryData.current_episode;
  } else {
    // Old format - direct show object
    showData = libraryData;
    status = "want_to_watch"; // default status
    quickReview = null;
    notes = null;
    currentSeason = null;
    currentEpisode = null;
  }

  const result = await showsStore.addItem({
    tmdb_id: showData.tmdbId,
    name: showData.name,
    original_name: showData.original_name,
    summary: showData.summary,
    first_air_date: showData.first_air_date,
    cover_url: showData.cover_url,
    backdrop_url: showData.backdrop_url,
    genres: showData.genres,
    rating: showData.rating,
    vote_count: showData.vote_count,
    seasons: showData.seasons,
    episodes: showData.episodes,
    networks: showData.networks,
    original_language: showData.original_language,
    popularity: showData.popularity,
    status: status,
    quick_review: quickReview,
    notes: notes,
    current_season: currentSeason,
    current_episode: currentEpisode,
  });

  if (!result.success) {
    showError(result.error);
  }
};

const addShowToLibraryFromModal = async (libraryData) => {
  await addShowToLibrary(libraryData);
  closeModal();
};

const updateStatus = async (showId, newStatus) => {
  const result = await showsStore.updateItem(showId, { status: newStatus });
  if (!result.success) {
    showError(result.error);
  }
};

const updateShowItem = async (showId, updateData) => {
  const result = await showsStore.updateItem(showId, updateData);

  if (result.success) {
    // Update local state
    const show = userShows.value.find((s) => s.id === showId);
    if (show) {
      Object.keys(updateData).forEach((key) => {
        show[key] = updateData[key];
      });
    }
    if (selectedShow.value && selectedShow.value.id === showId) {
      Object.keys(updateData).forEach((key) => {
        selectedShow.value[key] = updateData[key];
      });
    }
  } else {
    showError(result.error);
  }
};

const removeShowFromLibrary = async (show) => {
  // Handle both cases: direct ID or show object
  const showId = typeof show === "object" ? show.id : show;

  const result = await showsStore.removeItem(showId);
  if (result.success) {
    // Close modal if the removed show was being displayed
    if (selectedShow.value && selectedShow.value.id === showId) {
      closeModal();
    }
  } else {
    showError(result.error);
  }
};

const refreshLibrary = () => {
  showsStore.getUserItems();
};

// Load user movies on component mount
onMounted(() => {
  refreshLibrary();
});
</script>
