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
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
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
                <component
                  :is="tab.icon"
                  class="mr-2 h-5 w-5"
                  aria-hidden="true" />
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
              @backup-data="handleBackupData"
              @import-data="handleImportData"
              @delete-account="handleDeleteAccount" />
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
import { useUserStore } from "@/stores/user.js";
import ProfileSettings from "@/components/settings/ProfileSettings.vue";
import SecuritySettings from "@/components/settings/SecuritySettings.vue";
import ApiCredentialsSettings from "@/components/settings/ApiCredentialsSettings.vue";
import PreferencesSettings from "@/components/settings/PreferencesSettings.vue";

// Icons (you can replace these with actual icon components)
const UserIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
};

const ShieldIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
};

const KeyIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>`,
};

const CogIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
};

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

const handleUpdatePreferences = async (preferences) => {
  const result = await userStore.updateProfile(preferences);
  if (result.success) {
    showMessage("Preferences updated successfully");
  } else {
    showMessage(result.error, "error");
  }
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

const handleExportData = async () => {
  try {
    // TODO: Implement data export functionality
    showMessage("Data export feature coming soon!", "info");
  } catch (error) {
    showMessage("Failed to export data", "error");
  }
};

const handleBackupData = async () => {
  try {
    showMessage("Creating backup...", "info");
    const result = await userStore.createBackup();
    if (result.success) {
      showMessage("Backup downloaded successfully!");
    } else {
      showMessage(result.error || "Failed to create backup", "error");
    }
  } catch (error) {
    showMessage("Failed to create backup", "error");
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

onMounted(async () => {
  await userStore.getProfile();
  await userStore.getApiCredentials();
});
</script>
