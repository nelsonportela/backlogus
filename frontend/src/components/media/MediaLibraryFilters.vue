<template>
  <div class="space-y-4 mb-6">
    <!-- Library Search Bar -->
    <div class="relative">
      <div
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          class="w-5 h-5 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        type="text"
        :placeholder="`Search ${mediaType}s in your library...`"
        class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400" />
      <button
        v-if="searchQuery"
        @click="$emit('clear-search')"
        class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <svg
          class="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Sort and Filter Controls -->
    <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
      <!-- Sort Dropdown -->
      <div class="flex-shrink-0">
        <select
          :value="sortBy"
          @change="$emit('update:sortBy', $event.target.value)"
          class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 text-sm">
          <option
            v-for="option in sortOptions"
            :key="option.value"
            :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Platform Filter (for games) -->
      <div
        v-if="mediaType === 'game' && availablePlatforms.length > 0"
        class="flex-shrink-0">
        <select
          :value="platformFilter"
          @change="$emit('update:platformFilter', $event.target.value)"
          class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 text-sm">
          <option value="">All Platforms</option>
          <option
            v-for="platform in availablePlatforms"
            :key="platform"
            :value="platform">
            {{ platform }}
          </option>
        </select>
      </div>

      <!-- Items per page -->
      <div class="flex-shrink-0 sm:ml-auto">
        <select
          :value="itemsPerPage"
          @change="$emit('update:itemsPerPage', parseInt($event.target.value))"
          class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 text-sm">
          <option :value="20">20 per page</option>
          <option :value="40">40 per page</option>
          <option :value="60">60 per page</option>
          <option :value="100">100 per page</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  mediaType: {
    type: String,
    required: true,
    validator: (value) => ["game", "movie", "book", "show"].includes(value),
  },
  searchQuery: {
    type: String,
    default: "",
  },
  sortBy: {
    type: String,
    default: "name_asc",
  },
  platformFilter: {
    type: String,
    default: "",
  },
  itemsPerPage: {
    type: Number,
    default: 20,
  },
  libraryItems: {
    type: Array,
    default: () => [],
  },
});

defineEmits([
  "update:searchQuery",
  "update:sortBy",
  "update:platformFilter",
  "update:itemsPerPage",
  "clear-search",
]);

const sortOptions = computed(() => {
  const baseOptions = [
    { value: "name_asc", label: "Name (A-Z)" },
    { value: "name_desc", label: "Name (Z-A)" },
    { value: "date_added_desc", label: "Recently Added" },
    { value: "date_added_asc", label: "Oldest First" },
  ];

  // Add media-specific options
  if (props.mediaType === "game") {
    baseOptions.push(
      { value: "release_date_desc", label: "Release Date (Newest)" },
      { value: "release_date_asc", label: "Release Date (Oldest)" },
      { value: "rating_desc", label: "Highest Rated" },
      { value: "rating_asc", label: "Lowest Rated" }
    );
  } else if (props.mediaType === "movie") {
    baseOptions.push(
      { value: "release_date_desc", label: "Release Date (Newest)" },
      { value: "release_date_asc", label: "Release Date (Oldest)" },
      { value: "rating_desc", label: "Highest Rated" }
    );
  } else if (props.mediaType === "book") {
    baseOptions.push(
      { value: "publication_date_desc", label: "Publication Date (Newest)" },
      { value: "publication_date_asc", label: "Publication Date (Oldest)" },
      { value: "author_asc", label: "Author (A-Z)" }
    );
  }

  return baseOptions;
});

const availablePlatforms = computed(() => {
  if (props.mediaType !== "game") return [];

  const platforms = new Set();
  props.libraryItems.forEach((item) => {
    if (item.user_platform) {
      platforms.add(item.user_platform);
    }
    if (item.platforms && Array.isArray(item.platforms)) {
      item.platforms.forEach((platform) => platforms.add(platform));
    }
  });

  return Array.from(platforms).sort();
});
</script>
