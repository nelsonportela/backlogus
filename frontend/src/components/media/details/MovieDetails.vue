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

    <!-- Additional Movie Details -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Original Language -->
      <div v-if="item.original_language">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Language
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.original_language }}
        </p>
      </div>

      <!-- Certification -->
      <div v-if="item.certification">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Rating
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.certification }}
        </p>
      </div>

      <!-- Budget -->
      <div v-if="item.budget">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Budget
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ formatCurrency(item.budget) }}
        </p>
      </div>

      <!-- Revenue/Box Office -->
      <div v-if="item.revenue">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Box Office
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ formatCurrency(item.revenue) }}
        </p>
      </div>

      <!-- Homepage -->
      <div v-if="item.homepage">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Website
        </h4>
        <a
          :href="item.homepage"
          target="_blank"
          class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
        >
          Official Website
        </a>
      </div>

      <!-- IMDB -->
      <div v-if="item.imdb_id">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          IMDB
        </h4>
        <a
          :href="`https://www.imdb.com/title/${item.imdb_id}/`"
          target="_blank"
          class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
        >
          View on IMDB
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

const formatCurrency = (amount) => {
  if (!amount) return "Unknown";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
</script>
