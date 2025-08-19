<template>
  <div class="space-y-6">
    <!-- Alternative Titles -->
    <div v-if="(item.alternative_titles || item.alternativeTitles) && (item.alternative_titles || item.alternativeTitles)?.length > 0">
      <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Alternative Titles
      </h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="title in (item.alternative_titles || item.alternativeTitles)"
          :key="title"
          class="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg">
          {{ title }}
        </span>
      </div>
    </div>

    <!-- Authors Section -->
    <div v-if="item.authors && item.authors.length > 0">
      <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Authors & Contributors
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="author in item.authors"
          :key="author.name"
          class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span class="text-gray-700 dark:text-gray-300">{{
            author.name
          }}</span>
          <span
            class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full">
            {{ author.role }}
          </span>
        </div>
      </div>
    </div>

    <!-- Series & Genres -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Series -->
      <div v-if="(item.series_names || item.seriesNames) && (item.series_names || item.seriesNames)?.length > 0">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Series
        </h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="series in (item.series_names || item.seriesNames)"
            :key="series"
            class="px-3 py-1 text-sm font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 rounded-full">
            {{ series }}
            <span 
              v-if="(item.series_position || item.seriesPosition) && (item.series_names || item.seriesNames).indexOf(series) === 0"
              class="ml-1 text-xs opacity-75">
              #{{ item.series_position || item.seriesPosition }}
            </span>
          </span>
        </div>
      </div>

      <!-- Genres -->
      <div v-if="item.genres && item.genres.length > 0">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Genres
        </h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="genre in item.genres"
            :key="genre"
            class="px-3 py-1 text-sm font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full">
            {{ genre }}
          </span>
        </div>
      </div>
    </div>

    <!-- Book Details Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Pages -->
      <div v-if="item.pages">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Pages
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.pages.toLocaleString() }}
        </p>
      </div>

      <!-- Release Date -->
      <div v-if="item.release_date || item.releaseDate">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Release Date
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ formatDate(item.release_date || item.releaseDate) }}
        </p>
      </div>

      <!-- Rating -->
      <div v-if="item.rating || item.average_rating || item.averageRating">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Average Rating
        </h4>
        <div class="flex items-center gap-2">
          <span class="text-gray-700 dark:text-gray-300"
            >{{ (item.rating || item.average_rating || item.averageRating).toFixed(1) }}/5</span
          >
          <div class="flex">
            <svg
              v-for="star in 5"
              :key="star"
              class="w-4 h-4"
              :class="
                star <= Math.round(item.rating || item.average_rating || item.averageRating)
                  ? 'text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              "
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Format Availability -->
    <div v-if="(item.has_audiobook || item.hasAudiobook) || (item.has_ebook || item.hasEbook)">
      <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Available Formats
      </h4>
      <div class="flex flex-wrap gap-2">
        <span
          class="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
          Physical Book
        </span>
        <span
          v-if="item.has_ebook || item.hasEbook"
          class="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full">
          E-book
        </span>
        <span
          v-if="item.has_audiobook || item.hasAudiobook"
          class="px-3 py-1 text-sm font-medium bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 rounded-full">
          Audiobook
        </span>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="item.tags && item.tags.length > 0">
      <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">Tags</h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in item.tags"
          :key="tag"
          class="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Moods -->
    <div v-if="item.moods && item.moods.length > 0">
      <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">Moods</h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="mood in item.moods"
          :key="mood"
          class="px-3 py-1 text-sm font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 rounded-full">
          {{ mood }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
});

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return "Unknown";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};
</script>
