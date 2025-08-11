<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    @click.self="closeModal">
    <div
      class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all">
      <div class="text-center">
        <div
          class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <svg
            class="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>

        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          TV Show Suggestion
        </h3>

        <div v-if="!randomShow" class="text-gray-600 dark:text-gray-400 mb-6">
          <p>No shows in your "Want to Watch" list!</p>
          <p class="text-sm mt-2">Add some TV shows to your library first.</p>
        </div>

        <div v-else class="mb-6">
          <div class="flex items-center justify-center space-x-4 mb-4">
            <img
              v-if="randomShow.cover_url"
              :src="randomShow.cover_url"
              :alt="randomShow.name"
              class="w-16 h-24 rounded-lg object-cover shadow-md" />
            <div class="flex-1 text-left">
              <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {{ randomShow.name }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {{
                  randomShow.genres?.slice(0, 2).join(", ") ||
                  "No genres listed"
                }}
              </p>
              <div
                class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span v-if="randomShow.first_air_date">
                  {{ formatYear(randomShow.first_air_date) }}
                </span>
                <span v-if="randomShow.number_of_seasons">
                  • {{ randomShow.number_of_seasons }} season{{ randomShow.number_of_seasons !== 1 ? 's' : '' }}
                </span>
              </div>
            </div>
          </div>

          <p class="text-purple-600 dark:text-purple-400 font-medium">
            How about binge-watching this one? 📺
          </p>
        </div>

        <div class="flex space-x-3">
          <button
            @click="closeModal"
            class="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            Maybe Later
          </button>

          <button
            v-if="randomShow"
            @click="startWatching"
            class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105">
            Let's Binge! 📺
          </button>

          <button
            v-else
            @click="goToShows"
            class="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105">
            Browse Shows
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  randomShow: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "start-watching", "go-to-shows"]);

const closeModal = () => {
  emit("close");
};

const startWatching = () => {
  emit("start-watching", props.randomShow);
  closeModal();
};

const goToShows = () => {
  emit("go-to-shows");
  closeModal();
};

const formatYear = (dateString) => {
  return new Date(dateString).getFullYear();
};
</script>
