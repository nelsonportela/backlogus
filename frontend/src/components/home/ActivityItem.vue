<template>
  <div
    class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
    <div
      v-if="loading"
      class="animate-pulse flex items-center space-x-3 w-full">
      <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div class="flex-1">
        <div class="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div class="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div class="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>

    <div v-else class="flex items-center space-x-3 w-full">
      <div class="relative">
        <img
          v-if="activity.coverUrl"
          :src="activity.coverUrl"
          :alt="activity.title"
          class="w-10 h-10 rounded-lg object-cover"
          @error="showFallbackIcon = true"
          :class="{ hidden: showFallbackIcon }" />
        <div
          v-if="!activity.coverUrl || showFallbackIcon"
          class="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
          {{ activity.title?.[0]?.toUpperCase() || "?" }}
        </div>

        <!-- Activity type indicator -->
        <div
          class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <svg
            class="w-2.5 h-2.5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <div
          class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {{ activity.title }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
          {{ activity.subtitle }}
        </div>
      </div>

      <div class="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
        {{ activity.time }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  activity: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const showFallbackIcon = ref(false);
</script>
