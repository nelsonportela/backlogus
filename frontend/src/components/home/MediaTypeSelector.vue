<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Dashboard View
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Choose which media type to focus on, or view all
        </p>
      </div>

      <!-- Desktop: Button Group -->
      <div
        class="hidden sm:flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          v-for="mediaType in availableMediaTypes"
          :key="mediaType.value"
          @click="$emit('update:modelValue', mediaType.value)"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
            modelValue === mediaType.value
              ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
              : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400',
          ]">
          <span class="flex items-center space-x-2">
            <span>{{ mediaType.emoji }}</span>
            <span>{{ mediaType.label }}</span>
          </span>
        </button>
      </div>

      <!-- Mobile: Dropdown -->
      <div class="sm:hidden">
        <label for="media-type-select" class="sr-only">Select Media Type</label>
        <select
          id="media-type-select"
          :value="modelValue"
          @change="$emit('update:modelValue', $event.target.value)"
          class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option
            v-for="mediaType in availableMediaTypes"
            :key="mediaType.value"
            :value="mediaType.value">
            {{ mediaType.emoji }} {{ mediaType.label }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

defineEmits(["update:modelValue"]);

// Media type configuration
const availableMediaTypes = [
  {
    value: "all",
    label: "All Media",
    emoji: "📚",
  },
  {
    value: "games",
    label: "Games",
    emoji: "🎮",
  },
  {
    value: "movies",
    label: "Movies",
    emoji: "🎬",
  },
  {
    value: "shows",
    label: "TV Shows",
    emoji: "📺",
  },
];
</script>
