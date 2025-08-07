<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click.self="closeModal">
    <div class="flex items-center justify-center min-h-screen px-4 py-4">
      <!-- Background overlay -->
      <div
        class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
        @click="closeModal"></div>

      <!-- Modal panel -->
      <div
        class="relative w-full max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto overflow-hidden text-left transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div
          class="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div class="flex items-center justify-between">
            <h3
              class="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 truncate pr-2">
              {{ displayItem?.name || displayItem?.title || "Media Details" }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:text-gray-600 dark:focus:text-gray-300 transition-colors flex-shrink-0">
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div v-if="displayItem" class="overflow-y-auto flex-1">
          <!-- Loading State -->
          <div
            v-if="isLoadingDetails"
            class="flex items-center justify-center h-64">
            <div class="text-center">
              <div
                class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p class="text-gray-600 dark:text-gray-400">Loading details...</p>
            </div>
          </div>

          <!-- Hero Section -->
          <div
            v-else
            class="relative h-48 sm:h-64 bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <!-- Banner Image -->
            <div class="absolute inset-0">
              <!-- Banner fallback always visible -->
              <div class="w-full h-full absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700">
                <span class="text-white text-sm sm:text-lg font-medium px-4 text-center">
                  {{ displayItem.name || displayItem.title }}
                </span>
              </div>
              <!-- Banner image overlays, fades in when loaded -->dock
              <img
                v-if="(displayItem.backdrop_url || displayItem.banner_url) && !bannerImgError"
                :src="displayItem.backdrop_url || displayItem.banner_url"
                :alt="displayItem.name || displayItem.title"
                class="w-full h-full object-cover absolute inset-0 z-10 transition-opacity duration-300"
                :style="bannerImgLoaded ? 'opacity:1;' : 'opacity:0;'"
                @load="bannerImgLoaded = true"
                @error="bannerImgError = true"
              />
            </div>

            <!-- Gradient overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/100 via-black/30 to-transparent pointer-events-none"></div>

            <!-- Cover Image -->
            <div class="absolute left-3 sm:left-6 top-12 sm:top-16 z-10">
              <!-- Cover fallback always visible -->
              <div class="w-16 h-24 sm:w-24 sm:h-36 absolute inset-0 z-0 flex items-center justify-center bg-gray-300 dark:bg-gray-600 rounded-lg shadow-xl border-2 border-white dark:border-gray-800 ring-2 ring-black/10 dark:ring-white/10">
                <span class="text-gray-500 dark:text-gray-400 text-xs text-center px-1">No Image</span>
                <img
                  v-if="(displayItem.cover_url || displayItem.poster_url || displayItem.image_url) && !coverImgError"
                  :src="displayItem.cover_url || displayItem.poster_url || displayItem.image_url"
                  :alt="displayItem.name || displayItem.title"
                  class="w-16 h-24 sm:w-24 sm:h-36 object-cover rounded-lg shadow-xl border-2 border-white dark:border-gray-800 ring-2 ring-black/10 dark:ring-white/10 absolute inset-0 z-10 transition-opacity duration-300"
                  :style="coverImgLoaded ? 'opacity:1;' : 'opacity:0;'"
                  @load="coverImgLoaded = true"
                  @error="coverImgError = true"
                />
              </div>
            </div>

            <!-- Quick Info Card -->
            <MediaQuickInfo :item="displayItem" :media-type="mediaType" />
          </div>

          <!-- Details Section -->
          <div class="px-6 py-6 space-y-6">
            <!-- Title and Subtitle -->
            <div>
              <h2
                class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {{ displayItem.name || displayItem.title }}
              </h2>
              <p
                v-if="displayItem.subtitle || displayItem.tagline"
                class="text-lg text-gray-600 dark:text-gray-400 italic">
                {{ displayItem.subtitle || displayItem.tagline }}
              </p>
            </div>

            <!-- Description/Summary -->
            <div
              v-if="
                displayItem.summary ||
                displayItem.description ||
                displayItem.overview
              ">
              <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Description
              </h4>
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                {{
                  displayItem.summary ||
                  displayItem.description ||
                  displayItem.overview
                }}
              </p>
            </div>

            <!-- Genres -->
            <div v-if="displayItem.genres && displayItem.genres.length > 0">
              <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {{ getGenresLabel() }}
              </h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="genre in displayItem.genres"
                  :key="genre"
                  class="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full">
                  {{ genre }}
                </span>
              </div>
            </div>

            <!-- Media-specific details -->
            <GameDetails v-if="mediaType === 'game'" :item="displayItem" />
            <MovieDetails
              v-else-if="mediaType === 'movie'"
              :item="displayItem" />
            <BookDetails v-else-if="mediaType === 'book'" :item="displayItem" />
            <ShowDetails v-else-if="mediaType === 'show'" :item="displayItem" />

            <!-- Screenshots -->
            <MediaScreenshots
              v-if="displayItem.screenshots"
              :screenshots="displayItem.screenshots" />

            <!-- User Notes -->
            <div v-if="isInLibrary && displayItem.notes">
              <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                My Notes
              </h4>
              <p
                class="text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border-l-4 border-yellow-400 dark:border-yellow-500">
                {{ displayItem.notes }}
              </p>
            </div>

            <!-- Library Status -->
            <div
              v-if="isInLibrary"
              class="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Library Status
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    :value="currentStatus"
                    @change="updateItemStatus"
                    class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400">
                    <option
                      v-for="status in statusOptions"
                      :key="status.value"
                      :value="status.value">
                      {{ status.label }}
                    </option>
                  </select>
                </div>

                <!-- My Rating -->
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    My Rating
                  </label>
                  <div class="flex items-center space-x-2">
                    <button
                      v-for="review in getQuickReviewOptions()"
                      :key="review.value"
                      @click="toggleQuickReview(review.value)"
                      :class="[
                        'p-2 rounded-md transition-colors border flex items-center justify-center',
                        item.quick_review === review.value
                          ? 'bg-primary-100 dark:bg-primary-900/50 border-primary-500 dark:border-primary-400 ring-1 ring-primary-500 dark:ring-primary-400 text-primary-600 dark:text-primary-400'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
                      ]"
                      :title="review.label">
                      <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          v-if="review.value === 'positive'"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        <path
                          v-else-if="review.value === 'negative'"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                        <path
                          v-else
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M20 12H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- User Platform (for games) -->
                <div v-if="mediaType === 'game'">
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Platform Played
                  </label>
                  <select
                    v-if="getUserPlatformOptions().length > 0"
                    :value="item.user_platform || ''"
                    @change="updateUserPlatform"
                    class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400">
                    <option value="">Select platform</option>
                    <option
                      v-for="platform in getUserPlatformOptions()"
                      :key="platform"
                      :value="platform">
                      {{ platform }}
                    </option>
                  </select>
                  <div
                    v-else
                    class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                    No platform information available
                  </div>
                </div>

                <!-- Current Season (for TV shows) -->
                <div v-if="mediaType === 'show' && item.status !== 'watched'">
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Season
                  </label>
                  <input
                    type="number"
                    :value="item.current_season || ''"
                    @change="updateCurrentSeason"
                    min="1"
                    max="999"
                    placeholder="Season #"
                    class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400" />
                </div>

                <!-- Current Episode (for TV shows) -->
                <div v-if="mediaType === 'show' && item.status !== 'watched'">
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Episode
                  </label>
                  <input
                    type="number"
                    :value="item.current_episode || ''"
                    @change="updateCurrentEpisode"
                    min="1"
                    max="999"
                    placeholder="Episode #"
                    class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button @click="closeModal" class="btn-secondary">Close</button>
          <button
            v-if="!isInLibrary"
            @click="openAddToLibraryModal"
            class="btn-primary">
            Add to Library
          </button>
          <button
            v-else
            @click="removeFromLibrary"
            class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-colors">
            Remove from Library
          </button>
        </div>
      </div>
    </div>

    <!-- Add to Library Modal -->
    <AddToLibraryModal
      :is-open="showAddToLibraryModal"
      :item="displayItem"
      :media-type="mediaType"
      @close="showAddToLibraryModal = false"
      @add-to-library="handleAddToLibrary" />
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
// Banner and cover image fade-in state
const bannerImgLoaded = ref(false);
const bannerImgError = ref(false);
const coverImgLoaded = ref(false);
const coverImgError = ref(false);
import AddToLibraryModal from "./AddToLibraryModal.vue";
import MediaQuickInfo from "./MediaQuickInfo.vue";
import MediaScreenshots from "./MediaScreenshots.vue";
import GameDetails from "./details/GameDetails.vue";
import MovieDetails from "./details/MovieDetails.vue";
import BookDetails from "./details/BookDetails.vue";
import ShowDetails from "./details/ShowDetails.vue";
import { useMoviesStore } from "../../stores/movies.js";
import { useShowsStore } from "../../stores/shows.js";
import { getStatusOptions } from "@/composables/useStatusOptions";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: null,
  },
  mediaType: {
    type: String,
    default: "game",
    validator: (value) => ["game", "movie", "book", "show"].includes(value),
  },
  isInLibrary: {
    type: Boolean,
    default: false,
  },
  currentStatus: {
    type: String,
    default: null,
  },
});

const emit = defineEmits([
  "close",
  "add-to-library",
  "remove-from-library",
  "update-item",
]);

// Add to Library Modal state
const showAddToLibraryModal = ref(false);

// Enhanced item data for movies and shows
const moviesStore = useMoviesStore();
const showsStore = useShowsStore();
const enhancedItem = ref(null);
const isLoadingDetails = ref(false);

// Use enhanced item if available, otherwise fall back to original item
const displayItem = computed(() => enhancedItem.value || props.item);

// Watch for modal opening and item changes to fetch detailed data
watch(
  [() => props.isOpen, () => props.item],
  async ([isOpen, item]) => {
    if (isOpen && item && !props.isInLibrary) {
      // For search results (not library items), fetch full details
      if (item.tmdbId && !enhancedItem.value) {
        isLoadingDetails.value = true;
        try {
          let result;
          if (props.mediaType === "movie") {
            result = await moviesStore.getItemDetails(item.tmdbId);
          } else if (props.mediaType === "show") {
            result = await showsStore.getItemDetails(item.tmdbId);
          }
          
          if (result && result.success) {
            enhancedItem.value = result.data;
          }
        } catch (error) {
          // Failed to fetch details - handle gracefully
          console.warn(`Failed to fetch ${props.mediaType} details:`, error);
        } finally {
          isLoadingDetails.value = false;
        }
      }
    } else if (!isOpen) {
      // Reset enhanced data when modal closes
      enhancedItem.value = null;
    }
  },
  { immediate: true }
);

const closeModal = () => {
  emit("close");
};

const openAddToLibraryModal = () => {
  showAddToLibraryModal.value = true;
};

const handleAddToLibrary = (libraryData) => {
  emit("add-to-library", libraryData);
  showAddToLibraryModal.value = false;
};

const removeFromLibrary = () => {
  emit("remove-from-library", props.item);
};

const updateItemStatus = (event) => {
  emit("update-item", props.item.id, { status: event.target.value });
};

const updateUserPlatform = (event) => {
  emit("update-item", props.item.id, { user_platform: event.target.value });
};

const updateCurrentSeason = (event) => {
  const value = event.target.value;
  emit("update-item", props.item.id, { current_season: value ? parseInt(value) : null });
};

const updateCurrentEpisode = (event) => {
  const value = event.target.value;
  emit("update-item", props.item.id, { current_episode: value ? parseInt(value) : null });
};

const toggleQuickReview = (reviewValue) => {
  // Toggle functionality: if the same rating is clicked, set to null
  const newReview =
    props.item.quick_review === reviewValue ? null : reviewValue;
  emit("update-item", props.item.id, { quick_review: newReview });
};

const getGenresLabel = () => {
  switch (props.mediaType) {
    case "game":
      return "Genres";
    case "movie":
    case "show":
      return "Genres";
    case "book":
      return "Categories";
    default:
      return "Genres";
  }
};

const statusOptions = computed(() => getStatusOptions(props.mediaType));

const getUserPlatformOptions = () => {
  // Use the game's actual platforms from IGDB data
  if (!props.item?.platforms || !Array.isArray(props.item.platforms)) {
    return [];
  }

  // Return the platforms available for this specific game
  return props.item.platforms;
};

const getQuickReviewOptions = () => {
  return [
    { value: "negative", label: "Disliked" },
    { value: "neutral", label: "It was okay" },
    { value: "positive", label: "Liked it" },
  ];
};

// Close modal on Escape key
const handleKeydown = (event) => {
  if (event.key === "Escape" && props.isOpen) {
    closeModal();
  }
};

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (typeof document !== "undefined") {
        document.addEventListener("keydown", handleKeydown);
        document.body.style.overflow = "hidden";
      }
    } else {
      if (typeof document !== "undefined") {
        document.removeEventListener("keydown", handleKeydown);
        document.body.style.overflow = "";
      }
    }
  }
);
</script>
