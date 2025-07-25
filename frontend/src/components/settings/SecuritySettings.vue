<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-medium text-gray-900 dark:text-white">
        Security Settings
      </h2>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Manage your account security and password.
      </p>
    </div>

    <!-- Change Password Form -->
    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
      <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">
        Change Password
      </h3>

      <form @submit.prevent="submitPasswordChange" class="space-y-4">
        <div>
          <label
            for="current_password"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Password
          </label>
          <input
            id="current_password"
            v-model="passwordForm.current_password"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400" />
        </div>

        <div>
          <label
            for="new_password"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            New Password
          </label>
          <input
            id="new_password"
            v-model="passwordForm.new_password"
            type="password"
            required
            minlength="6"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400" />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Password must be at least 6 characters long
          </p>
        </div>

        <div>
          <label
            for="confirm_password"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm New Password
          </label>
          <input
            id="confirm_password"
            v-model="passwordForm.confirm_password"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
            :class="{
              'border-red-500 dark:border-red-400':
                passwordForm.new_password &&
                passwordForm.confirm_password &&
                passwordForm.new_password !== passwordForm.confirm_password,
            }" />
          <p
            v-if="
              passwordForm.new_password &&
              passwordForm.confirm_password &&
              passwordForm.new_password !== passwordForm.confirm_password
            "
            class="mt-1 text-xs text-red-500 dark:text-red-400">
            Passwords do not match
          </p>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="loading || !isPasswordFormValid"
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
              Changing Password...
            </span>
            <span v-else>Change Password</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Account Options -->
    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
      <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">
        Account Options
      </h3>

      <div class="space-y-6">
        <!-- Social Login Integration -->
        <div
          class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-600">
          <div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Social Login Integration
            </span>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Connect with Google, GitHub, or other providers for easier login
            </p>
          </div>
          <span
            class="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
            Planned
          </span>
        </div>

        <!-- Data Backup & Import -->
        <div class="py-3 border-b border-gray-200 dark:border-gray-600">
          <div class="flex items-center justify-between">
            <div>
              <span
                class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Backup My Data
              </span>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Download complete backup ZIP with user data, database, and
                images
              </p>
            </div>
            <div class="flex space-x-2">
              <button
                @click="handleBackup"
                :disabled="backupLoading"
                class="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <span v-if="backupLoading" class="flex items-center">
                  <svg
                    class="animate-spin -ml-1 mr-1 h-3 w-3"
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
                  Creating...
                </span>
                <span v-else>Backup</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Data Import -->
        <div
          class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-600">
          <div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Import My Backup
            </span>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Restore your complete library from a ZIP backup file
            </p>
          </div>
          <div class="flex space-x-2">
            <input
              ref="fileInput"
              type="file"
              accept=".zip"
              @change="handleFileSelect"
              class="hidden" />
            <button
              @click="$refs.fileInput?.click()"
              :disabled="importLoading"
              class="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="importLoading" class="flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-1 h-3 w-3"
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
                Importing...
              </span>
              <span v-else>Import</span>
            </button>
          </div>
        </div>

        <!-- Account Deletion -->
        <div class="flex items-center justify-between py-3">
          <div>
            <span class="text-sm font-medium text-red-600 dark:text-red-400">
              Delete Account
            </span>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Permanently delete your account and all associated data
            </p>
          </div>
          <button
            @click="showDeleteConfirmation = true"
            class="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Account Confirmation Modal -->
    <div
      v-if="showDeleteConfirmation"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Delete Account
        </h4>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          This action cannot be undone. All your media data, preferences, and
          account information will be permanently deleted.
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteConfirmation = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            Cancel
          </button>
          <button
            @click="handleAccountDeletion"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* global fetch, alert */
import { ref, computed } from "vue";

const emit = defineEmits([
  "change-password",
  "backup-data",
  "import-data",
  "delete-account",
  "backup-complete",
]);

const loading = ref(false);
const backupLoading = ref(false);
const importLoading = ref(false);
const showDeleteConfirmation = ref(false);
const fileInput = ref(null);

const passwordForm = ref({
  current_password: "",
  new_password: "",
  confirm_password: "",
});

const isPasswordFormValid = computed(() => {
  return (
    passwordForm.value.current_password &&
    passwordForm.value.new_password &&
    passwordForm.value.confirm_password &&
    passwordForm.value.new_password === passwordForm.value.confirm_password &&
    passwordForm.value.new_password.length >= 6
  );
});

const submitPasswordChange = async () => {
  if (!isPasswordFormValid.value) return;

  loading.value = true;

  try {
    await emit("change-password", {
      current_password: passwordForm.value.current_password,
      new_password: passwordForm.value.new_password,
    });

    // Reset form on success
    passwordForm.value = {
      current_password: "",
      new_password: "",
      confirm_password: "",
    };
  } finally {
    loading.value = false;
  }
};

const handleBackup = async () => {
  if (backupLoading.value) return;
  backupLoading.value = true;
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    const backendUrl = import.meta.env.DEV ? "http://localhost:3001" : "";
    const downloadUrl = `${backendUrl}/api/user/backup`;

    // Use fetch to get the backup file as a blob
    const response = await fetch(downloadUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to download backup");
    }
    const blob = await response.blob();
    // Try to get filename from Content-Disposition header
    let filename = "backlogus-backup.zip";
    const disposition = response.headers.get("Content-Disposition");
    if (disposition && disposition.includes("filename=")) {
      filename = disposition.split("filename=")[1].replace(/"/g, "").trim();
    }
    // Add timestamp to filename in yyyyMMddHHmmss format
    const now = new Date();

    const pad = (n) => n.toString().padStart(2, "0");
    const timestamp =
      now.getFullYear().toString() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      pad(now.getHours()) +
      pad(now.getMinutes()) +
      pad(now.getSeconds());
    // Insert timestamp before .zip
    filename = filename.replace(/\.zip$/, `-${timestamp}.zip`);
    // Create a link and trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 1000);
    // Emit event for parent to show toaster notification
    emit("backup-complete");
  } catch (error) {
    console.error("Backup failed:", error);
    alert("Backup failed: " + error.message);
  } finally {
    backupLoading.value = false;
  }
};

const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  importLoading.value = true;
  try {
    await emit("import-data", file);
  } catch (error) {
    console.error("Import failed:", error);
    alert("Import failed: " + error.message);
  } finally {
    importLoading.value = false;
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  }
};

const handleAccountDeletion = async () => {
  showDeleteConfirmation.value = false;
  emit("delete-account");
};
</script>
