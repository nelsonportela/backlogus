<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard
      v-for="stat in quickStats"
      :key="stat.label"
      :icon="stat.icon"
      :label="stat.label"
      :value="stat.value"
      :change="stat.change"
      :color="stat.color"
      :loading="loading" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useMediaTypes } from '@/composables/useMediaTypes';
import StatCard from '@/components/home/StatCard.vue';

const props = defineProps({
  stats: {
    type: Object,
    required: true,
  },
  activeMediaType: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const { generateStatsCards } = useMediaTypes();

// Helper function to calculate recent activity counts
const getRecentActivityCount = (activities, mediaType = null, days = 7) => {
  if (!activities || !Array.isArray(activities)) return 0;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return activities.filter(activity => {
    const activityDate = new Date(activity.updatedAt || activity.createdAt);
    const isRecent = activityDate >= cutoffDate;
    
    if (mediaType) {
      return isRecent && activity.mediaType === mediaType;
    }
    return isRecent;
  }).length;
};

// Helper function to format change text
const formatChangeText = (count, period = "week") => {
  if (count === 0) return "No recent activity";
  if (count === 1) return `+1 this ${period}`;
  return `+${count} this ${period}`;
};

// Computed stats using media-agnostic approach
const quickStats = computed(() => {
  const currentStats = props.stats[props.activeMediaType] || props.stats.all;
  
  if (props.activeMediaType === "all") {
    // For "all" view, show breakdown of media types
    const breakdown = currentStats.mediaBreakdown || { games: 0, movies: 0, shows: 0 };
    const allActivities = currentStats.recentActivity || [];
    
    // Calculate recent activity for each media type
    const totalRecentCount = getRecentActivityCount(allActivities);
    const gamesRecentCount = getRecentActivityCount(allActivities, 'games');
    const moviesRecentCount = getRecentActivityCount(allActivities, 'movies');
    const showsRecentCount = getRecentActivityCount(allActivities, 'shows');
    
    return [
      {
        label: "Total Items",
        value: currentStats.totalItems?.toString() || "0",
        change: formatChangeText(totalRecentCount),
        color: "blue",
        icon: "library"
      },
      {
        label: "Games",
        value: breakdown.games?.toString() || "0",
        change: formatChangeText(gamesRecentCount),
        color: "green",
        icon: "game"
      },
      {
        label: "Movies", 
        value: breakdown.movies?.toString() || "0",
        change: formatChangeText(moviesRecentCount),
        color: "purple",
        icon: "movie"
      },
      {
        label: "TV Shows",
        value: breakdown.shows?.toString() || "0",
        change: formatChangeText(showsRecentCount),
        color: "pink",
        icon: "tv"
      }
    ];
  } else {
    // For specific media types, use existing logic
    return generateStatsCards(currentStats, props.activeMediaType);
  }
});
</script>
