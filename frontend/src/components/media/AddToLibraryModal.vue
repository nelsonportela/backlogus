<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click.self="closeModal"
  >
    <div
      class="flex items-center justify-center min-h-screen px-4 py-4"
    >
      <!-- Background overlay -->
      <div
        class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
        @click="closeModal"
      ></div>

      <!-- Modal panel -->
      <div
        class="relative w-full max-w-xs sm:max-w-md mx-auto overflow-hidden text-left transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg max-h-[90vh] flex flex-col"
      >
        <!-- Header -->
        <div class="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div class="flex items-center justify-between">
            <h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 pr-2 truncate">
              Add "{{ item?.name || item?.title }}" to Library
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:text-gray-600 dark:focus:text-gray-300 transition-colors flex-shrink-0"
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

        <!-- Content -->
        <div v-if="item" class="px-4 sm:px-6 py-4 sm:py-6 space-y-4 overflow-y-auto flex-1">
          <!-- Game info preview -->
          <div class="flex items-center space-x-3 mb-4 sm:mb-6">
            <img
              v-if="getImageUrl(item)"
              :src="getImageUrl(item)"
              :alt="item.name || item.title"
              class="w-16 h-20 object-cover rounded-md"
            />
            <div
              v-else
              class="w-16 h-20 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center"
            >
              <span class="text-gray-400 dark:text-gray-500 text-xs">No Image</span>
            </div>
            <div class="flex-1">
              <h4 class="font-medium text-gray-900 dark:text-gray-100">
                {{ item.name || item.title }}
              </h4>
              <p v-if="getDateField(item)" class="text-sm text-gray-500 dark:text-gray-400">
                {{ getDateLabel() }}: {{ new Date(getDateField(item)).getFullYear() }}
              </p>
              <p v-if="item.genres && item.genres.length > 0" class="text-sm text-gray-500 dark:text-gray-400">
                {{ item.genres.slice(0, 2).join(", ") }}
              </p>
            </div>
          </div>

          <!-- Status Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status *
            </label>
            <select
              v-model="selectedStatus"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
            >
              <option
                v-for="status in getStatusOptions()"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </div>

          <!-- My Rating -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              My Rating (optional)
            </label>
            <div class="flex items-center space-x-2">
              <button
                v-for="review in getQuickReviewOptions()"
                :key="review.value"
                @click="toggleQuickReview(review.value)"
                :class="[
                  'p-2 rounded-md transition-colors text-lg border',
                  selectedReview === review.value
                    ? 'bg-primary-100 dark:bg-primary-900/50 border-primary-500 dark:border-primary-400 ring-1 ring-primary-500 dark:ring-primary-400'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
                ]"
                :title="review.label"
              >
                {{ review.emoji }}
              </button>
              <button
                v-if="selectedReview"
                @click="selectedReview = null"
                class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline"
              >
                Clear
              </button>
            </div>
          </div>

          <!-- Platform Selection (for games) -->
          <div v-if="mediaType === 'game' && getPlatformOptions().length > 0">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platform Played (optional)
            </label>
            <select
              v-model="selectedPlatform"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
            >
              <option value="">Select platform (optional)</option>
              <option
                v-for="platform in getPlatformOptions()"
                :key="platform"
                :value="platform"
              >
                {{ platform }}
              </option>
            </select>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              v-model="selectedNotes"
              rows="3"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
              placeholder="Add any notes about this item..."
            ></textarea>
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3"
        >
          <button @click="closeModal" class="btn-secondary">Cancel</button>
          <button @click="addToLibrary" class="btn-primary" :disabled="!selectedStatus">
            Add to Library
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

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
});

const emit = defineEmits(["close", "add-to-library"]);

// Form state
const selectedStatus = ref("want_to_play");
const selectedReview = ref(null);
const selectedPlatform = ref("");
const selectedNotes = ref("");

const closeModal = () => {
  emit("close");
};

const addToLibrary = () => {
  const libraryData = {
    item: props.item,
    status: selectedStatus.value,
    quick_review: selectedReview.value,
    user_platform: selectedPlatform.value || null,
    notes: selectedNotes.value || null,
  };
  
  emit("add-to-library", libraryData);
  closeModal();
};

const toggleQuickReview = (reviewValue) => {
  selectedReview.value = selectedReview.value === reviewValue ? null : reviewValue;
};

const getImageUrl = (item) => {
  return item.cover_url || item.poster_url || item.image_url;
};

const getDateField = (item) => {
  return (
    item.release_date ||
    item.publication_date ||
    item.air_date ||
    item.premiere_date
  );
};

const getDateLabel = () => {
  switch (props.mediaType) {
    case "game":
      return "Released";
    case "movie":
      return "Released";
    case "show":
      return "Aired";
    case "book":
      return "Published";
    default:
      return "Date";
  }
};

const getStatusOptions = () => {
  switch (props.mediaType) {
    case "game":
      return [
        { value: "want_to_play", label: "Want to Play" },
        { value: "playing", label: "Playing" },
        { value: "completed", label: "Completed" },
        { value: "dropped", label: "Dropped" },
      ];
    case "movie":
      return [
        { value: "want_to_watch", label: "Want to Watch" },
        { value: "watched", label: "Watched" },
      ];
    case "book":
      return [
        { value: "want_to_read", label: "Want to Read" },
        { value: "reading", label: "Reading" },
        { value: "read", label: "Read" },
        { value: "dropped", label: "Dropped" },
      ];
    case "show":
      return [
        { value: "want_to_watch", label: "Want to Watch" },
        { value: "watching", label: "Watching" },
        { value: "watched", label: "Watched" },
        { value: "dropped", label: "Dropped" },
      ];
    default:
      return [
        { value: "want", label: "Want" },
        { value: "current", label: "Current" },
        { value: "completed", label: "Completed" },
      ];
  }
};

const getQuickReviewOptions = () => {
  return [
    { value: "negative", emoji: "👎", label: "Disliked" },
    { value: "neutral", emoji: "😐", label: "It was okay" },
    { value: "positive", emoji: "👍", label: "Liked it" },
  ];
};

const getPlatformOptions = () => {
  if (!props.item?.platforms || !Array.isArray(props.item.platforms)) {
    return [];
  }
  return props.item.platforms;
};

// Reset form when modal opens with a new item
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      // Set default status based on media type
      selectedStatus.value = props.mediaType === "game" ? "want_to_play" : "want_to_watch";
      selectedReview.value = null;
      selectedPlatform.value = "";
      selectedNotes.value = "";
      
      // Prevent body scrolling
      if (typeof document !== "undefined") {
        document.body.style.overflow = "hidden";
      }
    } else {
      // Restore body scrolling
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    }
  },
);
</script>
