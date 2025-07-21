<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
    <div class="flex items-center justify-between mb-4 gap-2">
      <div
        class="bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-gray-600/30"
      >
        <h3
          class="text-lg font-medium text-gray-900 dark:text-gray-100 truncate"
        >
          {{ mediaTypeLabel }}
        </h3>
      </div>
      <button
        @click="refreshLibrary"
        class="flex items-center justify-center w-10 h-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 group"
        title="Refresh library"
      >
        <svg
          class="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:rotate-180 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>

    <div
      v-if="libraryItems.length === 0"
      class="text-center text-gray-500 dark:text-gray-400 py-8"
    >
      No {{ mediaTypeLabel.toLowerCase() }} in your library yet. Search and add
      some {{ mediaTypeLabel.toLowerCase() }}!
    </div>

    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4"
    >
      <div
        v-for="item in libraryItems"
        :key="item.id"
        class="relative group cursor-pointer"
        @click="showItemDetails(item)"
      >
        <!-- Remove Button -->
        <button
          @click.stop="removeFromLibrary(item)"
          class="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full w-6 h-6 min-w-[24px] min-h-[24px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg flex-shrink-0"
          title="Remove from library"
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

        <!-- Cover Image Container -->
        <div
          class="relative aspect-[3/4] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <img
            v-if="getImageUrl(item)"
            :src="getImageUrl(item)"
            :alt="item.name || item.title"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center"
          >
            <svg
              class="w-8 h-8 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <!-- Full Cover Gradient Overlay (appears on hover) -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/100 via-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>

          <!-- Title Text (appears on hover) -->
          <div
            class="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <h4 class="text-white font-medium text-sm leading-tight">
              {{ item.name || item.title }}
            </h4>
            <p v-if="getDateField(item)" class="text-white/80 text-xs mt-1">
              {{ new Date(getDateField(item)).getFullYear() }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :is-open="confirmationModal.isOpen"
      :title="confirmationModal.title"
      :message="confirmationModal.message"
      :confirm-text="confirmationModal.confirmText"
      :cancel-text="confirmationModal.cancelText"
      @confirm="handleConfirmRemove"
      @cancel="cancelRemove"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import ConfirmationModal from "../ui/ConfirmationModal.vue";

const route = useRoute();

const { libraryItems } = defineProps({
  mediaType: {
    type: String,
    required: true,
    validator: (value) => ["game", "movie", "book", "show"].includes(value),
  },
  libraryItems: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "refresh-library",
  "show-details",
  "update-status",
  "remove-from-library",
  "update-quick-review",
]);

// Confirmation modal state
const confirmationModal = ref({
  isOpen: false,
  title: "",
  message: "",
  confirmText: "Remove",
  cancelText: "Cancel",
  itemToRemove: null,
});

const mediaTypeLabel = computed(() => {
  // Get the route name (e.g., 'games')
  const routeName = route.name;

  // Get the status from query parameters
  const status = route.query.status;

  // Map status values to display names
  const statusLabels = {
    playing: "Playing",
    completed: "Completed",
    want_to_play: "Want to Play",
    dropped: "Dropped",
    watching: "Watching",
    want_to_watch: "Want to Watch",
    watched: "Watched",
    reading: "Reading",
    want_to_read: "Want to Read",
    read: "Read",
  };

  // Capitalize first letter of route name
  const baseLabel = routeName
    ? routeName.charAt(0).toUpperCase() + routeName.slice(1)
    : "Media";

  // If there's a status and it's not 'all', append it
  if (status && status !== "all" && statusLabels[status]) {
    return `${statusLabels[status]}`;
  } else if (status === "all") {
    // If status is 'all', just return the base label
    return `All ${baseLabel}`;
  }

  // Default fallback - return the base label
  return baseLabel;
});

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

const getImageUrl = (item) => {
  return item.cover_url || item.poster_url || item.image_url;
};

const getDateField = (item) => {
  return item.release_date || item.publication_date || item.air_date;
};
</script>
