<template>
  <div class="space-y-6">
    <!-- Two Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left Column: Cast -->
      <div>
        <!-- Cast -->
        <div v-if="item.cast && item.cast.length > 0">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Cast
          </h4>
          <div class="space-y-3">
            <div
              v-for="actor in item.cast.slice(0, 5)"
              :key="actor.name"
              class="flex items-center space-x-3">
              <!-- Actor Profile Image -->
              <div
                class="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                <img
                  v-if="actor.profile_path"
                  :src="actor.profile_path"
                  :alt="actor.name"
                  class="w-full h-full object-cover"
                  @error="$event.target.style.display = 'none'" />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                  {{ actor.name.charAt(0) }}
                </div>
              </div>
              <!-- Actor Info -->
              <div class="min-w-0 flex-1">
                <p
                  class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {{ actor.name }}
                </p>
                <p
                  v-if="actor.character"
                  class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  as {{ actor.character }}
                </p>
              </div>
            </div>
            <p
              v-if="item.cast.length > 5"
              class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              and {{ item.cast.length - 5 }} more...
            </p>
          </div>
        </div>
      </div>

      <!-- Right Column: Show Info -->
      <div class="space-y-4">
        <!-- Creators -->
        <div v-if="item.creators && item.creators.length > 0">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Creators
          </h4>
          <p class="text-gray-700 dark:text-gray-300">
            {{ item.creators.join(", ") }}
          </p>
        </div>

        <!-- Networks -->
        <div v-if="item.networks && item.networks.length > 0">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {{ item.networks.length > 1 ? "Networks" : "Network" }}
          </h4>
          <p class="text-gray-700 dark:text-gray-300">
            {{ item.networks.join(", ") }}
          </p>
        </div>

        <!-- Original Language -->
        <div v-if="item.original_language">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Language
          </h4>
          <p class="text-gray-700 dark:text-gray-300">
            {{ item.original_language.toUpperCase() }}
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
            class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">
            Official Website
          </a>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Single Row -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <!-- Seasons -->
      <div v-if="item.seasons">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Seasons
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.seasons }}
        </p>
      </div>

      <!-- Episodes -->
      <div v-if="item.episodes">
        <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Episodes
        </h4>
        <p class="text-gray-700 dark:text-gray-300">
          {{ item.episodes }}
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
