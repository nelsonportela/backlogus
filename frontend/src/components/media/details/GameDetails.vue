<template>
  <div class="space-y-6">
    <!-- Platforms -->
    <div v-if="item.platforms && item.platforms.length > 0">
      <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Platforms
      </h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="platform in item.platforms"
          :key="platform"
          class="px-3 py-1 text-sm font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full">
          {{ platform }}
        </span>
      </div>
    </div>

    <!-- Key People Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Developer -->
      <div v-if="item.developer">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Developer
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.developer }}
        </p>
      </div>

      <!-- Publisher -->
      <div v-if="item.publisher">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Publisher
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.publisher }}
        </p>
      </div>
    </div>

    <!-- Additional Game Details -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Game Engine -->
      <div v-if="item.game_engine">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Engine
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.game_engine }}
        </p>
      </div>

      <!-- Franchise -->
      <div v-if="item.franchise">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Franchise
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.franchise }}
        </p>
      </div>

      <!-- ESRB Rating -->
      <div v-if="item.esrb_rating">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          ESRB Rating
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.esrb_rating }}
        </p>
      </div>

      <!-- Website -->
      <div v-if="item.website">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Website
        </h4>
        <a
          :href="item.website"
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
