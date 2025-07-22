<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200"
  >
    <div v-if="loading" class="animate-pulse">
      <div class="flex items-center justify-between mb-4">
        <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div class="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div class="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div class="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-4">
        <div
          class="w-12 h-12 rounded-lg flex items-center justify-center text-white"
          :class="iconBgClass"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path :d="iconComponent" />
          </svg>
        </div>
        <div
          class="px-2 py-1 rounded-full text-xs font-medium"
          :class="changeBadgeClass"
        >
          {{ change }}
        </div>
      </div>

      <div class="mb-1">
        <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ formattedValue }}
        </div>
      </div>

      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String],
    default: 0,
  },
  change: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    default: "blue",
    validator: (value) =>
      ["blue", "green", "purple", "yellow", "red"].includes(value),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const iconComponent = computed(() => {
  const icons = {
    collection:
      "M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z",
    play: "M8 5v14l11-7z",
    check: "M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z",
    bookmark: "M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z",
  };

  return icons[props.icon] || icons.collection;
});

const iconBgClass = computed(() => {
  const classes = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };
  return classes[props.color];
});

const changeBadgeClass = computed(() => {
  const classes = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    green:
      "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    purple:
      "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
    yellow:
      "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
    red: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  };
  return classes[props.color];
});

const formattedValue = computed(() => {
  if (typeof props.value === "number") {
    return props.value.toLocaleString();
  }
  return props.value;
});
</script>
