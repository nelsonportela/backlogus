<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    @click.self="closeModal"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all"
    >
      <div class="text-center">
        <div
          class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </div>

        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Game Suggestion
        </h3>

        <div v-if="!randomGame" class="text-gray-600 dark:text-gray-400 mb-6">
          <p>No games in your "Want to Play" list!</p>
          <p class="text-sm mt-2">Add some games to your library first.</p>
        </div>

        <div v-else class="mb-6">
          <div class="flex items-center justify-center space-x-4 mb-4">
            <img
              v-if="randomGame.cover_url"
              :src="randomGame.cover_url"
              :alt="randomGame.name"
              class="w-16 h-20 rounded-lg object-cover shadow-md"
            />
            <div class="flex-1 text-left">
              <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {{ randomGame.name }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {{
                  randomGame.genres?.slice(0, 2).join(", ") ||
                  "No genres listed"
                }}
              </p>
              <div
                class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400"
              >
                <span v-if="randomGame.release_date">
                  {{ formatYear(randomGame.release_date) }}
                </span>
                <span v-if="randomGame.developer">
                  • {{ randomGame.developer }}
                </span>
              </div>
            </div>
          </div>

          <p class="text-purple-600 dark:text-purple-400 font-medium">
            How about playing this one? 🎮
          </p>
        </div>

        <div class="flex space-x-3">
          <button
            @click="closeModal"
            class="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Maybe Later
          </button>

          <button
            v-if="randomGame"
            @click="startPlaying"
            class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
          >
            Let's Play! 🚀
          </button>

          <button
            v-else
            @click="goToGames"
            class="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105"
          >
            Browse Games
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
  randomGame: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "start-playing", "go-to-games"]);

const closeModal = () => {
  emit("close");
};

const startPlaying = () => {
  emit("start-playing", props.randomGame);
  closeModal();
};

const goToGames = () => {
  emit("go-to-games");
  closeModal();
};

const formatYear = (dateString) => {
  return new Date(dateString).getFullYear();
};
</script>
