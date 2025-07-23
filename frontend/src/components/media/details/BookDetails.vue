<template>
  <div class="space-y-6">
    <!-- Key People Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Author -->
      <div v-if="item.author">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Author
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.author }}
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

    <!-- Additional Book Details -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- ISBN -->
      <div v-if="item.isbn">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          ISBN
        </h4>
        <p class="text-gray-700 dark:text-gray-300 font-mono text-sm">
          {{ item.isbn }}
        </p>
      </div>

      <!-- Pages -->
      <div v-if="item.pages">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Pages
        </h4>
        <p class="text-gray-700 dark:text-gray-300">{{ item.pages }}</p>
      </div>

      <!-- Language -->
      <div v-if="item.language">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Language
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.language }}
        </p>
      </div>

      <!-- Series -->
      <div v-if="item.series">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Series
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.series }}
        </p>
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
