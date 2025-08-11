<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
    <!-- Header with Title and Refresh -->
    <div class="flex items-center justify-between mb-4 gap-2">
      <div>
        <!-- Large screens: original div -->
        <div
          class="hidden sm:block bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-gray-600/30">
          <h3
            class="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
            {{ mediaTypeLabel }}
            <span
              v-if="totalItems > 0"
              class="text-sm text-gray-500 dark:text-gray-400 ml-2">
              ({{ totalItems }})
            </span>
          </h3>
        </div>
        <!-- Small screens: select navigation -->
        <select
          v-if="statusMenuOptions.length > 0"
          class="block sm:hidden w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 text-base"
          :value="currentStatusOption.value"
          @change="handleStatusSelect($event)">
          <option
            v-for="option in statusMenuOptions"
            :key="option.value"
            :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <button
        @click="refreshLibrary"
        class="flex items-center justify-center w-10 h-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 group"
        title="Refresh library">
        <svg
          class="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:rotate-180 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Filters -->
    <MediaLibraryFilters
      :media-type="mediaType"
      :library-items="libraryItems"
      v-model:search-query="searchQuery"
      v-model:sort-by="sortBy"
      v-model:platform-filter="platformFilter"
      v-model:items-per-page="itemsPerPage"
      @clear-search="clearSearch" />

    <!-- Empty State -->
    <MediaLibraryEmptyState
      v-if="filteredItems.length === 0 && !isLoading"
      :media-type-label="mediaTypeLabel.toLowerCase()"
      :has-active-filters="!!(searchQuery || platformFilter)"
      @clear-filters="clearAllFilters" />

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>

    <!-- Items Grid -->
    <div v-else-if="paginatedItems.length > 0" class="space-y-4">
      <div
        class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4">
        <MediaLibraryItem
          v-for="item in paginatedItems"
          :key="item.id"
          :item="item"
          @click="showItemDetails"
          @remove="removeFromLibrary" />
      </div>

      <!-- Pagination -->
      <PaginationControls
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="filteredItems.length"
        :items-per-page="itemsPerPage"
        @page-change="goToPage" />
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :is-open="confirmationModal.isOpen"
      :title="confirmationModal.title"
      :message="confirmationModal.message"
      :confirm-text="confirmationModal.confirmText"
      :cancel-text="confirmationModal.cancelText"
      @confirm="handleConfirmRemove"
      @cancel="cancelRemove" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getStatusOptions,
  getStatusLabel,
} from "@/composables/useStatusOptions";
import ConfirmationModal from "../ui/ConfirmationModal.vue";
import MediaLibraryFilters from "./MediaLibraryFilters.vue";
import MediaLibraryItem from "./MediaLibraryItem.vue";
import MediaLibraryEmptyState from "./MediaLibraryEmptyState.vue";
import PaginationControls from "../ui/PaginationControls.vue";

const route = useRoute();
const router = useRouter();

// Sidebar submenu options for each media type
const statusMenuMap = {
  game: [{ value: "all", label: "All Games" }, ...getStatusOptions("game")],
  movie: [{ value: "all", label: "All Movies" }, ...getStatusOptions("movie")],
  book: [{ value: "all", label: "All Books" }, ...getStatusOptions("book")],
  show: [{ value: "all", label: "All Shows" }, ...getStatusOptions("show")],
};

const statusMenuOptions = computed(() => statusMenuMap[props.mediaType] || []);

// Determine current status from route
const currentStatusOption = computed(() => {
  const status = route.query.status || "all";
  return (
    statusMenuOptions.value.find((opt) => opt.value === status) ||
    statusMenuOptions.value[0]
  );
});

function handleStatusSelect(event) {
  const selected = event.target.value;
  // Update the route query param for status
  router.replace({
    query: { ...route.query, status: selected },
  });
}

const props = defineProps({
  mediaType: {
    type: String,
    required: true,
    validator: (value) => ["game", "movie", "book", "show"].includes(value),
  },
  libraryItems: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "refresh-library",
  "show-details",
  "update-status",
  "remove-from-library",
  "search",
  "sort-change",
  "platform-filter",
]);

// Search and filter state
const searchQuery = ref("");
const sortBy = ref("name_asc");
const platformFilter = ref("");
const itemsPerPage = ref(20);
const currentPage = ref(1);

// Debounced search
let searchTimeout = null;

// Confirmation modal state
const confirmationModal = ref({
  isOpen: false,
  title: "",
  message: "",
  confirmText: "Remove",
  cancelText: "Cancel",
  itemToRemove: null,
});

// Computed properties
const totalItems = computed(() => props.libraryItems.length);

const filteredItems = computed(() => {
  let items = [...props.libraryItems];

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    items = items.filter((item) => {
      const name = (item.name || item.title || "").toLowerCase();
      const genres = item.genres ? item.genres.join(" ").toLowerCase() : "";
      return name.includes(query) || genres.includes(query);
    });
  }

  // Apply platform filter (for games)
  if (platformFilter.value && props.mediaType === "game") {
    items = items.filter((item) => {
      return (
        item.user_platform === platformFilter.value ||
        (item.platforms && item.platforms.includes(platformFilter.value))
      );
    });
  }

  // Apply sorting
  items.sort((a, b) => {
    const [field, direction] = sortBy.value.split("_");
    const isDesc = direction === "desc";

    let aValue, bValue;

    switch (field) {
      case "name":
        aValue = (a.name || a.title || "").toLowerCase();
        bValue = (b.name || b.title || "").toLowerCase();
        break;
      case "date":
        if (sortBy.value.includes("added")) {
          aValue = new Date(a.updated_at || a.created_at);
          bValue = new Date(b.updated_at || b.created_at);
        } else if (sortBy.value.includes("release")) {
          aValue = new Date(a.release_date || 0);
          bValue = new Date(b.release_date || 0);
        } else if (sortBy.value.includes("publication")) {
          aValue = new Date(a.publication_date || 0);
          bValue = new Date(b.publication_date || 0);
        }
        break;
      case "rating":
        aValue = a.rating || a.total_rating || 0;
        bValue = b.rating || b.total_rating || 0;
        break;
      case "author":
        aValue = (a.author || "").toLowerCase();
        bValue = (b.author || "").toLowerCase();
        break;
      default:
        aValue = a[field] || "";
        bValue = b[field] || "";
    }

    if (aValue < bValue) return isDesc ? 1 : -1;
    if (aValue > bValue) return isDesc ? -1 : 1;
    return 0;
  });

  return items;
});

const totalPages = computed(() =>
  Math.ceil(filteredItems.value.length / itemsPerPage.value)
);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredItems.value.slice(start, end);
});

const mediaTypeLabel = computed(() => {
  // Get the route name (e.g., 'games')
  const routeName = route.name;

  // Get the status from query parameters
  const status = route.query.status;

  // Map route names to proper labels
  const routeLabels = {
    games: "Games",
    movies: "Movies",
    tv: "TV Shows",
    books: "Books",
  };

  // Get the proper base label
  const baseLabel =
    routeLabels[routeName] ||
    (routeName
      ? routeName.charAt(0).toUpperCase() + routeName.slice(1)
      : "Media");

  // If there's a status and it's not 'all', get the label from composable
  if (status && status !== "all") {
    const statusLabel = getStatusLabel(status, props.mediaType);
    if (statusLabel) {
      return statusLabel;
    }
  } else if (status === "all") {
    // If status is 'all', just return the base label
    return `All ${baseLabel}`;
  }

  // Default fallback - return the base label
  return baseLabel;
});

// Methods
const clearSearch = () => {
  searchQuery.value = "";
  currentPage.value = 1;
  emit("search", "");
};

const clearAllFilters = () => {
  searchQuery.value = "";
  platformFilter.value = "";
  currentPage.value = 1;
  emit("search", "");
  emit("platform-filter", "");
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const refreshLibrary = () => {
  emit("refresh-library");
};

const showItemDetails = (item) => {
  emit("show-details", item);
};

const removeFromLibrary = (item) => {
  confirmationModal.value = {
    isOpen: true,
    title: "Remove from Library",
    message: `Are you sure you want to remove "${item.name || item.title}" from your library?`,
    confirmText: "Remove",
    cancelText: "Cancel",
    itemToRemove: item,
  };
};

const handleConfirmRemove = () => {
  if (confirmationModal.value.itemToRemove) {
    emit("remove-from-library", confirmationModal.value.itemToRemove);
  }
  cancelRemove();
};

const cancelRemove = () => {
  confirmationModal.value = {
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Remove",
    cancelText: "Cancel",
    itemToRemove: null,
  };
};

// Watch for filter changes to emit events and reset pagination
watch(searchQuery, (newValue) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    emit("search", newValue);
  }, 300);
});

watch(sortBy, (newValue) => {
  currentPage.value = 1;
  emit("sort-change", newValue);
});

watch(platformFilter, (newValue) => {
  currentPage.value = 1;
  emit("platform-filter", newValue);
});

watch(itemsPerPage, () => {
  currentPage.value = 1;
});

// Watch for external changes to reset pagination
watch(
  () => props.libraryItems,
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);
</script>
