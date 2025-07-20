<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">
        My {{ mediaTypeLabel }} Library
      </h3>
      <button @click="refreshLibrary" class="btn-secondary text-sm">
        Refresh
      </button>
    </div>

    <div
      v-if="libraryItems.length === 0"
      class="text-center text-gray-500 py-8"
    >
      No {{ mediaTypeLabel.toLowerCase() }} in your library yet. Search and add
      some {{ mediaTypeLabel.toLowerCase() }}!
    </div>

    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
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
          class="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
          title="Remove from library"
        >
          ×
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
            class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
          >
            <svg
              class="w-8 h-8 text-gray-400"
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

          <!-- Quick Review Overlay -->
          <div
            v-if="item.quick_review"
            class="absolute top-2 left-2 bg-black bg-opacity-60 rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm"
            :title="getQuickReviewLabel(item.quick_review)"
          >
            <span class="text-lg">
              {{ getQuickReviewEmoji(item.quick_review) }}
            </span>
          </div>

          <!-- Platform Overlay -->
          <div
            v-if="item.user_platform"
            class="absolute top-2 right-2 bg-black bg-opacity-60 rounded px-2 py-1 backdrop-blur-sm"
          >
            <span class="text-xs text-white font-medium">
              {{ item.user_platform }}
            </span>
          </div>

          <!-- Title Overlay (appears on hover) -->
          <div
            class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3"
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
import ConfirmationModal from "../ui/ConfirmationModal.vue";

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
  const labels = {
    game: "Game",
    movie: "Movie",
    book: "Book",
    show: "Show",
  };
  return labels[props.mediaType] || "Media";
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

const getQuickReviewEmoji = (reviewValue) => {
  const emojis = {
    positive: "👍",
    neutral: "😐",
    negative: "👎",
  };
  return emojis[reviewValue] || "❓";
};

const getQuickReviewLabel = (reviewValue) => {
  const labels = {
    positive: "Liked it",
    neutral: "It was okay",
    negative: "Disliked",
  };
  return labels[reviewValue] || "No review";
};
</script>
