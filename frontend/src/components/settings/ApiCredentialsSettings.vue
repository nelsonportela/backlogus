<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-medium text-gray-900 dark:text-white">
        API Credentials
      </h2>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Configure your external API credentials for enhanced functionality.
      </p>
    </div>

    <!-- IGDB Credentials -->
    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3
            class="text-md font-medium text-gray-900 dark:text-white flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            IGDB (Internet Game Database)
          </h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Required for game search and metadata. Get your credentials from
            <a
              href="https://api.igdb.com/"
              target="_blank"
              class="text-primary-600 dark:text-primary-400 hover:underline">
              IGDB API
            </a>
          </p>
        </div>
        <div class="ml-4">
          <span
            :class="[
              'px-2 py-1 text-xs font-medium rounded',
              isProviderConfigured('igdb')
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            ]">
            {{ isProviderConfigured("igdb") ? "Configured" : "Not Configured" }}
          </span>
        </div>
      </div>

      <div class="mt-4">
        <button
          v-if="!openForms.igdb"
          @click="toggleCredentialForm('igdb')"
          class="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          :aria-pressed="openForms.igdb">
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4v16m8-8H4" />
          </svg>
          {{ isProviderConfigured("igdb") ? "Update" : "Configure" }}
          Credentials
        </button>
      </div>

      <!-- IGDB Form -->
      <form
        v-if="openForms.igdb"
        @submit.prevent="saveCredentials('igdb')"
        class="mt-4 space-y-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Client ID *
          </label>
          <input
            v-model="forms.igdb.client_id"
            type="text"
            required
            placeholder="Your IGDB Client ID"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400" />
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Access Token *
          </label>
          <input
            v-model="forms.igdb.access_token"
            type="password"
            required
            placeholder="Your IGDB Access Token"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400" />
        </div>

        <div
          class="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
          <button
            v-if="isProviderConfigured('igdb')"
            type="button"
            @click="deleteCredentials('igdb')"
            class="w-full sm:w-auto mb-2 sm:mb-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            Remove Credentials
          </button>
          <div
            class="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto ml-auto">
            <button
              type="button"
              @click="toggleCredentialForm('igdb')"
              class="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading.igdb"
              class="w-full sm:w-auto px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <span v-if="loading.igdb">Saving...</span>
              <span v-else>Save Credentials</span>
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- TMDB Credentials -->
    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3
            class="text-md font-medium text-gray-900 dark:text-white flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
            </svg>
            TMDB (The Movie Database)
          </h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Required for movie and TV show search. Get your API key from
            <a
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              class="text-primary-600 dark:text-primary-400 hover:underline">
              TMDB API
            </a>
          </p>
        </div>
        <div class="ml-4">
          <span
            :class="[
              'px-2 py-1 text-xs font-medium rounded',
              isProviderConfigured('tmdb')
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            ]">
            {{ isProviderConfigured("tmdb") ? "Configured" : "Not Configured" }}
          </span>
        </div>
      </div>

      <div class="mt-4">
        <button
          v-if="!openForms.tmdb"
          @click="toggleCredentialForm('tmdb')"
          class="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          :aria-pressed="openForms.tmdb">
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4v16m8-8H4" />
          </svg>
          {{ isProviderConfigured("tmdb") ? "Update" : "Configure" }}
          Credentials
        </button>
      </div>

      <!-- TMDB Form -->
      <form
        v-if="openForms.tmdb"
        @submit.prevent="saveCredentials('tmdb')"
        class="mt-4 space-y-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            API Key *
          </label>
          <input
            v-model="forms.tmdb.api_key"
            type="password"
            required
            placeholder="Your TMDB API Key"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400" />
        </div>

        <div
          class="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
          <button
            v-if="isProviderConfigured('tmdb')"
            type="button"
            @click="deleteCredentials('tmdb')"
            class="w-full sm:w-auto mb-2 sm:mb-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            Remove Credentials
          </button>
          <div
            class="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto ml-auto">
            <button
              type="button"
              @click="toggleCredentialForm('tmdb')"
              class="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading.tmdb"
              class="w-full sm:w-auto px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <span v-if="loading.tmdb">Saving...</span>
              <span v-else>Save Credentials</span>
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Hardcover Credentials -->
    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3
            class="text-md font-medium text-gray-900 dark:text-white flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM6 17V7h2v10H6zm4-5V9h2v3h-2zm4 0V9h2v3h-2z" />
            </svg>
            Hardcover.app
          </h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Required for book search and metadata. Get your API key from
            <a
              href="https://hardcover.app/developers"
              target="_blank"
              class="text-primary-600 dark:text-primary-400 hover:underline">
              Hardcover API
            </a>
          </p>
        </div>
        <div class="ml-4">
          <span
            :class="[
              'px-2 py-1 text-xs font-medium rounded',
              isProviderConfigured('hardcover')
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            ]">
            {{
              isProviderConfigured("hardcover")
                ? "Configured"
                : "Not Configured"
            }}
          </span>
        </div>
      </div>

      <div class="mt-4">
        <button
          v-if="!openForms.hardcover"
          @click="toggleCredentialForm('hardcover')"
          class="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          :aria-pressed="openForms.hardcover">
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4v16m8-8H4" />
          </svg>
          {{ isProviderConfigured("hardcover") ? "Update" : "Configure" }}
          Credentials
        </button>
      </div>

      <!-- Hardcover Form -->
      <form
        v-if="openForms.hardcover"
        @submit.prevent="saveCredentials('hardcover')"
        class="mt-4 space-y-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            API Key *
          </label>
          <input
            v-model="forms.hardcover.api_key"
            type="password"
            required
            placeholder="Your Hardcover API Key"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400" />
        </div>

        <div
          class="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
          <button
            v-if="isProviderConfigured('hardcover')"
            type="button"
            @click="deleteCredentials('hardcover')"
            class="w-full sm:w-auto mb-2 sm:mb-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            Remove Credentials
          </button>
          <div
            class="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto ml-auto">
            <button
              type="button"
              @click="toggleCredentialForm('hardcover')"
              class="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading.hardcover"
              class="w-full sm:w-auto px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <span v-if="loading.hardcover">Saving...</span>
              <span v-else>Save Credentials</span>
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Information Panel -->
    <div
      class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div class="flex">
        <svg
          class="w-5 h-5 text-blue-400 mt-0.5 mr-3"
          fill="currentColor"
          viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd" />
        </svg>
        <div class="text-sm">
          <h4 class="font-medium text-blue-800 dark:text-blue-200">
            About API Credentials
          </h4>
          <p class="mt-1 text-blue-700 dark:text-blue-300">
            Your API credentials are stored securely and encrypted. These are
            used to fetch data from external services when you search for media
            items. Without these credentials, you won't be able to search for
            new media items.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  credentials: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["save-credentials", "delete-credentials"]);

const openForms = ref({
  igdb: false,
  tmdb: false,
  hardcover: false,
});

const loading = ref({
  igdb: false,
  tmdb: false,
  hardcover: false,
});

const forms = ref({
  igdb: {
    client_id: "",
    access_token: "",
  },
  tmdb: {
    api_key: "",
  },
  hardcover: {
    api_key: "",
  },
});

const isProviderConfigured = (provider) => {
  return props.credentials.some((cred) => cred.api_provider === provider);
};

const toggleCredentialForm = (provider) => {
  openForms.value[provider] = !openForms.value[provider];
  if (!openForms.value[provider]) {
    // Reset form when closing
    if (provider === "igdb") {
      forms.value.igdb = { client_id: "", access_token: "" };
    } else if (provider === "tmdb") {
      forms.value.tmdb = { api_key: "" };
    } else if (provider === "hardcover") {
      forms.value.hardcover = { api_key: "" };
    }
  }
};

const saveCredentials = async (provider) => {
  loading.value[provider] = true;

  try {
    await emit("save-credentials", provider, forms.value[provider]);
    openForms.value[provider] = false;

    // Reset form
    if (provider === "igdb") {
      forms.value.igdb = { client_id: "", access_token: "" };
    } else if (provider === "tmdb") {
      forms.value.tmdb = { api_key: "" };
    } else if (provider === "hardcover") {
      forms.value.hardcover = { api_key: "" };
    }
  } finally {
    loading.value[provider] = false;
  }
};

const deleteCredentials = async (provider) => {
  if (
    window.confirm(
      `Are you sure you want to remove your ${provider.toUpperCase()} credentials?`
    )
  ) {
    await emit("delete-credentials", provider);
    openForms.value[provider] = false;

    // Reset form
    if (provider === "igdb") {
      forms.value.igdb = { client_id: "", access_token: "" };
    } else if (provider === "tmdb") {
      forms.value.tmdb = { api_key: "" };
    } else if (provider === "hardcover") {
      forms.value.hardcover = { api_key: "" };
    }
  }
};
</script>
