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
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Current Password
          </label>
          <input
            id="current_password"
            v-model="passwordForm.current_password"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
          />
        </div>

        <div>
          <label
            for="new_password"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            New Password
          </label>
          <input
            id="new_password"
            v-model="passwordForm.new_password"
            type="password"
            required
            minlength="6"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Password must be at least 6 characters long
          </p>
        </div>

        <div>
          <label
            for="confirm_password"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm New Password
          </label>
          <input
            id="confirm_password"
            v-model="passwordForm.confirm_password"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
            :class="{
              'border-red-500 dark:border-red-400': passwordForm.new_password && passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password
            }"
          />
          <p 
            v-if="passwordForm.new_password && passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password"
            class="mt-1 text-xs text-red-500 dark:text-red-400"
          >
            Passwords do not match
          </p>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="loading || !isPasswordFormValid"
            class="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span v-if="loading" class="flex items-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Changing Password...
            </span>
            <span v-else>Change Password</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Account Information -->
    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
      <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">
        Account Information
      </h3>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between py-2">
          <div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Two-Factor Authentication
            </span>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Add an extra layer of security to your account
            </p>
          </div>
          <span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
            Coming Soon
          </span>
        </div>

        <div class="flex items-center justify-between py-2">
          <div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Login Sessions
            </span>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Manage your active login sessions
            </p>
          </div>
          <span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const emit = defineEmits(["change-password"]);

const loading = ref(false);

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
</script>
