<template>
  <div class="relative">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Search {{ mediaTypeLabel }}
      </h3>
      <div class="flex gap-2 sm:gap-4">
        <div class="flex-1">
          <input
            type="text"
            v-model="searchQuery"
            @input="debouncedSearch"
            @focus="isSearchFocused = true"
            @blur="handleSearchBlur"
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 text-sm sm:text-base"
            :placeholder="`Search for ${mediaTypeLabel.toLowerCase()}...`"
          />
        </div>
      </div>
    </div>

    <!-- Search Results Overlay -->
    <div
      v-if="
        (searchResults.length > 0 || (searchQuery && !loading)) &&
        (isSearchFocused || isHoveringResults)
      "
      class="fixed inset-0 z-40 overflow-y-auto"
      @click.self="closeSearchResults"
    >
      <!-- Dark overlay background -->
      <div
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      ></div>

      <!-- Search results container -->
      <div
        class="relative z-50 mx-auto max-w-4xl mt-16 sm:mt-20 mb-8 px-2 sm:px-4"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border dark:border-gray-700 max-h-[80vh] overflow-hidden flex flex-col"
        >
          <!-- Search header in overlay -->
          <div class="p-4 sm:p-6 border-b dark:border-gray-700 flex-shrink-0">
            <div class="flex items-center justify-between">
              <h3
                class="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 pr-2 truncate"
              >
                Search Results for "{{ searchQuery }}"
              </h3>
              <button
                @click="closeSearchResults"
                class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors flex-shrink-0"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Search Results -->
          <div
            v-if="searchResults.length > 0"
            class="p-4 sm:p-6 space-y-2 overflow-y-auto flex-1"
            @mouseenter="isHoveringResults = true"
            @mouseleave="isHoveringResults = false"
          >
            <div
              v-for="item in searchResults"
              :key="item.id"
              class="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              @click="showItemDetails(item)"
            >
              <div
                class="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1"
              >
                <img
                  v-if="getImageUrl(item)"
                  :src="getImageUrl(item)"
                  :alt="item.name || item.title"
                  class="w-10 h-12 sm:w-12 sm:h-16 object-cover rounded flex-shrink-0"
                />
                <div
                  v-else
                  class="w-10 h-12 sm:w-12 sm:h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center flex-shrink-0"
                >
                  <span class="text-gray-400 dark:text-gray-500 text-xs"
                    >No Image</span
                  >
                </div>
                <div class="min-w-0 flex-1">
                  <h4
                    class="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate"
                  >
                    {{ item.name || item.title }}
                  </h4>
                  <p
                    class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate"
                    v-if="getDateField(item)"
                  >
                    {{ getDateLabel() }}: {{ formatDate(getDateField(item)) }}
                  </p>
                  <p
                    class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate"
                    v-if="item.genres && item.genres.length > 0"
                  >
                    {{ item.genres.join(", ") }}
                  </p>
                  <!-- Additional info based on media type -->
                  <p
                    class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate"
                    v-if="item.platforms && item.platforms.length > 0"
                  >
                    {{ item.platforms.join(", ") }}
                  </p>
                  <p
                    class="text-xs sm:text-sm text-gray-500 dark:text-gray-400"
                    v-if="item.author"
                  >
                    by {{ item.author }}
                  </p>
                  <p
                    class="text-sm text-gray-500 dark:text-gray-400"
                    v-if="item.director"
                  >
                    Directed by {{ item.director }}
                  </p>
                </div>
              </div>
              <button
                @click.stop="openAddToLibraryModal(item)"
                class="btn-primary text-sm"
                :disabled="isItemInLibrary(item.id)"
              >
                {{ isItemInLibrary(item.id) ? "Added" : "Add to Library" }}
              </button>
            </div>
          </div>

          <!-- No results message -->
          <div
            v-if="searchQuery && !loading && searchResults.length === 0"
            class="p-6 text-center text-gray-500 dark:text-gray-400"
          >
            No {{ mediaTypeLabel.toLowerCase() }} found for "{{ searchQuery }}"
          </div>

          <!-- Loading message -->
          <div
            v-if="loading"
            class="p-6 text-center text-gray-500 dark:text-gray-400"
          >
            Searching...
          </div>
        </div>
      </div>
    </div>

    <!-- Add to Library Modal -->
    <AddToLibraryModal
      :is-open="showAddToLibraryModal"
      :item="selectedItemForLibrary"
      :media-type="mediaType"
      @close="showAddToLibraryModal = false"
      @add-to-library="handleAddToLibrary"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import AddToLibraryModal from "./AddToLibraryModal.vue";

const props = defineProps({
  mediaType: {
    type: String,
    required: true,
    validator: (value) => ["game", "movie", "book", "show"].includes(value),
  },
  searchResults: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  libraryItems: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["search", "add-to-library", "show-details"]);

const searchQuery = ref("");
const isSearchFocused = ref(false);
const isHoveringResults = ref(false);
const showAddToLibraryModal = ref(false);
const selectedItemForLibrary = ref(null);
let searchTimeout = null;

const mediaTypeLabel = computed(() => {
  const labels = {
    game: "Games",
    movie: "Movies",
    book: "Books",
    show: "TV Shows",
  };
  return labels[props.mediaType] || "Items";
});

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    emit("search", searchQuery.value);
  }, 300);
};

const showItemDetails = (item) => {
  emit("show-details", item);
};

const openAddToLibraryModal = (item) => {
  selectedItemForLibrary.value = item;
  showAddToLibraryModal.value = true;
};

const handleAddToLibrary = (libraryData) => {
  emit("add-to-library", libraryData);
};

const isItemInLibrary = (itemId) => {
  return props.libraryItems.some((item) => {
    // Check both igdb_id and id to handle different item structures
    return item.igdb_id === itemId || item.id === itemId;
  });
};

const getImageUrl = (item) => {
  return item.cover_url || item.poster_url || item.image_url;
};

const getDateField = (item) => {
  return item.release_date || item.publication_date || item.air_date;
};

const getDateLabel = () => {
  const labels = {
    game: "Released",
    movie: "Released",
    book: "Published",
    show: "Aired",
  };
  return labels[props.mediaType] || "Date";
};

const formatDate = (dateString) => {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString();
};

const handleSearchBlur = () => {
  // Delay hiding to allow for hover interactions
  setTimeout(() => {
    if (!isHoveringResults.value) {
      isSearchFocused.value = false;
    }
  }, 150);
};

const closeSearchResults = () => {
  isSearchFocused.value = false;
  isHoveringResults.value = false;
};
</script>
