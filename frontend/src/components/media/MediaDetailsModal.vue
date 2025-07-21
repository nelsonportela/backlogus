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
        class="relative w-full max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto overflow-hidden text-left transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg max-h-[90vh] flex flex-col"
      >
        <!-- Header -->
        <div class="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div class="flex items-center justify-between">
            <h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 truncate pr-2">
              {{ item?.name || "Media Details" }}
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
        <div v-if="item" class="overflow-y-auto flex-1">
          <!-- Hero Section -->
          <div
            class="relative h-48 sm:h-64 bg-gray-200 dark:bg-gray-700 overflow-hidden"
          >
            <!-- Banner Image (full height) -->
            <div class="absolute inset-0">
              <img
                v-if="item.banner_url"
                :src="item.banner_url"
                :alt="item.name || item.title"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center"
              >
                <span class="text-white text-sm sm:text-lg font-medium px-4 text-center">
                  {{ item.name || item.title }}
                </span>
              </div>
            </div>
            
            <!-- Gradient overlay from black at bottom to transparent at middle -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/100 via-black/30 to-transparent pointer-events-none"></div>

            <!-- Game Cover (left side, overlapping) -->
            <div class="absolute left-3 sm:left-6 top-12 sm:top-16 z-10">
              <img
                v-if="item.cover_url || item.poster_url || item.image_url"
                :src="item.cover_url || item.poster_url || item.image_url"
                :alt="item.name || item.title"
                class="w-16 h-24 sm:w-24 sm:h-36 object-cover rounded-lg shadow-xl border-2 border-white dark:border-gray-800 ring-2 ring-black/10 dark:ring-white/10"
              />
              <div
                v-else
                class="w-16 h-24 sm:w-24 sm:h-36 bg-gray-300 dark:bg-gray-600 rounded-lg shadow-xl border-2 border-white dark:border-gray-800 ring-2 ring-black/10 dark:ring-white/10 flex items-center justify-center"
              >
                <span
                  class="text-gray-500 dark:text-gray-400 text-xs text-center px-1"
                  >No Image</span
                >
              </div>
            </div>

            <!-- Quick Info Card (bottom right) -->
            <div
              class="absolute bottom-2 sm:bottom-4 right-2 sm:right-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 p-2 sm:p-4 max-w-[140px] sm:max-w-xs backdrop-blur-sm bg-white/95 dark:bg-gray-800/95"
            >
              <!-- <h5
                class="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm"
              >
                Quick Info
              </h5> -->
              <div class="space-y-1 text-xs">
                <!-- Rating/Score -->
                <div v-if="item.rating || item.score || item.total_rating">
                  <span class="text-gray-600 dark:text-gray-400">Rating:</span>
                  <span
                    class="font-medium ml-2 text-gray-900 dark:text-gray-100"
                  >
                    {{
                      Math.round(
                        (item.rating || item.score || item.total_rating) / 10,
                      )
                    }}/10
                  </span>
                </div>

                <!-- Release Year -->
                <div v-if="getDateField(item)">
                  <span class="text-gray-600 dark:text-gray-400"
                    >{{ getDateLabel() }}:</span
                  >
                  <span
                    class="font-medium ml-2 text-gray-900 dark:text-gray-100"
                  >
                    {{ new Date(getDateField(item)).getFullYear() }}
                  </span>
                </div>

                <!-- Duration/Length -->
                <div v-if="item.runtime || item.duration || item.playtime">
                  <span class="text-gray-600 dark:text-gray-400">
                    {{ getDurationLabel() }}:
                  </span>
                  <span
                    class="font-medium ml-2 text-gray-900 dark:text-gray-100"
                  >
                    {{
                      formatRuntime(
                        item.runtime || item.duration || item.playtime,
                      )
                    }}
                  </span>
                </div>

                <!-- Age Rating -->
                <div
                  v-if="
                    item.esrb_rating || item.age_rating || item.content_rating
                  "
                >
                  <span class="text-gray-600 dark:text-gray-400">Rating:</span>
                  <span
                    class="font-medium ml-2 text-gray-900 dark:text-gray-100"
                  >
                    {{
                      item.esrb_rating || item.age_rating || item.content_rating
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Details Section -->
          <div class="px-6 py-6 space-y-6">
            <!-- Title and Subtitle -->
            <div class="ml-32">
              <!-- Offset to account for the overlapping cover -->
              <h2
                class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1"
              >
                {{ item.name || item.title }}
              </h2>
              <p
                v-if="item.subtitle || item.tagline"
                class="text-lg text-gray-600 dark:text-gray-400 italic"
              >
                {{ item.subtitle || item.tagline }}
              </p>
            </div>

            <!-- Description/Summary -->
            <div v-if="item.summary || item.description || item.overview">
              <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Description
              </h4>
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                {{ item.summary || item.description || item.overview }}
              </p>
            </div>

            <!-- Genres/Categories -->
            <div v-if="item.genres && item.genres.length > 0">
              <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {{ getGenresLabel() }}
              </h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="genre in item.genres"
                  :key="genre"
                  class="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full"
                >
                  {{ genre }}
                </span>
              </div>
            </div>

            <!-- Platforms (for games) -->
            <div v-if="item.platforms && item.platforms.length > 0">
              <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Platforms
              </h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="platform in item.platforms"
                  :key="platform"
                  class="px-3 py-1 text-sm font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full"
                >
                  {{ platform }}
                </span>
              </div>
            </div>

            <!-- Key People Section -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Developer/Studio/Author -->
              <div v-if="item.developer || item.studio || item.author">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {{ getCreatorLabel() }}
                </h4>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ item.developer || item.studio || item.author }}
                </p>
              </div>

              <!-- Publisher/Production Company -->
              <div v-if="item.publisher || item.production_company">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {{ getPublisherLabel() }}
                </h4>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ item.publisher || item.production_company }}
                </p>
              </div>

              <!-- Director -->
              <div v-if="item.director">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Director
                </h4>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ item.director }}
                </p>
              </div>

              <!-- Cast/Actors -->
              <div v-if="item.cast && item.cast.length > 0">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Cast
                </h4>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ item.cast.slice(0, 3).join(", ") }}
                </p>
              </div>
            </div>

            <!-- Additional Details Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Language -->
              <div v-if="item.language || item.languages">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Language
                </h4>
                <p class="text-gray-700 dark:text-gray-300">
                  {{
                    Array.isArray(item.languages)
                      ? item.languages.join(", ")
                      : item.language || item.languages
                  }}
                </p>
              </div>

              <!-- Country/Region -->
              <div v-if="item.country || item.origin_country">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Country
                </h4>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ item.country || item.origin_country }}
                </p>
              </div>

              <!-- Series/Franchise -->
              <div v-if="item.series || item.franchise || item.collection">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Franchise
                </h4>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ item.series || item.franchise || item.collection }}
                </p>
              </div>

              <!-- Game Engine (for games) -->
              <div v-if="item.game_engine">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Engine
                </h4>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ item.game_engine }}
                </p>
              </div>

              <!-- ISBN (for books) -->
              <div v-if="item.isbn">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  ISBN
                </h4>
                <p class="text-gray-700 dark:text-gray-300 font-mono text-sm">
                  {{ item.isbn }}
                </p>
              </div>

              <!-- Pages (for books) -->
              <div v-if="item.pages">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Pages
                </h4>
                <p class="text-gray-700 dark:text-gray-300">{{ item.pages }}</p>
              </div>

              <!-- Budget/Box Office (for movies) -->
              <div v-if="item.budget">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Budget
                </h4>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ formatCurrency(item.budget) }}
                </p>
              </div>

              <div v-if="item.box_office || item.revenue">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Box Office
                </h4>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ formatCurrency(item.box_office || item.revenue) }}
                </p>
              </div>

              <!-- Number of Episodes/Seasons (for shows) -->
              <div v-if="item.seasons">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Seasons
                </h4>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ item.seasons }}
                </p>
              </div>

              <div v-if="item.episodes">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Episodes
                </h4>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ item.episodes }}
                </p>
              </div>

              <!-- Network/Channel (for shows) -->
              <div v-if="item.network || item.channel">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Network
                </h4>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ item.network || item.channel }}
                </p>
              </div>

              <!-- Website/External Links -->
              <div v-if="item.website || item.official_url">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Website
                </h4>
                <a
                  :href="item.website || item.official_url"
                  target="_blank"
                  class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                >
                  Official Website
                </a>
              </div>
            </div>

            <!-- Screenshots/Gallery (for games) -->
            <div v-if="item.screenshots && item.screenshots.length > 0">
              <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Screenshots
              </h4>
              <div class="relative">
                <!-- Carousel Container -->
                <div class="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  <div 
                    class="flex transition-transform duration-300 ease-in-out"
                    :style="{ transform: `translateX(-${currentScreenshotIndex * 100}%)` }"
                  >
                    <img
                      v-for="(screenshot, index) in item.screenshots"
                      :key="index"
                      :src="screenshot"
                      :alt="`Screenshot ${index + 1}`"
                      class="w-full h-64 sm:h-80 object-cover flex-shrink-0"
                    />
                  </div>
                  
                  <!-- Navigation Arrows -->
                  <button
                    v-if="item.screenshots.length > 1"
                    @click="previousScreenshot"
                    class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    :disabled="currentScreenshotIndex === 0"
                    :class="{ 'opacity-50 cursor-not-allowed': currentScreenshotIndex === 0 }"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  
                  <button
                    v-if="item.screenshots.length > 1"
                    @click="nextScreenshot"
                    class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    :disabled="currentScreenshotIndex === item.screenshots.length - 1"
                    :class="{ 'opacity-50 cursor-not-allowed': currentScreenshotIndex === item.screenshots.length - 1 }"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                  
                  <!-- Image Counter -->
                  <div class="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {{ currentScreenshotIndex + 1 }} / {{ item.screenshots.length }}
                  </div>
                </div>
                
                <!-- Thumbnail Navigation -->
                <div v-if="item.screenshots.length > 1" class="flex justify-center mt-3 space-x-2 overflow-x-auto pb-2">
                  <button
                    v-for="(screenshot, index) in item.screenshots"
                    :key="index"
                    @click="goToScreenshot(index)"
                    class="flex-shrink-0 relative overflow-hidden rounded border-2 transition-all"
                    :class="{
                      'border-primary-500 dark:border-primary-400': currentScreenshotIndex === index,
                      'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500': currentScreenshotIndex !== index
                    }"
                  >
                    <img
                      :src="screenshot"
                      :alt="`Screenshot ${index + 1}`"
                      class="w-16 h-10 sm:w-20 sm:h-12 object-cover"
                    />
                    <div 
                      v-if="currentScreenshotIndex !== index"
                      class="absolute inset-0 bg-black/30"
                    ></div>
                  </button>
                </div>
              </div>
            </div>

            <!-- User Notes (if in library) -->
            <div v-if="isInLibrary && item.notes">
              <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                My Notes
              </h4>
              <p
                class="text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border-l-4 border-yellow-400 dark:border-yellow-500"
              >
                {{ item.notes }}
              </p>
            </div>

            <!-- Current Status (if in user's library) -->
            <div
              v-if="isInLibrary"
              class="pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Library Status
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Status
                  </label>
                  <select
                    :value="currentStatus"
                    @change="updateItemStatus"
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

                <!-- My Rating (renamed from Quick Review) -->
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
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
                      :title="review.label"
                    >
                      <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          v-if="review.value === 'positive'"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        />
                        <path
                          v-else-if="review.value === 'negative'"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                        />
                        <path
                          v-else
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- User Platform (for games) -->
                <div v-if="mediaType === 'game'">
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Platform Played
                  </label>
                  <select
                    v-if="getUserPlatformOptions().length > 0"
                    :value="item.user_platform || ''"
                    @change="updateUserPlatform"
                    class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                  >
                    <option value="">Select platform</option>
                    <option
                      v-for="platform in getUserPlatformOptions()"
                      :key="platform"
                      :value="platform"
                    >
                      {{ platform }}
                    </option>
                  </select>
                  <div
                    v-else
                    class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm"
                  >
                    No platform information available
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3"
        >
          <button @click="closeModal" class="btn-secondary">Close</button>
          <button v-if="!isInLibrary" @click="openAddToLibraryModal" class="btn-primary">
            Add to Library
          </button>
          <button
            v-else
            @click="removeFromLibrary"
            class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-colors"
          >
            Remove from Library
          </button>
        </div>
      </div>
    </div>

    <!-- Add to Library Modal -->
    <AddToLibraryModal
      :is-open="showAddToLibraryModal"
      :item="item"
      :media-type="mediaType"
      @close="showAddToLibraryModal = false"
      @add-to-library="handleAddToLibrary"
    />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import AddToLibraryModal from "./AddToLibraryModal.vue";

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
    default: "game", // 'game', 'movie', 'book', etc.
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
  "update-status",
  "update-user-platform",
  "update-quick-review",
]);

// Add to Library Modal state
const showAddToLibraryModal = ref(false);

// Screenshot carousel state
const currentScreenshotIndex = ref(0);

const closeModal = () => {
  emit("close");
};

const addToLibrary = () => {
  emit("add-to-library", props.item);
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
  emit("update-status", props.item.id, event.target.value);
};

const updateUserPlatform = (event) => {
  emit("update-user-platform", props.item.id, event.target.value);
};

const toggleQuickReview = (reviewValue) => {
  // Toggle functionality: if the same rating is clicked, set to null
  const newReview =
    props.item.quick_review === reviewValue ? null : reviewValue;
  emit("update-quick-review", props.item.id, newReview);
};

// Screenshot carousel functions
const nextScreenshot = () => {
  if (props.item?.screenshots && currentScreenshotIndex.value < props.item.screenshots.length - 1) {
    currentScreenshotIndex.value++;
  }
};

const previousScreenshot = () => {
  if (currentScreenshotIndex.value > 0) {
    currentScreenshotIndex.value--;
  }
};

const goToScreenshot = (index) => {
  currentScreenshotIndex.value = index;
};

const formatRuntime = (minutes) => {
  if (!minutes) return "Unknown";
  const totalMinutes = parseInt(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const formatCurrency = (amount) => {
  if (!amount) return "Unknown";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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
      return "Release Date";
    case "movie":
      return "Release Date";
    case "show":
      return "Air Date";
    case "book":
      return "Publication Date";
    default:
      return "Date";
  }
};

const getDurationLabel = () => {
  switch (props.mediaType) {
    case "game":
      return "Playtime";
    case "movie":
    case "show":
      return "Runtime";
    case "book":
      return "Reading Time";
    default:
      return "Duration";
  }
};

const getCreatorLabel = () => {
  switch (props.mediaType) {
    case "game":
      return "Developer";
    case "movie":
    case "show":
      return "Studio";
    case "book":
      return "Author";
    default:
      return "Creator";
  }
};

const getPublisherLabel = () => {
  switch (props.mediaType) {
    case "game":
      return "Publisher";
    case "movie":
    case "show":
      return "Production Company";
    case "book":
      return "Publisher";
    default:
      return "Publisher";
  }
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
      // Reset carousel when modal opens
      currentScreenshotIndex.value = 0;
    } else {
      if (typeof document !== "undefined") {
        document.removeEventListener("keydown", handleKeydown);
        document.body.style.overflow = "";
      }
    }
  },
);

// Reset carousel when item changes
watch(
  () => props.item?.id,
  () => {
    currentScreenshotIndex.value = 0;
  },
);
</script>
