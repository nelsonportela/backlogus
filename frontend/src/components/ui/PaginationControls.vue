<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between mt-6">
    <div class="text-sm text-gray-500 dark:text-gray-400">
      Showing {{ startItem }} to {{ endItem }} of {{ totalItems }} items
    </div>

    <div class="flex items-center space-x-2">
      <!-- Previous Button -->
      <button
        @click="$emit('page-change', currentPage - 1)"
        :disabled="currentPage === 1"
        :class="[
          'px-3 py-2 rounded-md text-sm font-medium transition-colors',
          currentPage === 1
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
        ]">
        Previous
      </button>

      <!-- Page Numbers -->
      <div class="flex space-x-1">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="$emit('page-change', page)"
          :class="[
            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
            page === currentPage
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
          ]">
          {{ page }}
        </button>
      </div>

      <!-- Next Button -->
      <button
        @click="$emit('page-change', currentPage + 1)"
        :disabled="currentPage === totalPages"
        :class="[
          'px-3 py-2 rounded-md text-sm font-medium transition-colors',
          currentPage === totalPages
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
        ]">
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    required: true,
  },
});

defineEmits(["page-change"]);

const startItem = computed(
  () => (props.currentPage - 1) * props.itemsPerPage + 1
);
const endItem = computed(() =>
  Math.min(props.currentPage * props.itemsPerPage, props.totalItems)
);

const visiblePages = computed(() => {
  const pages = [];
  const total = props.totalPages;
  const current = props.currentPage;

  // Always show first page
  if (total > 0) pages.push(1);

  // Show pages around current page
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    if (!pages.includes(i)) pages.push(i);
  }

  // Always show last page
  if (total > 1 && !pages.includes(total)) pages.push(total);

  return pages.sort((a, b) => a - b);
});
</script>
