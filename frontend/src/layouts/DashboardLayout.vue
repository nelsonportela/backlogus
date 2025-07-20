<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="w-64 bg-white shadow-lg">
      <div class="flex items-center justify-center h-16 border-b">
        <h1 class="text-xl font-bold text-gray-800">Media Tracker</h1>
      </div>
      <nav class="mt-8">
        <div class="px-4 space-y-2">
          <router-link
            to="/games"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            :class="{ 'bg-primary-50 text-primary-700': $route.name === 'games' }"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Games
          </router-link>
          <div class="px-4 py-2 text-gray-400 text-sm">
            More media types coming soon...
          </div>
        </div>
      </nav>
      
      <!-- User menu at bottom -->
      <div class="absolute bottom-0 w-64 p-4 border-t">
        <button
          @click="logout"
          class="flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b px-6 py-4">
        <h2 class="text-2xl font-semibold text-gray-800">
          {{ pageTitle }}
        </h2>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'DashboardLayout',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()

    const pageTitle = computed(() => {
      switch (route.name) {
        case 'games':
          return 'Games'
        default:
          return 'Dashboard'
      }
    })

    const logout = () => {
      authStore.logout()
      router.push({ name: 'login' })
    }

    return {
      pageTitle,
      logout
    }
  }
}
</script>
