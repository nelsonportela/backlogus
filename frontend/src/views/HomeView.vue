<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold mb-2">
            Welcome back! 👋
          </h1>
          <p class="text-blue-100 text-lg">
            Here's what's happening with your media collection
          </p>
        </div>
        <div class="hidden md:block">
          <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
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
        :loading="statsLoading"
      />
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Game Status Distribution -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Game Status Distribution
        </h3>
        <div class="relative">
          <canvas ref="statusChart" class="max-h-64"></canvas>
          <div v-if="statsLoading" class="absolute inset-0 flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
            :loading="statsLoading"
          />
          <div v-if="recentActivities.length === 0 && !statsLoading" class="text-center text-gray-500 dark:text-gray-400 py-8">
            No recent activity
          </div>
        </div>
      </div>
    </div>

    <!-- Games Progress Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Monthly Progress Chart -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Games Added This Year
        </h3>
        <div class="relative">
          <canvas ref="monthlyChart" class="max-h-64"></canvas>
          <div v-if="statsLoading" class="absolute inset-0 flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>

      <!-- Top Genres -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Favorite Genres
        </h3>
        <div class="space-y-3">
          <GenreItem
            v-for="(genre, index) in topGenres"
            :key="genre.name"
            :genre="genre"
            :rank="index + 1"
            :loading="statsLoading"
          />
          <div v-if="topGenres.length === 0 && !statsLoading" class="text-center text-gray-500 dark:text-gray-400 py-8">
            No genre data available
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
          label="Find Games"
          description="Search for new games"
          @click="navigateToGames"
        />
        <ActionButton
          icon="library"
          label="My Library"
          description="View all games"
          @click="navigateToLibrary"
        />
        <ActionButton
          icon="trending"
          label="Trending"
          description="Popular games"
          @click="navigateToTrending"
        />
        <ActionButton
          icon="random"
          label="Surprise Me"
          description="Random game picker"
          @click="pickRandomGame"
        />
      </div>
    </div>

    <!-- Random Game Modal -->
    <RandomGameModal
      :is-open="showRandomGameModal"
      :random-game="randomGame"
      @close="showRandomGameModal = false"
      @start-playing="handleStartPlaying"
      @go-to-games="navigateToGames"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useGamesStore } from '@/stores/games';
import Chart from 'chart.js/auto';
import StatCard from '@/components/home/StatCard.vue';
import ActivityItem from '@/components/home/ActivityItem.vue';
import GenreItem from '@/components/home/GenreItem.vue';
import ActionButton from '@/components/home/ActionButton.vue';
import RandomGameModal from '@/components/ui/RandomGameModal.vue';

const router = useRouter();
const gamesStore = useGamesStore();

const statsLoading = ref(true);
const statusChart = ref(null);
const monthlyChart = ref(null);
const showRandomGameModal = ref(false);
const randomGame = ref(null);
let statusChartInstance = null;
let monthlyChartInstance = null;

// Stats data
const stats = ref({
  totalGames: 0,
  completedGames: 0,
  currentlyPlaying: 0,
  wantToPlay: 0,
  statusDistribution: {},
  monthlyData: [],
  recentActivity: [],
  topGenres: []
});

// Computed stats
const quickStats = computed(() => [
  {
    icon: 'collection',
    label: 'Total Games',
    value: stats.value.totalGames,
    change: '+5 this week',
    color: 'blue'
  },
  {
    icon: 'play',
    label: 'Currently Playing',
    value: stats.value.currentlyPlaying,
    change: '2 active sessions',
    color: 'green'
  },
  {
    icon: 'check',
    label: 'Completed',
    value: stats.value.completedGames,
    change: `${Math.round((stats.value.completedGames / stats.value.totalGames) * 100) || 0}% of library`,
    color: 'purple'
  },
  {
    icon: 'bookmark',
    label: 'Want to Play',
    value: stats.value.wantToPlay,
    change: 'Your backlog',
    color: 'yellow'
  }
]);

const recentActivities = computed(() => stats.value.recentActivity || []);
const topGenres = computed(() => stats.value.topGenres || []);

const loadStats = async () => {
  statsLoading.value = true;
  
  try {
    // Get stats from backend
    const statsResult = await gamesStore.getStats();
    
    if (statsResult.success) {
      const serverStats = statsResult.data;
      
      // Update stats with server data
      stats.value.totalGames = serverStats.totalGames;
      stats.value.completedGames = serverStats.statusDistribution.completed || 0;
      stats.value.currentlyPlaying = serverStats.statusDistribution.playing || 0;
      stats.value.wantToPlay = serverStats.statusDistribution.want_to_play || 0;
      stats.value.statusDistribution = serverStats.statusDistribution;
      stats.value.monthlyData = serverStats.monthlyData;
      stats.value.topGenres = serverStats.topGenres;
      
      // Transform recent activity
      stats.value.recentActivity = serverStats.recentActivity.map(activity => ({
        id: activity.id,
        type: 'game_added',
        title: activity.gameName,
        subtitle: `${activity.status.replace('_', ' ')} • ${formatRelativeTime(activity.updatedAt)}`,
        time: formatRelativeTime(activity.updatedAt),
        coverUrl: activity.coverUrl
      }));
      
    } else {
      // Fallback to client-side calculation if API fails
      await gamesStore.getUserGames();
      const games = gamesStore.games;
      
      // Calculate basic stats
      stats.value.totalGames = games.length;
      stats.value.completedGames = games.filter(g => g.status === 'completed').length;
      stats.value.currentlyPlaying = games.filter(g => g.status === 'playing').length;
      stats.value.wantToPlay = games.filter(g => g.status === 'want_to_play').length;
      
      // Status distribution for pie chart
      const statusCounts = {};
      games.forEach(game => {
        statusCounts[game.status] = (statusCounts[game.status] || 0) + 1;
      });
      stats.value.statusDistribution = statusCounts;
      
      // Monthly data (games added per month this year)
      const monthlyData = new Array(12).fill(0);
      const currentYear = new Date().getFullYear();
      games.forEach(game => {
        if (game.created_at) {
          const gameDate = new Date(game.created_at);
          if (gameDate.getFullYear() === currentYear) {
            monthlyData[gameDate.getMonth()]++;
          }
        }
      });
      stats.value.monthlyData = monthlyData;
      
      // Top genres
      const genreCounts = {};
      games.forEach(game => {
        if (game.genres && Array.isArray(game.genres)) {
          game.genres.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        }
      });
      
      stats.value.topGenres = Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
      
      // Recent activity (last 5 games added/updated)
      const recentGames = [...games]
        .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
        .slice(0, 5);
        
      stats.value.recentActivity = recentGames.map(game => ({
        id: game.id,
        type: 'game_added',
        title: game.name,
        subtitle: `${game.status.replace('_', ' ')} • ${formatRelativeTime(game.created_at || game.updated_at)}`,
        time: formatRelativeTime(game.created_at || game.updated_at),
        coverUrl: game.cover_url
      }));
    }
    
  } catch (error) {
    console.error('Error loading stats:', error);
  } finally {
    statsLoading.value = false;
  }
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Recently';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
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
  
  // Status Distribution Pie Chart
  const statusLabels = {
    'want_to_play': 'Want to Play',
    'playing': 'Currently Playing',
    'completed': 'Completed',
    'dropped': 'Dropped'
  };
  
  const statusData = Object.entries(stats.value.statusDistribution).map(([key, value]) => ({
    label: statusLabels[key] || key,
    value
  }));
  
  if (statusData.length > 0) {
    statusChartInstance = new Chart(statusChart.value, {
      type: 'doughnut',
      data: {
        labels: statusData.map(d => d.label),
        datasets: [{
          data: statusData.map(d => d.value),
          backgroundColor: [
            '#3b82f6', // blue - want to play
            '#10b981', // green - playing
            '#8b5cf6', // purple - completed
            '#ef4444', // red - dropped
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          }
        },
        cutout: '50%'
      }
    });
  }
  
  // Monthly Progress Line Chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  monthlyChartInstance = new Chart(monthlyChart.value, {
    type: 'line',
    data: {
      labels: monthNames,
      datasets: [{
        label: 'Games Added',
        data: stats.value.monthlyData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#3b82f6',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#6b7280'
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(107, 114, 128, 0.1)'
          },
          ticks: {
            color: '#6b7280',
            stepSize: 1
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
};

// Navigation methods
const navigateToGames = () => {
  router.push({ name: 'games' });
};

const navigateToLibrary = () => {
  router.push({ name: 'games', query: { status: 'all' } });
};

const navigateToTrending = () => {
  // TODO: Implement trending games feature
  router.push({ name: 'games' });
};

const pickRandomGame = async () => {
  // Ensure we have the latest games data
  await gamesStore.getUserGames();
  const games = gamesStore.games.filter(g => g.status === 'want_to_play');
  
  if (games.length > 0) {
    randomGame.value = games[Math.floor(Math.random() * games.length)];
  } else {
    randomGame.value = null;
  }
  
  showRandomGameModal.value = true;
};

const handleStartPlaying = async (game) => {
  // Update the game status to "playing"
  const result = await gamesStore.updateGameStatus(game.id, 'playing');
  if (result.success) {
    // Reload stats to reflect the change
    await loadStats();
    await initializeCharts();
  }
};

onMounted(async () => {
  await loadStats();
  await initializeCharts();
});
</script>
