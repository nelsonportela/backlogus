<template>
  <div
    class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
    <div
      v-if="loading"
      class="animate-pulse flex items-center justify-between w-full">
      <div class="flex items-center space-x-3">
        <div class="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div class="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div class="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>

    <div v-else class="flex items-center justify-between w-full">
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-2">
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
            :class="rankColor">
            {{ rank }}
          </div>
          <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ genre.name }}
          </span>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ genre.count }} games
        </div>

        <!-- Progress bar -->
        <div class="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all duration-500"
            :class="progressColor"
            :style="{ width: progressWidth }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  genre: {
    type: Object,
    required: true,
  },
  rank: {
    type: Number,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const rankColor = computed(() => {
  const colors = [
    "bg-yellow-500", // 1st place - gold
    "bg-gray-400", // 2nd place - silver
    "bg-amber-600", // 3rd place - bronze
    "bg-blue-500", // 4th place
    "bg-purple-500", // 5th place
  ];
  return colors[props.rank - 1] || "bg-gray-500";
});

const progressColor = computed(() => {
  const colors = [
    "bg-yellow-500", // 1st place
    "bg-gray-400", // 2nd place
    "bg-amber-600", // 3rd place
    "bg-blue-500", // 4th place
    "bg-purple-500", // 5th place
  ];
  return colors[props.rank - 1] || "bg-gray-500";
});

const progressWidth = computed(() => {
  // Assume max count for percentage calculation
  // This would ideally be passed as a prop
  const maxCount = 10; // This should be the highest count among all genres
  const percentage = Math.min((props.genre.count / maxCount) * 100, 100);
  return `${percentage}%`;
});
</script>
