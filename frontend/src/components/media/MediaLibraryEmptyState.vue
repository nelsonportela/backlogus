<template>
  <div class="text-center text-gray-500 dark:text-gray-400 py-8">
    <div v-if="hasActiveFilters">
      <p class="mb-2">No items found matching your search criteria.</p>
      <button
        @click="$emit('clear-filters')"
        class="text-primary-600 dark:text-primary-400 hover:underline text-sm">
        Clear all filters
      </button>
    </div>
    <div v-else>
      No {{ mediaTypeLabel }} in your library yet. Search and add some
      {{ mediaTypeLabel }}!
    </div>
  </div>
</template>

<script setup>
defineProps({
  mediaTypeLabel: {
    type: String,
    required: true,
  },
  hasActiveFilters: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["clear-filters"]);
</script>
