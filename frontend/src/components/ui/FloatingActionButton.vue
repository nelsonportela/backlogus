<template>
  <div>
    <!-- Floating Action Button -->
    <button
      @click="openSearchModal"
      class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center group"
      :title="`Add ${mediaTypeLabel}`"
    >
      <svg
        class="w-6 h-6 group-hover:rotate-90 transition-transform duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    </button>

    <!-- Search Modal -->
    <div
      v-if="isSearchModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="closeSearchModal"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      ></div>

      <!-- Modal -->
      <div class="relative min-h-screen flex items-center justify-center p-4">
        <div
          class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between p-3 border-b dark:border-gray-700"
          >
            <h2 class="text-base font-medium text-gray-900 dark:text-gray-100">
              Add {{ mediaTypeLabel }}
            </h2>

            <button
              @click="closeSearchModal"
              class="-top-2 -right-2 z-10 bg-red-500 text-white rounded-full min-w-[24px] min-h-[24px] flex items-center justify-center"
              title="Close"
            >
              <svg
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="3"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Search Content -->
          <div class="p-4">
            <!-- Search Input -->
            <div class="flex gap-2 mb-4">
              <div class="flex-1">
                <input
                  type="text"
                  v-model="searchQuery"
                  @input="debouncedSearch"
                  class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                  :placeholder="`Search for ${mediaTypeLabel.toLowerCase()}...`"
                />
              </div>
            </div>

            <!-- Search Results -->
            <div class="max-h-96 overflow-y-auto">
              <!-- Loading -->
              <div
                v-if="loading"
                class="text-center py-6 text-gray-500 dark:text-gray-400"
              >
                <div class="inline-flex items-center">
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-500"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Searching...
                </div>
              </div>

              <!-- Results -->
              <div v-else-if="searchResults.length > 0" class="space-y-3 mr-6">
                <div
                  v-for="item in searchResults"
                  :key="item.id"
                  class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  @click="handleShowDetails(item)"
                >
                  <div class="flex items-center space-x-4 min-w-0 flex-1">
                    <img
                      v-if="getImageUrl(item)"
                      :src="getImageUrl(item)"
                      :alt="getItemName(item)"
                      class="w-16 h-24 object-cover rounded flex-shrink-0"
                    />
                    <div
                      v-else
                      class="w-16 h-24 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center flex-shrink-0"
                    >
                      <span class="text-gray-400 dark:text-gray-500 text-xs"
                        >No Image</span
                      >
                    </div>
                    <div class="min-w-0 flex-1">
                      <h4
                        class="font-medium text-gray-900 dark:text-gray-100 text-sm truncate"
                      >
                        {{ getItemName(item) }}
                      </h4>
                      <p
                        v-if="getItemYear(item)"
                        class="text-sm text-gray-500 dark:text-gray-400"
                      >
                        {{ getItemYear(item) }}
                      </p>
                      <p
                        v-if="item.genres && item.genres.length > 0"
                        class="text-sm text-gray-500 dark:text-gray-400 truncate"
                      >
                        {{ item.genres.join(", ") }}
                      </p>
                    </div>
                  </div>
                  <button
                    @click.stop="handleAddToLibrary(item)"
                    class="px-3 py-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 border border-primary-600 dark:border-primary-400 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                    :disabled="isItemInLibrary(item.id)"
                  >
                    {{ isItemInLibrary(item.id) ? "Added" : "Add" }}
                  </button>
                </div>
              </div>

              <!-- No results -->
              <div
                v-else-if="searchQuery && !loading"
                class="text-center py-6 text-gray-500 dark:text-gray-400"
              >
                No {{ mediaTypeLabel.toLowerCase() }} found for "{{
                  searchQuery
                }}"
              </div>

              <!-- Initial state -->
              <div
                v-else
                class="text-center py-6 text-gray-500 dark:text-gray-400"
              >
                Search for {{ mediaTypeLabel.toLowerCase() }} to add to your
                library
              </div>
            </div>
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
      @add-to-library="handleAddToLibraryFromModal"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import AddToLibraryModal from "../media/AddToLibraryModal.vue";

const isSearchModalOpen = ref(false);
const searchQuery = ref("");
const showAddToLibraryModal = ref(false);
const selectedItemForLibrary = ref(null);

// Debounce timer
let searchTimeout = null;

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

const emit = defineEmits([
  "search",
  "add-to-library",
  "show-details",
  "refresh-library",
]);

const mediaTypeLabel = computed(() => {
  const labels = {
    game: "Games",
    movie: "Movies",
    book: "Books",
    show: "Shows",
  };
  return labels[props.mediaType] || "Items";
});

const openSearchModal = () => {
  isSearchModalOpen.value = true;
};

const closeSearchModal = () => {
  isSearchModalOpen.value = false;
  searchQuery.value = "";
  // Also close any open add-to-library modal
  showAddToLibraryModal.value = false;
  selectedItemForLibrary.value = null;
  // Clear search results
  emit("search", "");
};

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (searchQuery.value.trim()) {
      emit("search", searchQuery.value.trim());
    }
  }, 300);
};

const handleAddToLibrary = (item) => {
  selectedItemForLibrary.value = item;
  showAddToLibraryModal.value = true;
};

const handleAddToLibraryFromModal = (libraryData) => {
  emit("add-to-library", libraryData);
  showAddToLibraryModal.value = false;
  // Refresh the library to show the newly added item
  emit("refresh-library");
  // Keep search modal open in case user wants to add more items
};

const handleShowDetails = (item) => {
  emit("show-details", item);
  closeSearchModal();
};

const isItemInLibrary = (itemId) => {
  return props.libraryItems.some((item) => {
    return item.igdb_id === itemId || item.id === itemId;
  });
};

const getImageUrl = (item) => {
  return item.cover_url || item.poster_url || item.image_url;
};

const getItemName = (item) => {
  return item.name || item.title;
};

const getItemYear = (item) => {
  const date = item.release_date || item.publication_date || item.air_date;
  if (date) {
    return new Date(date).getFullYear();
  }
  return null;
};
</script>
