<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div
      class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold mb-2">Welcome back! 👋</h1>
          <p class="text-blue-100 text-lg">
            Here's what's happening with your media collection
          </p>
        </div>
        <div class="hidden md:block">
          <div
            class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        v-for="stat in quickStats"
        :key="stat.label"
        :icon="stat.icon"
        :label="stat.label"
        :value="stat.value"
        :change="stat.change"
        :color="stat.color"
        :loading="statsLoading" />
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Media Status Distribution -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {{
            activeMediaType
              ? `${getMediaConfig(activeMediaType)?.name || "Media"} Status Distribution`
              : "Media Collection Overview"
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
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Recent Activity
        </h3>
        <div class="space-y-4 max-h-64 overflow-y-auto">
          <ActivityItem
            v-for="activity in recentActivities"
            :key="activity.id"
            :activity="activity"
            :loading="statsLoading" />
          <div
            v-if="recentActivities.length === 0 && !statsLoading"
            class="text-center text-gray-500 dark:text-gray-400 py-8">
            No recent activity
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
            activeMediaType
              ? `${getMediaConfig(activeMediaType)?.name || "Media"} Added This Year`
              : "Media Added This Year"
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
            activeMediaType
              ? getMediaConfig(activeMediaType)?.name === "Games"
                ? "Genres"
                : "Categories"
              : "Genres"
          }}
        </h3>
        <div class="space-y-3">
          <GenreItem
            v-for="(genre, index) in topGenres"
            :key="genre.name"
            :genre="genre"
            :rank="index + 1"
            :loading="statsLoading" />
          <div
            v-if="topGenres.length === 0 && !statsLoading"
            class="text-center text-gray-500 dark:text-gray-400 py-8">
            No data available
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Quick Actions
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ActionButton
          icon="search"
          label="Discover"
          description="Find new media"
          @click="navigateToDiscover" />
        <ActionButton
          icon="library"
          label="My Collection"
          description="View all items"
          @click="navigateToCollection" />
        <ActionButton
          icon="trending"
          label="Trending"
          description="Popular content"
          @click="navigateToTrending" />
        <ActionButton
          icon="random"
          label="Surprise Me"
          description="Random picker"
          @click="pickRandomItem" />
      </div>
    </div>

    <!-- Random Game Modal -->
    <RandomGameModal
      :is-open="showRandomGameModal"
      :random-game="randomGame"
      @close="showRandomGameModal = false"
      @start-playing="handleStartPlaying"
      @go-to-games="navigateToGames" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useMediaStore } from "@/stores/media";
import { useGamesStore } from "@/stores/games";
import { useMediaTypes } from "@/composables/useMediaTypes";
import Chart from "chart.js/auto";
import StatCard from "@/components/home/StatCard.vue";
import ActivityItem from "@/components/home/ActivityItem.vue";
import GenreItem from "@/components/home/GenreItem.vue";
import ActionButton from "@/components/home/ActionButton.vue";
import RandomGameModal from "@/components/ui/RandomGameModal.vue";

const router = useRouter();
const mediaStore = useMediaStore();
const gamesStore = useGamesStore();
const {
  getMediaConfig,
  generateStatsCards,
  getStatusChartColors,
  formatRelativeTime,
} = useMediaTypes();

const statsLoading = ref(true);
const statusChart = ref(null);
const monthlyChart = ref(null);
const showRandomGameModal = ref(false);
const randomGame = ref(null);
const activeMediaType = ref("games"); // Default to games for now
let statusChartInstance = null;
let monthlyChartInstance = null;

// Stats data
const stats = ref({
  unified: {
    totalItems: 0,
    mediaBreakdown: {},
    recentActivity: [],
    monthlyData: [],
  },
  games: {
    totalItems: 0,
    statusDistribution: {},
    topGenres: [],
    monthlyData: [],
    recentActivity: [],
  },
});

// Computed stats using media-agnostic approach
const quickStats = computed(() => {
  const currentStats = stats.value[activeMediaType.value] || stats.value.games;
  return generateStatsCards(currentStats, activeMediaType.value);
});

const recentActivities = computed(() => {
  const currentStats = stats.value[activeMediaType.value] || stats.value.games;
  return (currentStats.recentActivity || []).map((activity) => ({
    id: activity.id,
    type: `${activeMediaType.value}_added`,
    title: activity.title,
    subtitle: `${activity.status?.replace("_", " ") || ""} • ${formatRelativeTime(activity.updatedAt)}`,
    time: formatRelativeTime(activity.updatedAt),
    coverUrl: activity.coverUrl,
  }));
});

const topGenres = computed(() => {
  const currentStats = stats.value[activeMediaType.value] || stats.value.games;
  return currentStats.topGenres || [];
});

const loadStats = async () => {
  statsLoading.value = true;

  try {
    // Try to get unified media stats from new API first
    const statsResult = await mediaStore.getStats();

    if (statsResult.success && statsResult.data) {
      const serverStats = statsResult.data;

      // Update unified stats
      if (serverStats.unified) {
        stats.value.unified = serverStats.unified;
      }

      // Update individual media type stats
      if (serverStats.games) {
        stats.value.games = {
          totalItems: serverStats.games.totalItems || 0,
          statusDistribution: serverStats.games.statusDistribution || {},
          topGenres: serverStats.games.topGenres || [],
          monthlyData: serverStats.games.monthlyData || new Array(12).fill(0),
          recentActivity: (serverStats.games.recentActivity || []).map(
            (activity) => ({
              id: activity.id,
              title: activity.title,
              subtitle: `${activity.status?.replace("_", " ") || ""} • ${formatRelativeTime(activity.updatedAt)}`,
              time: formatRelativeTime(activity.updatedAt),
              coverUrl: activity.coverUrl,
              status: activity.status,
              updatedAt: activity.updatedAt,
            })
          ),
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
          })),
        };

        // Create unified stats from games data
        stats.value.unified = {
          totalItems: gameStats.totalGames || 0,
          mediaBreakdown: {
            games: gameStats.totalGames || 0,
            movies: 0,
            books: 0,
          },
          recentActivity: stats.value.games.recentActivity,
          monthlyData: gameStats.monthlyData || new Array(12).fill(0),
          primaryMediaType: "games",
        };
      }
      // If both APIs fail, stats will remain in loading state
    }
  } catch {
    // Stats loading failed - handle gracefully
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

  const currentStats = stats.value[activeMediaType.value] || stats.value.games;

  // Status Distribution Pie Chart
  const statusColors = getStatusChartColors(activeMediaType.value);

  const statusData = Object.entries(currentStats.statusDistribution || {})
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      label: key.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value,
    }));

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
  // For now, default to games. Later, could show a media type selector
  router.push({ name: "games" });
};

const navigateToCollection = () => {
  // For now, default to games. Later, could show unified collection view
  router.push({ name: "games" });
};

const navigateToGames = () => {
  router.push({ name: "games" });
};

const navigateToTrending = () => {
  // TODO: Implement trending content navigation
};

const pickRandomItem = async () => {
  // For now, only pick random games. Later, could pick from all media types
  pickRandomGame();
};

const pickRandomGame = async () => {
  try {
    await gamesStore.getUserGames();
    const games = gamesStore.games.filter(
      (game) => game.status === "want_to_play" || game.status === "playing"
    );

    if (games.length === 0) {
      // No games available to pick from
      return;
    }

    const randomIndex = Math.floor(Math.random() * games.length);
    randomGame.value = games[randomIndex];
    showRandomGameModal.value = true;
  } catch {
    // Error picking random game - handle gracefully
  }
};

const handleStartPlaying = async (game) => {
  try {
    await gamesStore.updateUserGame(game.id, { status: "playing" });
    showRandomGameModal.value = false;
    // Refresh stats
    await loadStats();
  } catch {
    // Error updating game status - handle gracefully
  }
};

onMounted(async () => {
  await loadStats();
});
</script>
