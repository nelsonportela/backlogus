<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <div class="w-64 bg-white dark:bg-gray-800 shadow-lg">
      <div
        class="flex items-center justify-center h-16 border-b dark:border-gray-700"
      >
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-200">
          Media Tracker
        </h1>
      </div>
      <nav class="mt-8">
        <div class="px-4 space-y-2">
          <!-- Games Section -->
          <div>
            <div
              @click="toggleGamesSubmenu"
              class="flex items-center justify-between px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              :class="{
                'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300':
                  isGamesRoute,
              }"
            >
              <div class="flex items-center">
                <svg
                  class="w-5 h-5 mr-3"
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
                Games
              </div>
              <svg
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': gamesSubmenuOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            <!-- Games Submenu -->
            <div
              v-show="gamesSubmenuOpen"
              class="ml-6 mt-2 space-y-1 transition-all duration-200"
            >
              <router-link
                v-for="status in gameStatuses"
                :key="status.value"
                :to="{ name: 'games', query: { status: status.value } }"
                class="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                :class="{
                  'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-medium':
                    $route.query.status === status.value ||
                    (!$route.query.status && status.value === 'all'),
                }"
              >
                <span
                  class="w-2 h-2 rounded-full mr-3"
                  :class="status.color"
                ></span>
                {{ status.label }}
              </router-link>
            </div>
          </div>

          <div class="px-4 py-2 text-gray-400 dark:text-gray-500 text-sm">
            More media types coming soon...
          </div>
        </div>
      </nav>

      <!-- User menu at bottom -->
      <div class="absolute bottom-0 w-64 p-4 border-t dark:border-gray-700">
        <button
          @click="logout"
          class="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg
            class="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign Out
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header
        class="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 px-6 py-4"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            {{ pageTitle }}
          </h2>

          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <!-- Sun Icon (Light Mode) -->
            <svg
              v-if="isDark"
              class="w-5 h-5 text-gray-600 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <!-- Moon Icon (Dark Mode) -->
            <svg
              v-else
              class="w-5 h-5 text-gray-600 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main
        class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6"
      >
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useTheme } from "@/composables/useTheme";

export default {
  name: "DashboardLayout",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const { isDark, toggleTheme } = useTheme();

    // Submenu state - keep games submenu open when on games page
    const gamesSubmenuOpen = ref(route.name === "games");

    // Game statuses configuration
    const gameStatuses = [
      { value: "all", label: "All Games", color: "bg-gray-400" },
      { value: "playing", label: "Playing", color: "bg-green-400" },
      { value: "completed", label: "Completed", color: "bg-blue-400" },
      { value: "want_to_play", label: "Want to Play", color: "bg-yellow-400" },
      { value: "dropped", label: "Dropped", color: "bg-red-400" },
    ];

    const isGamesRoute = computed(() => {
      return route.name === "games";
    });

    const pageTitle = computed(() => {
      switch (route.name) {
        case "games": {
          const statusFilter = route.query.status;
          const statusConfig = gameStatuses.find(
            (s) => s.value === statusFilter,
          );

          if (statusConfig && statusFilter !== "all") {
            return `Games - ${statusConfig.label}`;
          }
          return "Games";
        }
        default:
          return "Dashboard";
      }
    });

    const toggleGamesSubmenu = () => {
      gamesSubmenuOpen.value = !gamesSubmenuOpen.value;
    };

    // Watch for route changes to auto-open games submenu
    watch(
      () => route.name,
      (newRouteName) => {
        if (newRouteName === "games") {
          gamesSubmenuOpen.value = true;
        }
      },
    );

    const logout = () => {
      authStore.logout();
      router.push({ name: "login" });
    };

    return {
      pageTitle,
      logout,
      gamesSubmenuOpen,
      gameStatuses,
      isGamesRoute,
      toggleGamesSubmenu,
      isDark,
      toggleTheme,
    };
  },
};
</script>
