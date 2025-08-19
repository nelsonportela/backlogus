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
      :media-type="'movie'"
      :library-items="userMovies"
      @refresh-library="refreshLibrary"
      @show-details="showMovieDetails"
      @update-status="updateStatus"
      @remove-from-library="removeMovieFromLibrary" />

    <!-- Floating Action Button for adding movies -->
    <AddToLibraryButton
      :media-type="'movie'"
      :search-results="searchResults"
      :loading="loading"
      :library-items="userMovies"
      @search="handleSearch"
      @add-to-library="addMovieToLibrary"
      @show-details="showMovieDetails"
      @refresh-library="refreshLibrary" />

    <!-- Media Details Modal -->
    <MediaDetailsModal
      :is-open="showModal"
      :item="selectedMovie"
      :media-type="'movie'"
      :is-in-library="isMovieInLibrary(selectedMovie)"
      :current-status="selectedMovie?.status"
      @close="closeModal"
      @add-to-library="addMovieToLibraryFromModal"
      @remove-from-library="removeMovieFromLibrary"
      @update-item="updateMovieItem" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useMoviesStore } from "@/stores/movies";
import MediaDetailsModal from "@/components/media/MediaDetailsModal.vue";
import MediaLibrary from "@/components/media/MediaLibrary.vue";
import AddToLibraryButton from "@/components/ui/AddToLibraryButton.vue";

const route = useRoute();
const moviesStore = useMoviesStore();

// Modal state
const showModal = ref(false);
const selectedMovie = ref(null);

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
const allUserMovies = computed(() => moviesStore.items);
const searchResults = computed(() => moviesStore.searchResults);
const loading = computed(() => moviesStore.loading);
const searchError = computed(() => moviesStore.searchError);

// Watch for search errors
watch(searchError, (newError) => {
  if (newError) {
    showError(newError);
  }
});

// Filtered movies based on route query
const userMovies = computed(() => {
  const statusFilter = route.query.status;

  if (!statusFilter || statusFilter === "all") {
    return allUserMovies.value;
  }

  return allUserMovies.value.filter((movie) => movie.status === statusFilter);
});

const handleSearch = (query) => {
  moviesStore.search(query);
};

// Watch route changes to handle status filtering
watch(
  () => route.query.status,
  () => {
    // Filter status changed - no action needed as computed property handles this
  }
);

// Modal methods
const showMovieDetails = (movie) => {
  selectedMovie.value = movie;
  showModal.value = true;
};

const isMovieInLibrary = (movie) => {
  if (!movie) return false;
  // Try to match by id or tmdbId
  return userMovies.value.some(
    (m) => m.id === movie.id || m.tmdbId === movie.tmdbId
  );
};

const closeModal = () => {
  showModal.value = false;
  selectedMovie.value = null;
};

// Library management methods
const addMovieToLibrary = async (libraryData) => {
  const movieData = libraryData.item;
  const status = libraryData.status;
  const quickReview = libraryData.quick_review;
  const notes = libraryData.notes;

  const result = await moviesStore.addItem({
    tmdbId: movieData.tmdbId,
    name: movieData.name,
    original_title: movieData.original_title,
    summary: movieData.summary,
    release_date: movieData.release_date,
    cover_url: movieData.cover_url,
    backdrop_url: movieData.backdrop_url,
    genres: movieData.genres,
    rating: movieData.rating,
    vote_count: movieData.vote_count,
    runtime: movieData.runtime,
    original_language: movieData.original_language,
    popularity: movieData.popularity,
    status: status,
    quick_review: quickReview,
    notes: notes,
  });

  if (!result.success) {
    showError(result.error);
  }
};

const addMovieToLibraryFromModal = async (libraryData) => {
  await addMovieToLibrary(libraryData);
  closeModal();
};

const updateStatus = async (movieId, newStatus) => {
  const result = await moviesStore.updateItem(movieId, { status: newStatus });
  if (!result.success) {
    showError(result.error);
  }
};

const updateMovieItem = async (movieId, updateData) => {
  const result = await moviesStore.updateItem(movieId, updateData);

  if (result.success) {
    // Update local state
    const movie = userMovies.value.find((m) => m.id === movieId);
    if (movie) {
      Object.keys(updateData).forEach((key) => {
        movie[key] = updateData[key];
      });
    }
    if (selectedMovie.value && selectedMovie.value.id === movieId) {
      Object.keys(updateData).forEach((key) => {
        selectedMovie.value[key] = updateData[key];
      });
    }
  } else {
    showError(result.error);
  }
};

const removeMovieFromLibrary = async (movie) => {
  // Handle both cases: direct ID or movie object
  const movieId = typeof movie === "object" ? movie.id : movie;

  const result = await moviesStore.removeItem(movieId);
  if (result.success) {
    // Close modal if the removed movie was being displayed
    if (selectedMovie.value && selectedMovie.value.id === movieId) {
      closeModal();
    }
  } else {
    showError(result.error);
  }
};

const refreshLibrary = () => {
  moviesStore.getUserItems();
};

// Load user movies on component mount
onMounted(() => {
  refreshLibrary();
});
</script>
