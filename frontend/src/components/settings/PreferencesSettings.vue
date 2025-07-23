<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-medium text-gray-900 dark:text-white">
        Preferences
      </h2>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Customize your application preferences and display settings.
      </p>
    </div>

    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Theme Preference -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">
          Appearance
        </h3>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Theme Preference
          </label>
          <div class="space-y-3">
            <div class="flex items-center">
              <input
                id="theme-light"
                v-model="formData.theme_preference"
                type="radio"
                value="light"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
              <label for="theme-light" class="ml-3 flex items-center">
                <svg
                  class="w-5 h-5 mr-2 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-gray-700 dark:text-gray-300"
                  >Light</span
                >
              </label>
            </div>

            <div class="flex items-center">
              <input
                id="theme-dark"
                v-model="formData.theme_preference"
                type="radio"
                value="dark"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
              <label for="theme-dark" class="ml-3 flex items-center">
                <svg
                  class="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                <span class="text-sm text-gray-700 dark:text-gray-300"
                  >Dark</span
                >
              </label>
            </div>

            <div class="flex items-center">
              <input
                id="theme-system"
                v-model="formData.theme_preference"
                type="radio"
                value="system"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
              <label for="theme-system" class="ml-3 flex items-center">
                <svg
                  class="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="text-sm text-gray-700 dark:text-gray-300"
                  >System</span
                >
              </label>
            </div>
          </div>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            System preference will automatically switch between light and dark
            based on your device settings.
          </p>
        </div>
      </div>

      <!-- Library Preferences -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">
          Library Settings
        </h3>

        <div class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default View
            </label>
            <select
              v-model="formData.default_view"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400">
              <option value="grid">Grid View</option>
              <option value="list">List View</option>
              <option value="compact">Compact View</option>
            </select>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Items per Page
            </label>
            <select
              v-model="formData.items_per_page"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>

          <div class="flex items-center">
            <input
              id="show-spoilers"
              v-model="formData.show_spoilers"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700" />
            <label
              for="show-spoilers"
              class="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Show spoiler content by default
            </label>
          </div>

          <div class="flex items-center">
            <input
              id="auto-update-status"
              v-model="formData.auto_update_status"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700" />
            <label
              for="auto-update-status"
              class="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Automatically update status when adding items
            </label>
          </div>
        </div>
      </div>

      <!-- Notification Preferences -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">
          Notifications
        </h3>

        <div class="space-y-4">
          <div class="flex items-center">
            <input
              id="email-updates"
              v-model="formData.email_updates"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700" />
            <label
              for="email-updates"
              class="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Email updates about new features
            </label>
          </div>

          <div class="flex items-center">
            <input
              id="release-notifications"
              v-model="formData.release_notifications"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700" />
            <label
              for="release-notifications"
              class="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Notify about upcoming releases
            </label>
          </div>

          <p class="text-xs text-gray-500 dark:text-gray-400">
            <span
              class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Coming Soon
            </span>
            Notification features are currently in development.
          </p>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="loading || !hasChanges"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          <span v-if="loading" class="flex items-center">
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
          <span v-else>Save Preferences</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  profile: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update-preferences"]);

const loading = ref(false);

const formData = ref({
  theme_preference: "system",
  default_view: "grid",
  items_per_page: 20,
  show_spoilers: false,
  auto_update_status: true,
  email_updates: false,
  release_notifications: false,
});

const originalData = ref({});

// Watch for profile changes to update form
watch(
  () => props.profile,
  (newProfile) => {
    if (newProfile) {
      formData.value = {
        theme_preference: newProfile.theme_preference || "system",
        // These are placeholder preferences - not yet stored in backend
        default_view: "grid",
        items_per_page: 20,
        show_spoilers: false,
        auto_update_status: true,
        email_updates: false,
        release_notifications: false,
      };
      originalData.value = { ...formData.value };
    }
  },
  { immediate: true }
);

const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value);
});

const submitForm = async () => {
  if (!hasChanges.value) return;

  loading.value = true;

  try {
    // For now, only save theme_preference to backend
    // Other preferences can be stored in localStorage or added to backend later
    await emit("update-preferences", {
      theme_preference: formData.value.theme_preference,
    });

    // Store other preferences in localStorage for now
    localStorage.setItem(
      "media_tracker_preferences",
      JSON.stringify({
        default_view: formData.value.default_view,
        items_per_page: formData.value.items_per_page,
        show_spoilers: formData.value.show_spoilers,
        auto_update_status: formData.value.auto_update_status,
        email_updates: formData.value.email_updates,
        release_notifications: formData.value.release_notifications,
      })
    );

    originalData.value = { ...formData.value };
  } finally {
    loading.value = false;
  }
};
</script>
