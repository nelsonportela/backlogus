<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <WelcomeSection />

    <!-- Media Type Selector -->
    <MediaTypeSelector v-model="activeMediaType" @update:model-value="setActiveMediaType" />

    <!-- Quick Stats Cards -->
    <QuickStatsSection 
      :stats="stats" 
      :active-media-type="activeMediaType"
      :loading="statsLoading" />

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Media Status Distribution -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {{
            activeMediaType === "all"
              ? "Media Collection Overview"
              : `${getMediaConfig(activeMediaType)?.name || "Media"} Status Distribution`
          }}
        </h3>
        <div class="relative h-64">
          <canvas ref="statusChart" class="w-full h-full"></canvas>
          <div
            v-if="statsLoading"
            class="absolute inset-0 flex items-center justify-center">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>

      <!-- Recent Activity Timeline -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Recent Activity
          </h3>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ getActivityTimeframe() }}
            </span>
            <button 
              v-if="activeMediaType === 'all'"
              @click="showActivityFilter = !showActivityFilter"
              class="text-blue-600 dark:text-blue-400 text-sm hover:underline">
              Filter
            </button>
          </div>
        </div>
        
        <!-- Activity Filter (for "All" view) -->
        <div 
          v-if="showActivityFilter && activeMediaType === 'all'"
          class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="filter in activityFilters"
              :key="`activity-filter-${filter.type}`"
              @click="setActivityFilter(filter.type)"
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                activeActivityFilter === filter.type
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
              ]">
              {{ filter.emoji }} {{ filter.label }}
            </button>
          </div>
        </div>
        
        <div class="space-y-4 max-h-64 overflow-y-auto">
          <ActivityItem
            v-for="activity in filteredRecentActivities"
            :key="`${activeMediaType}-${activity.id}-${activity.mediaType || 'unknown'}`"
            :activity="activity"
            :loading="statsLoading" />
          <div
            v-if="filteredRecentActivities.length === 0 && !statsLoading"
            class="text-center text-gray-500 dark:text-gray-400 py-8">
            {{ getEmptyActivityMessage() }}
          </div>
        </div>
      </div>
    </div>

    <!-- Media Progress Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Monthly Progress Chart -->
      <div
        class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {{
            activeMediaType === "all"
              ? "All Media Added This Year"
              : `${getMediaConfig(activeMediaType)?.name || "Media"} Added This Year`
          }}
        </h3>
        <div class="relative h-64">
          <canvas ref="monthlyChart" class="w-full h-full"></canvas>
          <div
            v-if="statsLoading"
            class="absolute inset-0 flex items-center justify-center">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>

      <!-- Top Genres -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Popular
          {{
            activeMediaType === "all"
              ? "Genres"
              : getMediaConfig(activeMediaType)?.name === "Games"
                ? "Genres"
                : "Categories"
          }}
        </h3>
        <div class="space-y-3">
          <GenreItem
            v-for="(genre, index) in topGenres"
            :key="`${activeMediaType}-${genre.name}-${index}`"
            :genre="genre"
            :rank="index + 1"
            :active-media-type="activeMediaType"
            :loading="statsLoading" />
          <div
            v-if="topGenres.length === 0 && !statsLoading"
            class="text-center text-gray-500 dark:text-gray-400 py-8">
            No data available
          </div>
        </div>
      </div>
    </div>

    <!-- Smart Recommendations -->
    <SmartRecommendations 
      :stats="stats"
      :active-media-type="activeMediaType"
      @continue-randomly="continueRandomly"
      @tackle-backlog="tackleBacklog"
      @navigate-to-discover="navigateToDiscover" />

    <!-- Quick Actions -->
    <QuickActionsSection
      :active-media-type="activeMediaType"
      @navigate-to-discover="navigateToDiscover"
      @navigate-to-collection="navigateToCollection"
      @navigate-to-trending="navigateToTrending"
      @pick-random-item="pickRandomItem" />

    <!-- Random Modals -->
    <RandomGameModal
      :is-open="showRandomGameModal"
      :random-game="randomGame"
      @close="showRandomGameModal = false"
      @start-playing="(game) => handleStartPlaying(game, loadStats)"
      @go-to-games="navigateToGames" />

    <RandomMovieModal
      :is-open="showRandomMovieModal"
      :random-movie="randomMovie"
      @close="showRandomMovieModal = false"
      @start-watching="(movie) => handleStartWatchingMovie(movie, loadStats)"
      @go-to-movies="navigateToMovies" />

    <RandomShowModal
      :is-open="showRandomShowModal"
      :random-show="randomShow"
      @close="showRandomShowModal = false"
      @start-watching="(show) => handleStartWatchingShow(show, loadStats)"
      @go-to-shows="navigateToShows" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useMediaStore } from "@/stores/media";
import { useGamesStore } from "@/stores/games";
import { useUserStore } from "@/stores/user";
import { useMediaTypes } from "@/composables/useMediaTypes";
import { useRandomPickers } from "@/composables/useRandomPickers";
import Chart from "chart.js/auto";

// Components
import WelcomeSection from "@/components/home/WelcomeSection.vue";
import MediaTypeSelector from "@/components/home/MediaTypeSelector.vue";
import QuickStatsSection from "@/components/home/QuickStatsSection.vue";
import SmartRecommendations from "@/components/home/SmartRecommendations.vue";
import QuickActionsSection from "@/components/home/QuickActionsSection.vue";
import ActivityItem from "@/components/home/ActivityItem.vue";
import GenreItem from "@/components/home/GenreItem.vue";
import RandomGameModal from "@/components/ui/RandomGameModal.vue";
import RandomMovieModal from "@/components/ui/RandomMovieModal.vue";
import RandomShowModal from "@/components/ui/RandomShowModal.vue";

const router = useRouter();
const mediaStore = useMediaStore();
const gamesStore = useGamesStore();
const userStore = useUserStore();
const {
  getMediaConfig,
  getStatusChartColors,
  formatRelativeTime,
} = useMediaTypes();

// Random picker functionality
const {
  showRandomGameModal,
  randomGame,
  showRandomMovieModal,
  randomMovie,
  showRandomShowModal,
  randomShow,
  pickRandomItem: pickRandomItemComposable,
  handleStartPlaying,
  handleStartWatchingMovie,
  handleStartWatchingShow,
  navigateToGames,
  navigateToMovies,
  navigateToShows,
} = useRandomPickers();

const statsLoading = ref(true);
const statusChart = ref(null);
const monthlyChart = ref(null);
const activeMediaType = ref("all"); // Start with unified view
const showActivityFilter = ref(false);
const activeActivityFilter = ref("all");
let statusChartInstance = null;
let monthlyChartInstance = null;

// Activity filter configuration
const activityFilters = ref([
  { type: "all", label: "All Activity", emoji: "📚" },
  { type: "games", label: "Games", emoji: "🎮" },
  { type: "movies", label: "Movies", emoji: "🎬" },
  { type: "shows", label: "TV Shows", emoji: "📺" },
]);

// Stats data
const stats = ref({
  all: {
    totalItems: 0,
    mediaBreakdown: { games: 0, movies: 0, shows: 0 },
    statusDistribution: {},
    topGenres: [],
    monthlyData: [],
    recentActivity: [],
  },
  games: {
    totalItems: 0,
    statusDistribution: {},
    topGenres: [],
    monthlyData: [],
    recentActivity: [],
  },
  movies: {
    totalItems: 0,
    statusDistribution: {},
    topGenres: [],
    monthlyData: [],
    recentActivity: [],
  },
  shows: {
    totalItems: 0,
    statusDistribution: {},
    topGenres: [],
    monthlyData: [],
    recentActivity: [],
  },
});

const recentActivities = computed(() => {
  const currentStats = stats.value[activeMediaType.value] || stats.value.all;
  return (currentStats.recentActivity || []).map((activity) => ({
    id: activity.id,
    type: activity.mediaType ? `${activity.mediaType}_added` : `${activeMediaType.value}_added`,
    title: activity.title,
    subtitle: `${activity.status?.replace("_", " ") || ""} • ${formatRelativeTime(activity.updatedAt)}`,
    time: formatRelativeTime(activity.updatedAt),
    coverUrl: activity.coverUrl,
    mediaType: activity.mediaType || activeMediaType.value,
  }));
});

const filteredRecentActivities = computed(() => {
  if (activeMediaType.value !== "all" || activeActivityFilter.value === "all") {
    return recentActivities.value;
  }
  
  return recentActivities.value.filter(activity => 
    activity.mediaType === activeActivityFilter.value
  );
});

const topGenres = computed(() => {
  const currentStats = stats.value[activeMediaType.value] || stats.value.all;
  return currentStats.topGenres || [];
});

// Method to change active media type
const setActiveMediaType = (mediaType) => {
  activeMediaType.value = mediaType;
  activeActivityFilter.value = "all"; // Reset activity filter when changing media type
  showActivityFilter.value = false; // Hide filter when switching
  // Reinitialize charts when media type changes
  nextTick(() => {
    initializeCharts();
  });
};

// Activity filter methods
const setActivityFilter = (filterType) => {
  activeActivityFilter.value = filterType;
};

const getActivityTimeframe = () => {
  if (activeMediaType.value === "all") {
    return "Latest across all media";
  }
  const config = getMediaConfig(activeMediaType.value);
  return `Latest ${config?.name?.toLowerCase() || "activity"}`;
};

const getEmptyActivityMessage = () => {
  if (activeActivityFilter.value === "all") {
    return "No recent activity";
  }
  const filter = activityFilters.value.find(f => f.type === activeActivityFilter.value);
  return `No recent ${filter?.label?.toLowerCase() || "activity"}`;
};

const loadStats = async () => {
  statsLoading.value = true;

  try {
    // Initialize with empty data
    stats.value.all = {
      totalItems: 0,
      mediaBreakdown: { games: 0, movies: 0, shows: 0 },
      statusDistribution: {},
      topGenres: [],
      monthlyData: new Array(12).fill(0),
      recentActivity: [],
    };

    stats.value.games = {
      totalItems: 0,
      statusDistribution: {},
      topGenres: [],
      monthlyData: new Array(12).fill(0),
      recentActivity: [],
    };

    stats.value.movies = {
      totalItems: 0,
      statusDistribution: {},
      topGenres: [],
      monthlyData: new Array(12).fill(0),
      recentActivity: [],
    };

    stats.value.shows = {
      totalItems: 0,
      statusDistribution: {},
      topGenres: [],
      monthlyData: new Array(12).fill(0),
      recentActivity: [],
    };

    // Try to get unified media stats from new API first
    const statsResult = await mediaStore.getStats();

    if (statsResult.success && statsResult.data) {
      const serverStats = statsResult.data;

      // Update unified stats
      if (serverStats.unified) {
        stats.value.all = {
          totalItems: serverStats.unified.totalItems || 0,
          mediaBreakdown: serverStats.unified.mediaBreakdown || { games: 0, movies: 0, shows: 0 },
          statusDistribution: serverStats.unified.statusDistribution || {},
          topGenres: serverStats.unified.topGenres || [],
          monthlyData: serverStats.unified.monthlyData || new Array(12).fill(0),
          recentActivity: (serverStats.unified.recentActivity || []).map((activity) => ({
            ...activity,
            title: activity.title,
            subtitle: `${activity.status?.replace("_", " ") || ""} • ${formatRelativeTime(activity.updatedAt)}`,
            time: formatRelativeTime(activity.updatedAt),
          })),
        };
      }

      // Update individual media type stats
      if (serverStats.games) {
        stats.value.games = {
          totalItems: serverStats.games.totalItems || 0,
          statusDistribution: serverStats.games.statusDistribution || {},
          topGenres: serverStats.games.topGenres || [],
          monthlyData: serverStats.games.monthlyData || new Array(12).fill(0),
          recentActivity: (serverStats.games.recentActivity || []).map((activity) => ({
            ...activity,
            mediaType: 'games',
          })),
        };
      }

      if (serverStats.movies) {
        stats.value.movies = {
          totalItems: serverStats.movies.totalItems || 0,
          statusDistribution: serverStats.movies.statusDistribution || {},
          topGenres: serverStats.movies.topGenres || [],
          monthlyData: serverStats.movies.monthlyData || new Array(12).fill(0),
          recentActivity: (serverStats.movies.recentActivity || []).map((activity) => ({
            ...activity,
            mediaType: 'movies',
          })),
        };
      }

      if (serverStats.shows) {
        stats.value.shows = {
          totalItems: serverStats.shows.totalItems || 0,
          statusDistribution: serverStats.shows.statusDistribution || {},
          topGenres: serverStats.shows.topGenres || [],
          monthlyData: serverStats.shows.monthlyData || new Array(12).fill(0),
          recentActivity: (serverStats.shows.recentActivity || []).map((activity) => ({
            ...activity,
            mediaType: 'shows',
          })),
        };
      }
    } else {
      // Fallback to games-specific API if unified API fails
      const gamesResult = await gamesStore.getStats();

      if (gamesResult.success && gamesResult.data) {
        const gameStats = gamesResult.data;

        stats.value.games = {
          totalItems: gameStats.totalGames || 0,
          statusDistribution: gameStats.statusDistribution || {},
          topGenres: gameStats.topGenres || [],
          monthlyData: gameStats.monthlyData || new Array(12).fill(0),
          recentActivity: (gameStats.recentActivity || []).map((activity) => ({
            id: activity.id,
            title: activity.gameName,
            subtitle: `${activity.status?.replace("_", " ") || ""} • ${formatRelativeTime(activity.updatedAt)}`,
            time: formatRelativeTime(activity.updatedAt),
            coverUrl: activity.coverUrl,
            status: activity.status,
            updatedAt: activity.updatedAt,
            mediaType: 'games',
          })),
        };

        // Create unified stats from games data only
        stats.value.all = {
          totalItems: gameStats.totalGames || 0,
          mediaBreakdown: {
            games: gameStats.totalGames || 0,
            movies: 0,
            shows: 0,
          },
          statusDistribution: gameStats.statusDistribution || {},
          topGenres: gameStats.topGenres || [],
          monthlyData: gameStats.monthlyData || new Array(12).fill(0),
          recentActivity: stats.value.games.recentActivity,
        };
      }
    }
  } catch (error) {
    // Stats loading failed - handle gracefully
    console.warn('Failed to load stats:', error);
  } finally {
    statsLoading.value = false;

    // Initialize charts after data is loaded
    nextTick(() => {
      initializeCharts();
    });
  }
};

const initializeCharts = async () => {
  await nextTick(); // Wait for DOM to be ready

  if (!statusChart.value || !monthlyChart.value) return;

  // Destroy existing charts
  if (statusChartInstance) {
    statusChartInstance.destroy();
  }
  if (monthlyChartInstance) {
    monthlyChartInstance.destroy();
  }

  const currentStats = stats.value[activeMediaType.value] || stats.value.all;

  // Status Distribution Pie Chart
  let statusColors, statusData;
  
  if (activeMediaType.value === "all") {
    // For "all" view, show media type breakdown instead of status
    statusColors = ["#3b82f6", "#f97316", "#ec4899", "#10b981"]; // Blue, Orange, Pink, Green
    statusData = Object.entries(currentStats.mediaBreakdown || {})
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        value,
      }));
  } else {
    // For specific media types, show status distribution
    statusColors = getStatusChartColors(activeMediaType.value);
    statusData = Object.entries(currentStats.statusDistribution || {})
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        label: key.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value,
      }));
  }

  if (statusData.length > 0) {
    statusChartInstance = new Chart(statusChart.value, {
      type: "doughnut",
      data: {
        labels: statusData.map((d) => d.label),
        datasets: [
          {
            data: statusData.map((d) => d.value),
            backgroundColor: statusColors,
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              },
            },
          },
        },
        cutout: "50%",
      },
    });
  }

  // Monthly Progress Line Chart
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  monthlyChartInstance = new Chart(monthlyChart.value, {
    type: "line",
    data: {
      labels: monthNames,
      datasets: [
        {
          label: `${getMediaConfig(activeMediaType.value)?.name || "Items"} Added`,
          data: currentStats.monthlyData || new Array(12).fill(0),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            precision: 0,
          },
          grid: {
            color: "rgba(156, 163, 175, 0.1)",
          },
        },
        x: {
          grid: {
            color: "rgba(156, 163, 175, 0.1)",
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    },
  });
};

// Navigation functions - updated to be media-agnostic
const navigateToDiscover = () => {
  if (activeMediaType.value === "all") {
    // Navigate to games by default, but could show a media selector modal
    router.push({ name: "games" });
  } else if (activeMediaType.value === "games") {
    router.push({ name: "games" });
  } else if (activeMediaType.value === "movies") {
    router.push({ name: "movies" });
  } else if (activeMediaType.value === "shows") {
    router.push({ name: "shows" });
  } else {
    router.push({ name: "games" });
  }
};

const navigateToCollection = () => {
  if (activeMediaType.value === "all") {
    // Navigate to games by default, but could show unified view
    router.push({ name: "games" });
  } else if (activeMediaType.value === "games") {
    router.push({ name: "games" });
  } else if (activeMediaType.value === "movies") {
    router.push({ name: "movies" });
  } else if (activeMediaType.value === "shows") {
    router.push({ name: "shows" });
  } else {
    router.push({ name: "games" });
  }
};

const navigateToTrending = () => {
  // TODO: Implement trending content navigation based on active media type
  if (activeMediaType.value === "movies") {
    // Could navigate to trending movies
    router.push({ name: "movies" });
  } else if (activeMediaType.value === "shows") {
    // Could navigate to trending shows
    router.push({ name: "shows" });
  } else {
    // Default to games
    router.push({ name: "games" });
  }
};

const continueRandomly = async () => {
  const currentStats = stats.value[activeMediaType.value] || stats.value.all;
  const currentlyPlaying = (currentStats.recentActivity || []).filter(activity => 
    activity.status === "playing" || activity.status === "watching" || activity.status === "reading"
  );
  
  if (currentlyPlaying.length === 0) return;
  
  const randomIndex = Math.floor(Math.random() * currentlyPlaying.length);
  const selectedItem = currentlyPlaying[randomIndex];
  
  // Navigate to the appropriate media type view
  if (selectedItem.mediaType === "games") {
    router.push({ name: "games", query: { status: "playing" } });
  } else if (selectedItem.mediaType === "movies") {
    router.push({ name: "movies", query: { status: "watching" } });
  } else if (selectedItem.mediaType === "shows") {
    router.push({ name: "tv", query: { status: "watching" } });
  }
};

const tackleBacklog = async () => {
  // Navigate to the appropriate view based on active media type
  if (activeMediaType.value === "all") {
    // Find which media type has the most backlog items
    const gameBacklog = stats.value.games.statusDistribution?.want_to_play || 0;
    const movieBacklog = stats.value.movies.statusDistribution?.want_to_watch || 0;
    const showBacklog = stats.value.shows.statusDistribution?.want_to_watch || 0;
    
    if (gameBacklog >= movieBacklog && gameBacklog >= showBacklog) {
      router.push({ name: "games", query: { status: "want_to_play" } });
    } else if (movieBacklog >= showBacklog) {
      router.push({ name: "movies", query: { status: "want_to_watch" } });
    } else {
      router.push({ name: "tv", query: { status: "want_to_watch" } });
    }
  } else if (activeMediaType.value === "games") {
    router.push({ name: "games", query: { status: "want_to_play" } });
  } else if (activeMediaType.value === "movies") {
    router.push({ name: "movies", query: { status: "want_to_watch" } });
  } else if (activeMediaType.value === "shows") {
    router.push({ name: "tv", query: { status: "want_to_watch" } });
  }
};

const pickRandomItem = async () => {
  await pickRandomItemComposable(activeMediaType.value, stats.value);
};

onMounted(async () => {
  // Load user profile first to get personalization data
  if (!userStore.profile) {
    await userStore.getProfile();
  }
  await loadStats();
});
</script>
