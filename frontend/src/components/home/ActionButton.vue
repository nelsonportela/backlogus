<template>
  <button
    @click="$emit('click')"
    class="group flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
  >
    <div class="w-12 h-12 mb-3 rounded-full bg-gradient-to-br flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200"
         :class="iconGradient">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconComponent" />
      </svg>
    </div>
    
    <div class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 text-center">
      {{ label }}
    </div>
    
    <div class="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">
      {{ description }}
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

defineEmits(['click']);

const iconComponent = computed(() => {
  const icons = {
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    library: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    random: 'M4 4l11.733 16h4.267L9.267 4H4zm8.267 0l6.733 9.333L20.267 4H12.267z'
  };
  
  return icons[props.icon] || icons.search;
});

const iconGradient = computed(() => {
  const gradients = {
    search: 'from-blue-500 to-purple-600',
    library: 'from-green-500 to-teal-600', 
    trending: 'from-orange-500 to-red-600',
    random: 'from-pink-500 to-purple-600'
  };
  return gradients[props.icon] || 'from-blue-500 to-purple-600';
});
</script>
