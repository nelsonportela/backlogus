<template>
  <div
    class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to Media Tracker
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ isLogin ? "Sign in to your account" : "Create your account" }}
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <input type="hidden" name="remember" value="true" />
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              v-model="formData.email"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              :autocomplete="isLogin ? 'current-password' : 'new-password'"
              required
              :class="[
                'appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm',
                isLogin ? 'rounded-b-md' : '',
              ]"
              placeholder="Password"
              v-model="formData.password"
            />
          </div>
          <div v-if="!isLogin">
            <label for="password-confirm" class="sr-only"
              >Confirm Password</label
            >
            <input
              id="password-confirm"
              name="password-confirm"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Confirm Password"
              v-model="formData.confirmPassword"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{
              loading
                ? isLogin
                  ? "Signing in..."
                  : "Creating account..."
                : isLogin
                  ? "Sign in"
                  : "Create account"
            }}
          </button>
        </div>

        <div class="text-center">
          <button
            type="button"
            @click="toggleMode"
            class="text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            {{
              isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "LoginView",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const isLogin = ref(true);
    const formData = ref({
      email: "",
      password: "",
      confirmPassword: "",
    });

    const loading = ref(false);
    const error = ref("");

    const toggleMode = () => {
      isLogin.value = !isLogin.value;
      error.value = "";
      formData.value.confirmPassword = "";
    };

    const handleSubmit = async () => {
      error.value = "";

      // Validation
      if (!formData.value.email || !formData.value.password) {
        error.value = "Please fill in all fields";
        return;
      }

      if (!isLogin.value) {
        if (formData.value.password !== formData.value.confirmPassword) {
          error.value = "Passwords do not match";
          return;
        }
        if (formData.value.password.length < 6) {
          error.value = "Password must be at least 6 characters long";
          return;
        }
      }

      loading.value = true;

      let result;
      if (isLogin.value) {
        result = await authStore.login(
          formData.value.email,
          formData.value.password,
        );
      } else {
        result = await authStore.register(
          formData.value.email,
          formData.value.password,
        );
      }

      if (result.success) {
        router.push({ name: "dashboard" });
      } else {
        error.value = result.error;
      }

      loading.value = false;
    };

    return {
      isLogin,
      formData,
      loading,
      error,
      toggleMode,
      handleSubmit,
    };
  },
};
</script>
