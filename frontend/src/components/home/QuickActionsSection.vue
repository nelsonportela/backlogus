<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
      Quick Actions
    </h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <ActionButton
        icon="search"
        label="Discover"
        :description="getDiscoverDescription()"
        @click="$emit('navigate-to-discover')" />
      <ActionButton
        icon="library"
        label="My Collection"
        :description="getCollectionDescription()"
        @click="$emit('navigate-to-collection')" />
      <ActionButton
        icon="trending"
        label="Trending"
        :description="getTrendingDescription()"
        @click="$emit('navigate-to-trending')" />
      <ActionButton
        icon="random"
        label="Surprise Me"
        :description="getRandomDescription()"
        @click="$emit('pick-random-item')" />
    </div>
  </div>
</template>

<script setup>
import { useMediaTypes } from '@/composables/useMediaTypes';
import ActionButton from '@/components/home/ActionButton.vue';

const props = defineProps({
  activeMediaType: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([
  'navigate-to-discover',
  'navigate-to-collection', 
  'navigate-to-trending',
  'pick-random-item'
]);

const { getMediaConfig } = useMediaTypes();

// Dynamic description methods for Quick Actions
const getDiscoverDescription = () => {
  if (props.activeMediaType === "all") return "Find new media";
  const config = getMediaConfig(props.activeMediaType);
  return `Discover new ${config?.name?.toLowerCase() || "media"}`;
};

const getCollectionDescription = () => {
  if (props.activeMediaType === "all") return "View all items";
  const config = getMediaConfig(props.activeMediaType);
  return `Your ${config?.name?.toLowerCase() || "media"} library`;
};

const getTrendingDescription = () => {
  if (props.activeMediaType === "all") return "Popular content";
  const config = getMediaConfig(props.activeMediaType);
  return `Trending ${config?.name?.toLowerCase() || "content"}`;
};

const getRandomDescription = () => {
  if (props.activeMediaType === "all") return "Random from all media";
  const config = getMediaConfig(props.activeMediaType);
  return `Random ${config?.name?.toLowerCase().slice(0, -1) || "item"}`;
};
</script>
