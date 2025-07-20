<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">
      Search {{ mediaTypeLabel }}
    </h3>
    <div class="flex gap-4">
      <div class="flex-1">
        <input
          type="text"
          v-model="searchQuery"
          @input="debouncedSearch"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          :placeholder="`Search for ${mediaTypeLabel.toLowerCase()}...`"
        />
      </div>
    </div>

    <!-- Search Results -->
    <div
      v-if="searchResults.length > 0"
      class="mt-4 space-y-2 max-h-96 overflow-y-auto"
    >
      <div
        v-for="item in searchResults"
        :key="item.id"
        class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
        @click="showItemDetails(item)"
      >
        <div class="flex items-center space-x-4">
          <img
            v-if="getImageUrl(item)"
            :src="getImageUrl(item)"
            :alt="item.name || item.title"
            class="w-12 h-16 object-cover rounded"
          />
          <div
            v-else
            class="w-12 h-16 bg-gray-200 rounded flex items-center justify-center"
          >
            <span class="text-gray-400 text-xs">No Image</span>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">
              {{ item.name || item.title }}
            </h4>
            <p
              class="text-sm text-gray-500"
              v-if="getDateField(item)"
            >
              {{ getDateLabel() }}: {{ formatDate(getDateField(item)) }}
            </p>
            <p
              class="text-sm text-gray-500"
              v-if="item.genres && item.genres.length > 0"
            >
              {{ item.genres.join(", ") }}
            </p>
            <!-- Additional info based on media type -->
            <p
              class="text-sm text-gray-500"
              v-if="item.platforms && item.platforms.length > 0"
            >
              {{ item.platforms.join(", ") }}
            </p>
            <p class="text-sm text-gray-500" v-if="item.author">
              by {{ item.author }}
            </p>
            <p class="text-sm text-gray-500" v-if="item.director">
              Directed by {{ item.director }}
            </p>
          </div>
        </div>
        <button
          @click.stop="addToLibrary(item)"
          class="btn-primary text-sm"
          :disabled="isItemInLibrary(item.id)"
        >
          {{ isItemInLibrary(item.id) ? "Added" : "Add to Library" }}
        </button>
      </div>
    </div>

    <div
      v-if="searchQuery && !loading && searchResults.length === 0"
      class="mt-4 text-center text-gray-500"
    >
      No {{ mediaTypeLabel.toLowerCase() }} found for "{{ searchQuery }}"
    </div>

    <div v-if="loading" class="mt-4 text-center text-gray-500">
      Searching...
    </div>
  </div>
</template>

<script setup>
/* global clearTimeout, setTimeout */
import { ref, computed } from "vue";

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
]);

const searchQuery = ref("");
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

const addToLibrary = (item) => {
  emit("add-to-library", item);
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
</script>
