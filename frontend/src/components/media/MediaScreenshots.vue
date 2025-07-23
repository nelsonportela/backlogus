<template>
  <div v-if="screenshots && screenshots.length > 0" class="space-y-4">
    <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
      Screenshots
    </h4>
    <div class="relative">
      <!-- Carousel Container -->
      <div
        class="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
      >
        <div
          class="flex transition-transform duration-300 ease-in-out"
          :style="{
            transform: `translateX(-${currentIndex * 100}%)`,
          }"
        >
          <img
            v-for="(screenshot, index) in screenshots"
            :key="index"
            :src="screenshot"
            :alt="`Screenshot ${index + 1}`"
            class="w-full h-64 sm:h-80 object-cover flex-shrink-0"
          />
        </div>

        <!-- Navigation Arrows -->
        <button
          v-if="screenshots.length > 1"
          @click="previousImage"
          class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          :disabled="currentIndex === 0"
          :class="{
            'opacity-50 cursor-not-allowed': currentIndex === 0,
          }"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          v-if="screenshots.length > 1"
          @click="nextImage"
          class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          :disabled="currentIndex === screenshots.length - 1"
          :class="{
            'opacity-50 cursor-not-allowed':
              currentIndex === screenshots.length - 1,
          }"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <!-- Image Counter -->
        <div
          class="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm"
        >
          {{ currentIndex + 1 }} / {{ screenshots.length }}
        </div>
      </div>

      <!-- Thumbnail Navigation -->
      <div
        v-if="screenshots.length > 1"
        class="flex justify-center mt-3 space-x-2 overflow-x-auto pb-2"
      >
        <button
          v-for="(screenshot, index) in screenshots"
          :key="index"
          @click="goToImage(index)"
          class="flex-shrink-0 relative overflow-hidden rounded border-2 transition-all"
          :class="{
            'border-primary-500 dark:border-primary-400':
              currentIndex === index,
            'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500':
              currentIndex !== index,
          }"
        >
          <img
            :src="screenshot"
            :alt="`Screenshot ${index + 1}`"
            class="w-16 h-10 sm:w-20 sm:h-12 object-cover"
          />
          <div
            v-if="currentIndex !== index"
            class="absolute inset-0 bg-black/30"
          ></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  screenshots: {
    type: Array,
    default: () => [],
  },
  autoReset: {
    type: Boolean,
    default: true,
  },
});

const currentIndex = ref(0);

const nextImage = () => {
  if (currentIndex.value < props.screenshots.length - 1) {
    currentIndex.value++;
  }
};

const previousImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const goToImage = (index) => {
  currentIndex.value = index;
};

// Reset when screenshots change (if autoReset is enabled)
watch(
  () => props.screenshots,
  () => {
    if (props.autoReset) {
      currentIndex.value = 0;
    }
  },
  { immediate: true }
);

// Expose methods for parent component control
defineExpose({
  goToImage,
  nextImage,
  previousImage,
  currentIndex,
});
</script>
