<template>
  <div class="relative group cursor-pointer" @click="$emit('click', item)">
    <!-- Remove Button -->
    <button
      @click.stop="$emit('remove', item)"
      class="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full w-6 h-6 min-w-[24px] min-h-[24px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg flex-shrink-0"
      title="Remove from library">
      <svg
        class="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        stroke-width="3">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Cover Image Container -->
    <div
      class="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <!-- Always show a thumbnail/filler as the background -->
      <div
        class="w-full h-full absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700">
        <svg
          class="w-8 h-8 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <!-- Cover image overlays the thumbnail, fades in when loaded -->
      <img
        v-if="imageUrl && !imgError"
        :src="imageUrl"
        :alt="item.name || item.title"
        class="w-full h-full object-cover absolute inset-0 z-2 transition-opacity duration-300"
        :style="imgLoaded ? 'opacity:1;' : 'opacity:0;'"
        @load="imgLoaded = true"
        @error="imgError = true" />

      <!-- Full Cover Gradient Overlay (appears on hover) -->
      <div
        class="absolute z-3 inset-0 bg-gradient-to-t from-black/100 via-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <!-- Title Text (appears on hover) -->
      <div
        :class="
          imgLoaded
            ? 'absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
            : 'absolute bottom-0 left-0 right-0 p-3'
        ">
        <h4 class="text-white font-medium text-sm leading-tight">
          {{ item.name || item.title }}
        </h4>
        <p v-if="dateField" class="text-white/80 text-xs mt-1">
          {{ new Date(dateField).getFullYear() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

defineEmits(["click", "remove"]);

const imageUrl = computed(() => {
  return props.item.cover_url || props.item.poster_url || props.item.image_url;
});

const imgLoaded = ref(false);
const imgError = ref(false);

const dateField = computed(() => {
  return (
    props.item.release_date ||
    props.item.publication_date ||
    props.item.air_date ||
    props.item.first_air_date
  );
});
</script>
