<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Mobile Overlay -->
    <div
      v-if="mobileMenuOpen"
      @click="closeMobileMenu"
      class="fixed inset-0 bg-black/50 z-30 md:hidden"></div>

    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0"
      :class="{
        '-translate-x-full': !mobileMenuOpen,
        'translate-x-0': mobileMenuOpen,
      }">
      <div
        class="flex items-center justify-center h-16 border-b dark:border-gray-700 pt-2 md:pt-0">
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-200">
          BackLogus
        </h1>
      </div>
      <nav class="mt-8">
        <div class="px-4 space-y-2">
          <!-- Home Section -->
          <router-link
            :to="{ name: 'home' }"
            class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{
              'bg-primary-50 dark:bg-gray-700 text-primary-700 dark:text-gray-100':
                route.name === 'home',
            }">
            <svg
              class="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </router-link>

          <!-- Games Section -->
          <div v-if="enabledMenuOptions.includes('games')">
            <div
              @click="handleGamesMenuClick"
              class="flex items-center justify-between px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              :class="{
                'bg-primary-50 dark:bg-gray-700 text-primary-700 dark:text-gray-100':
                  isGamesRoute,
              }">
              <div class="flex items-center">
                <svg
                  class="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Games
              </div>
              <svg
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': gamesSubmenuOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <!-- Games Submenu -->
            <transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 max-h-0 transform -translate-y-2"
              enter-to-class="opacity-100 max-h-96 transform translate-y-0"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="opacity-100 max-h-96 transform translate-y-0"
              leave-to-class="opacity-0 max-h-0 transform -translate-y-2">
              <div
                v-show="gamesSubmenuOpen"
                class="ml-6 mt-2 space-y-1 overflow-hidden">
                <router-link
                  v-for="status in gameStatuses"
                  :key="status.value"
                  :to="{ name: 'games', query: { status: status.value } }"
                  class="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  :class="{
                    'bg-primary-100 dark:bg-gray-600 text-primary-700 dark:text-gray-100 font-medium':
                      $route.query.status === status.value ||
                      (!$route.query.status && status.value === 'all'),
                  }">
                  {{ status.label }}
                </router-link>
              </div>
            </transition>
          </div>

          <!-- Movies Section -->
          <div v-if="enabledMenuOptions.includes('movies')">
            <div
              @click="handleMoviesMenuClick"
              class="flex items-center justify-between px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              :class="{
                'bg-primary-50 dark:bg-gray-700 text-primary-700 dark:text-gray-100':
                  isMoviesRoute,
              }">
              <div class="flex items-center">
                <svg
                  class="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 4v16l13-8L7 4z" />
                </svg>
                Movies
              </div>
              <svg
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': moviesSubmenuOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <!-- Movies Submenu -->
            <transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 max-h-0 transform -translate-y-2"
              enter-to-class="opacity-100 max-h-96 transform translate-y-0"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="opacity-100 max-h-96 transform translate-y-0"
              leave-to-class="opacity-0 max-h-0 transform -translate-y-2">
              <div
                v-show="moviesSubmenuOpen"
                class="ml-6 mt-2 space-y-1 overflow-hidden">
                <router-link
                  v-for="status in movieStatuses"
                  :key="status.value"
                  :to="{ name: 'movies', query: { status: status.value } }"
                  class="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  :class="{
                    'bg-primary-100 dark:bg-gray-600 text-primary-700 dark:text-gray-100 font-medium':
                      $route.query.status === status.value ||
                      (!$route.query.status && status.value === 'all'),
                  }">
                  {{ status.label }}
                </router-link>
              </div>
            </transition>
          </div>

          <!-- TV Shows Section -->
          <div v-if="enabledMenuOptions.includes('tv')">
            <router-link
              :to="{ name: 'tv' }"
              class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              :class="{
                'bg-primary-50 dark:bg-gray-700 text-primary-700 dark:text-gray-100': route.name === 'tv',
              }">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="7" width="18" height="13" rx="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M16 3l-4 4-4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              TV Shows
            </router-link>
          </div>

          <!-- Books Section -->
          <div v-if="enabledMenuOptions.includes('books')">
            <router-link
              :to="{ name: 'books' }"
              class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              :class="{
                'bg-primary-50 dark:bg-gray-700 text-primary-700 dark:text-gray-100': route.name === 'books',
              }">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M20 2H8a2 2 0 0 0-2 2v15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Books
            </router-link>
          </div>

        </div>
      </nav>

      <!-- User menu at bottom -->
      <div class="absolute bottom-0 w-64 p-4 border-t dark:border-gray-700">
        <!-- User Profile Section -->
        <router-link
          :to="{ name: 'settings' }"
          class="block mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          :class="{
            'bg-primary-50 dark:bg-primary-900/30 ring-2 ring-primary-500/20':
              route.name === 'settings',
          }">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <img
                v-if="userStore.profile?.avatar_url"
                :src="userStore.profile.avatar_url"
                :alt="getDisplayName()"
                class="w-10 h-10 rounded-full object-cover" />
              <div
                v-else
                class="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {{ getDisplayName() }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ userStore.profile?.email }}
              </p>
            </div>
            <div class="flex-shrink-0">
              <svg
                class="w-4 h-4 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </router-link>

        <div class="space-y-2">
          <!-- Sign Out Button -->
          <button
            @click="logout"
            class="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg
              class="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden md:ml-0">
      <!-- Header -->
      <header
        class="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 px-4 md:px-6 py-4 md:pl-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <!-- Mobile Menu Button (inline with title) -->
            <button
              @click="toggleMobileMenu"
              class="mr-3 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg md:hidden flex-shrink-0 flex items-center justify-center">
              <svg
                class="w-6 h-6 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  v-if="!mobileMenuOpen"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16" />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2
              class="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200 truncate">
              {{ dynamicTitle }}
            </h2>
          </div>
          <!-- Theme Toggle Switch -->
          <div class="flex items-center space-x-3 flex-shrink-0">
            <!-- Sun Icon (Light Mode) -->
            <svg
              class="w-5 h-5 transition-colors"
              :class="{
                'text-yellow-500': !isDark,
                'text-gray-400 dark:text-gray-500': isDark,
              }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2">
              <circle cx="12" cy="12" r="5"></circle>
              <path
                d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
            </svg>

            <!-- Switch -->
            <input
              type="checkbox"
              :checked="isDark"
              @change="toggleTheme"
              class="relative h-5 w-10 appearance-none rounded-full bg-gray-300 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 cursor-pointer after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-lg after:transition-transform after:duration-200 after:ease-in-out after:content-[''] checked:bg-primary-600 checked:after:translate-x-5"
              :title="
                isDark ? 'Switch to light mode' : 'Switch to dark mode'
              " />

            <!-- Moon Icon (Dark Mode) -->
            <svg
              class="w-5 h-5 transition-colors"
              :class="{
                'text-blue-500 dark:text-blue-400': isDark,
                'text-gray-400 dark:text-gray-500': !isDark,
              }"
              fill="currentColor"
              viewBox="0 0 24 24">
              <path
                d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main
        class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>

import { storeToRefs } from "pinia";
import { useMediaStore } from "@/stores/media.js";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import { useUserStore } from "@/stores/user.js";
import { useTheme } from "@/composables/useTheme.js";
import { ref, computed, watch, onMounted } from "vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const { isDark, toggleTheme } = useTheme();

// Submenu state - keep games submenu open when on games page
const gamesSubmenuOpen = ref(route.name === "games");
const moviesSubmenuOpen = ref(route.name === "movies");

// Mobile menu state
const mobileMenuOpen = ref(false);

// Game statuses configuration
const gameStatuses = [
  { value: "all", label: "All Games" },
  { value: "playing", label: "Playing" },
  { value: "completed", label: "Completed" },
  { value: "want_to_play", label: "Want to Play" },
  { value: "dropped", label: "Dropped" },
];

// Movie statuses configuration
const movieStatuses = [
  { value: "all", label: "All Movies" },
  { value: "watching", label: "Watching" },
  { value: "watched", label: "Watched" },
  { value: "want_to_watch", label: "Want to Watch" },
  { value: "dropped", label: "Dropped" },
];

const isGamesRoute = computed(() => {
  return route.name === "games";
});

const isMoviesRoute = computed(() => {
  return route.name === "movies";
});

const dynamicTitle = computed(() => {
  if (route.name && route.name !== "dashboard") {
    if (route.name === "home") {
      return "Home Dashboard";
    }
    // Capitalize first letter of route name and add "Dashboard"
    const routeName = route.name.charAt(0).toUpperCase() + route.name.slice(1);
    return `${routeName} Dashboard`;
  }
  return "Dashboard";
});

const toggleGamesSubmenu = () => {
  gamesSubmenuOpen.value = !gamesSubmenuOpen.value;
  // Close other submenus when opening games submenu with a slight delay for smoother UX
  if (gamesSubmenuOpen.value) {
    setTimeout(() => {
      moviesSubmenuOpen.value = false;
    }, 150);
  }
};

const toggleMoviesSubmenu = () => {
  moviesSubmenuOpen.value = !moviesSubmenuOpen.value;
  // Close other submenus when opening movies submenu with a slight delay for smoother UX
  if (moviesSubmenuOpen.value) {
    setTimeout(() => {
      gamesSubmenuOpen.value = false;
    }, 150);
  }
};

const handleGamesMenuClick = () => {
  // If submenu is already open and we're not on games route, navigate to games
  if (gamesSubmenuOpen.value && route.name !== "games") {
    router.push({ name: "games", query: { status: "all" } });
  }
  // If we're already on games route, just toggle submenu
  else if (route.name === "games") {
    toggleGamesSubmenu();
  }
  // If submenu is closed, open it and navigate to games
  else {
    toggleGamesSubmenu();
    router.push({ name: "games", query: { status: "all" } });
  }
};

const handleMoviesMenuClick = () => {
  // If submenu is already open and we're not on movies route, navigate to movies
  if (moviesSubmenuOpen.value && route.name !== "movies") {
    router.push({ name: "movies", query: { status: "all" } });
  }
  // If we're already on movies route, just toggle submenu
  else if (route.name === "movies") {
    toggleMoviesSubmenu();
  }
  // If submenu is closed, open it and navigate to movies
  else {
    toggleMoviesSubmenu();
    router.push({ name: "movies", query: { status: "all" } });
  }
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

// Watch for route changes to auto-open submenus and close mobile menu
watch(
  () => route.name,
  (newRouteName) => {
    if (newRouteName === "games") {
      gamesSubmenuOpen.value = true;
    } else if (newRouteName === "movies") {
      moviesSubmenuOpen.value = true;
    }
    // Close mobile menu on route change
    mobileMenuOpen.value = false;
  }
);

const logout = () => {
  authStore.logout();
  router.push({ name: "login" });
};

const getDisplayName = () => {
  const profile = userStore.profile;
  if (!profile) return "User";

  const firstName = profile.first_name;
  const lastName = profile.last_name;

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else {
    return profile.email?.split("@")[0] || "User";
  }
};

const mediaStore = useMediaStore();
const { enabledMenuOptions } = storeToRefs(mediaStore);

// Load user profile when component mounts
onMounted(async () => {
  if (!userStore.profile) {
    await userStore.getProfile();
  }
});
</script>
