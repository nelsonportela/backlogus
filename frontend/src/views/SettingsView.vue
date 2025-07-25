<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-6">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and API credentials
          </p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
        <!-- Tab Navigation -->
        <div class="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <nav class="-mb-px flex space-x-8 px-6 min-w-0 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style="max-width:100vw;" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
              ]">
              <div class="flex items-center">
                <span
                  class="mr-2 h-5 w-5 inline-block align-middle"
                  aria-hidden="true"
                  v-html="tab.icon"
                />
                {{ tab.name }}
              </div>
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'" class="space-y-6">
            <ProfileSettings
              :profile="userStore.profile"
              :loading="userStore.loading"
              @update-profile="handleUpdateProfile" />
          </div>

          <!-- Security Tab -->
          <div v-if="activeTab === 'security'" class="space-y-6">
            <SecuritySettings 
              @change-password="handleChangePassword"

              @import-data="handleImportData"
              @delete-account="handleDeleteAccount"
              @backup-complete="handleBackupComplete" />
          </div>

          <!-- API Credentials Tab -->
          <div v-if="activeTab === 'api'" class="space-y-6">
            <ApiCredentialsSettings
              :credentials="userStore.apiCredentials"
              @save-credentials="handleSaveCredentials"
              @delete-credentials="handleDeleteCredentials" />
          </div>

          <!-- Preferences Tab -->
          <div v-if="activeTab === 'preferences'" class="space-y-6">
            <PreferencesSettings
              :profile="userStore.profile"
              @update-preferences="handleUpdatePreferences" />
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div
      v-if="message.text"
      :class="[
        'fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50',
        message.type === 'success'
          ? 'bg-green-500 text-white'
          : message.type === 'info'
          ? 'bg-blue-500 text-white'
          : 'bg-red-500 text-white',
      ]">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted } from "vue";
import { useTheme } from "@/composables/useTheme.js";
import { useUserStore } from "@/stores/user.js";
import { useMediaStore } from "@/stores/media.js";
import ProfileSettings from "@/components/settings/ProfileSettings.vue";
import SecuritySettings from "@/components/settings/SecuritySettings.vue";
import ApiCredentialsSettings from "@/components/settings/ApiCredentialsSettings.vue";
import PreferencesSettings from "@/components/settings/PreferencesSettings.vue";


// Inline SVG strings for icons
const UserIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
</svg>`

const ShieldIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
</svg>`

const KeyIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
</svg>`

const CogIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>`

const userStore = useUserStore();

const activeTab = ref("profile");
const message = ref({ text: "", type: "" });

const tabs = [
  { id: "profile", name: "Profile", icon: UserIcon },
  { id: "security", name: "Security", icon: ShieldIcon },
  { id: "api", name: "API Credentials", icon: KeyIcon },
  { id: "preferences", name: "Preferences", icon: CogIcon },
];

const showMessage = (text, type = "success") => {
  message.value = { text, type };
  setTimeout(() => {
    message.value = { text: "", type: "" };
  }, 5000);
};

const handleUpdateProfile = async (profileData) => {
  const result = await userStore.updateProfile(profileData);
  if (result.success) {
    showMessage("Profile updated successfully");
  } else {
    showMessage(result.error, "error");
  }
};

const handleChangePassword = async (passwordData) => {
  const result = await userStore.changePassword(passwordData);
  if (result.success) {
    showMessage("Password changed successfully");
  } else {
    showMessage(result.error, "error");
  }
};

const { isDark } = useTheme();
const mediaStore = useMediaStore();
const handleUpdatePreferences = async (preferences) => {
  if (preferences.theme_preference !== undefined) {
    // Only send to backend if theme_preference is present
    const result = await userStore.updateProfile({ theme_preference: preferences.theme_preference });
    if (result.success) {
      showMessage("Preferences updated successfully");
    } else {
      showMessage(result.error, "error");
    }
    // Update theme immediately
    if (preferences.theme_preference === "dark") {
      isDark.value = true;
      localStorage.setItem("theme", "dark");
    } else if (preferences.theme_preference === "light") {
      isDark.value = false;
      localStorage.setItem("theme", "light");
    } else {
      // system: follow system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      isDark.value = prefersDark;
      localStorage.removeItem("theme");
    }
  } else {
    // Only localStorage preferences, no backend call
    showMessage("Preferences updated successfully");
  }
  // Always reload menu options after preferences update
  mediaStore.reloadEnabledMenuOptions();
};

const handleSaveCredentials = async (provider, credentials) => {
  const result = await userStore.saveApiCredentials(provider, credentials);
  if (result.success) {
    showMessage(`${provider.toUpperCase()} credentials saved successfully`);
  } else {
    showMessage(result.error, "error");
  }
};

const handleDeleteCredentials = async (provider) => {
  const result = await userStore.deleteApiCredentials(provider);
  if (result.success) {
    showMessage(`${provider.toUpperCase()} credentials removed successfully`);
  } else {
    showMessage(result.error, "error");
  }
};

const handleImportData = async (file) => {
  try {
    showMessage("Importing backup...", "info");
    const result = await userStore.importBackup(file);
    if (result.success) {
      showMessage("Backup imported successfully! Please refresh the page to see your restored data.");
      // Optionally reload the page after a delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      showMessage(result.error || "Failed to import backup", "error");
    }
  } catch (error) {
    showMessage("Failed to import backup", "error");
  }
};

const handleDeleteAccount = async () => {
  try {
    // TODO: Implement account deletion functionality
    showMessage("Account deletion feature coming soon!", "info");
  } catch (error) {
    showMessage("Failed to delete account", "error");
  }
};

const handleBackupComplete = () => {
  showMessage(`Backup completed successfully!`);
};

onMounted(async () => {
  await userStore.getProfile();
  await userStore.getApiCredentials();
});
</script>
