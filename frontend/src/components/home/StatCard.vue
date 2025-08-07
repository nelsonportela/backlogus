<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200">
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
          :class="iconBgClass">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path :d="iconComponent" />
          </svg>
        </div>
        <div
          class="px-2 py-1 rounded-full text-xs font-medium"
          :class="changeBadgeClass">
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
      ["blue", "green", "purple", "yellow", "red", "pink"].includes(value),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const iconComponent = computed(() => {
  // Using Material Design Icons (MDI) SVG paths
  const icons = {
    library: "M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z",
    collection: "M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z",
    game: "M7.97 16L5 19C4.67 19.3 4.23 19.5 3.75 19.5A1.75 1.75 0 0 1 2 17.75V16.5C2 15.83 2.17 15.17 2.5 14.5C2.83 13.83 3.33 13.33 4 13L7.97 16M16.03 16L19 19C19.33 19.3 19.77 19.5 20.25 19.5A1.75 1.75 0 0 0 22 17.75V16.5C22 15.83 21.83 15.17 21.5 14.5C21.17 13.83 20.67 13.33 20 13L16.03 16M12 14C8.69 14 6 11.31 6 8S8.69 2 12 2 18 4.69 18 8 15.31 14 12 14M12 4C9.79 4 8 5.79 8 8S9.79 12 12 12 16 10.21 16 8 14.21 4 12 4M9 8C9 6.9 9.9 6 11 6S13 6.9 13 8 12.1 10 11 10 9 9.1 9 8M15 8C15 6.9 15.9 6 17 6S19 6.9 19 8 18.1 10 17 10 15 9.1 15 8Z",
    movie: "M18 4L20 8H17L15 4H13L15 8H12L10 4H8L10 8H7L5 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V4H18Z",
    tv: "M21 17H3V5H21M21 3H3C1.9 3 1 3.9 1 5V17C1 18.1 1.9 19 3 19H8V21H16V19H21C22.1 19 23 18.1 23 17V5C23 3.9 22.1 3 21 3Z",
    play: "M8 5.14V19.14L19 12.14L8 5.14Z",
    check: "M21 7L9 19L3.5 13.5L4.91 12.09L9 16.17L19.59 5.59L21 7Z",
    bookmark: "M17 18L12 15.82L7 18V5H17M17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.9 18.1 3 17 3Z",
    trending: "M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z",
    search: "M9.5 3C13.09 3 16 5.91 16 9.5C16 11.11 15.41 12.59 14.44 13.73L14.71 14H15.5L20.5 19L19 20.5L14 15.5V14.71L13.73 14.44C12.59 15.41 11.11 16 9.5 16C5.91 16 3 13.09 3 9.5C3 5.91 5.91 3 9.5 3M9.5 5C7.01 5 5 7.01 5 9.5C5 11.99 7.01 14 9.5 14C11.99 14 14 11.99 14 9.5C14 7.01 11.99 5 9.5 5Z",
    random: "M14.83 13.41L13.42 14.82L16.55 17.95L14.5 20H20V14.5L17.96 16.54L14.83 13.41M14.5 4L16.54 6.04L4 18.59L5.41 20L17.96 7.46L20 9.5V4H14.5M10.59 9.17L5.41 4L4 5.41L9.17 10.58L10.59 9.17Z",
  };

  return icons[props.icon] || icons.library;
});

const iconBgClass = computed(() => {
  const classes = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    pink: "bg-pink-500",
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
    pink: "bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400",
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
