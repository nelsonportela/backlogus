<template>
  <div class="space-y-6">
    <!-- Key People Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Director -->
      <div v-if="item.director">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Director
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.director }}
        </p>
      </div>

      <!-- Cast -->
      <div v-if="item.cast && item.cast.length > 0">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Cast
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.cast.slice(0, 3).join(", ") }}
        </p>
      </div>
    </div>

    <!-- Additional Show Details -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Seasons -->
      <div v-if="item.seasons">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Seasons
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.seasons }}
        </p>
      </div>

      <!-- Episodes -->
      <div v-if="item.episodes">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Episodes
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.episodes }}
        </p>
      </div>

      <!-- Network -->
      <div v-if="item.network || item.channel">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Network
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.network || item.channel }}
        </p>
      </div>

      <!-- Original Language -->
      <div v-if="item.original_language">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Language
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.original_language }}
        </p>
      </div>

      <!-- Country -->
      <div v-if="item.origin_country">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Country
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.origin_country }}
        </p>
      </div>

      <!-- Website -->
      <div v-if="item.official_url">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Website
        </h4>
        <a
          :href="item.official_url"
          target="_blank"
          class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">
          Official Website
        </a>
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
</script>
