<template>
  <div
    class="absolute z-10 bottom-2 sm:bottom-4 right-2 sm:right-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 p-2 sm:p-4 max-w-[140px] sm:max-w-xs backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
    <div class="space-y-1 text-xs">
      <!-- Rating/Score -->
      <div v-if="displayRating">
        <span class="text-gray-600 dark:text-gray-400">Score:</span>
        <span class="font-medium ml-2 text-gray-900 dark:text-gray-100">
          {{ displayRating }}
        </span>
      </div>

      <!-- Release Year -->
      <div v-if="getDateField(item)">
        <span class="text-gray-600 dark:text-gray-400"
          >{{ getDateLabel() }}:</span
        >
        <span class="font-medium ml-2 text-gray-900 dark:text-gray-100">
          {{ new Date(getDateField(item)).toLocaleString("en-UK", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          }) }}
        </span>
      </div>

      <!-- Duration/Length -->
      <div v-if="item.runtime || item.duration || item.playtime">
        <span class="text-gray-600 dark:text-gray-400">
          {{ getDurationLabel() }}:
        </span>
        <span class="font-medium ml-2 text-gray-900 dark:text-gray-100">
          {{ formatRuntime(item.runtime || item.duration || item.playtime) }}
        </span>
      </div>

      <!-- Age Rating -->
      <div
        v-if="
          item.esrb_rating ||
          item.age_rating ||
          item.content_rating ||
          item.certification
        ">
        <span class="text-gray-600 dark:text-gray-400">Rating:</span>
        <span class="font-medium ml-2 text-gray-900 dark:text-gray-100">
          {{
            item.esrb_rating ||
            item.age_rating ||
            item.content_rating ||
            item.certification
          }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  mediaType: {
    type: String,
    required: true,
  },
});

const displayRating = computed(() => {
  const rating =
    props.item.rating ||
    props.item.score ||
    props.item.total_rating ||
    props.item.vote_average;

  if (!rating) return null;

  // Different rating systems for different media types
  switch (props.mediaType) {
    case "movie":
    case "show":
      // TMDB ratings are already 0-10 scale (e.g., 6.5)
      return `${rating.toFixed(1)}/10`;
    case "game":
      // IGDB ratings are 0-100 scale, need to convert to 0-10
      return `${Math.round(rating / 10)}/10`;
    case "book":
      // Books might use different scales, handle accordingly
      return rating > 10
        ? `${Math.round(rating / 10)}/10`
        : `${rating.toFixed(1)}/10`;
    default:
      // Default: assume 0-10 scale
      return `${rating.toFixed(1)}/10`;
  }
});

const formatRuntime = (minutes) => {
  if (!minutes) return "Unknown";
  const totalMinutes = parseInt(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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
      return "Release";
    case "movie":
      return "Release";
    case "show":
      return "Air Date";
    case "book":
      return "Publication";
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
</script>
