<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click.self="cancel">
    <div class="flex items-center justify-center min-h-screen px-4 py-4">
      <!-- Background overlay -->
      <div
        class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
        @click="cancel"></div>

      <!-- Modal panel -->
      <div
        class="relative w-full max-w-xs sm:max-w-md mx-auto overflow-hidden text-left transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
        <!-- Header -->
        <div class="px-4 sm:px-6 py-4">
          <div class="flex items-center">
            <div
              class="mx-auto flex-shrink-0 flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0">
              <svg
                class="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.08 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3
                class="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                {{ title }}
              </h3>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 pb-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ message }}
          </p>
        </div>

        <!-- Actions -->
        <div class="px-6 py-4 flex flex-row-reverse">
          <button
            @click="confirm"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 sm:ml-3 sm:w-auto sm:text-sm">
            {{ confirmText }}
          </button>
          <button
            @click="cancel"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            {{ cancelText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from "vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Confirm Action",
  },
  message: {
    type: String,
    required: true,
  },
  confirmText: {
    type: String,
    default: "Confirm",
  },
  cancelText: {
    type: String,
    default: "Cancel",
  },
});

const emit = defineEmits(["confirm", "cancel"]);

const confirm = () => {
  emit("confirm");
};

const cancel = () => {
  emit("cancel");
};

// Close modal on Escape key
const handleKeydown = (event) => {
  if (event.key === "Escape" && props.isOpen) {
    cancel();
  }
};

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (typeof document !== "undefined") {
        document.addEventListener("keydown", handleKeydown);
        document.body.style.overflow = "hidden";
      }
    } else {
      if (typeof document !== "undefined") {
        document.removeEventListener("keydown", handleKeydown);
        document.body.style.overflow = "";
      }
    }
  }
);
</script>
