<template>
  <div
    class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold mb-2">
          {{ getTimeOfDayGreeting() }}{{ getPersonalizedGreeting() }}! 👋
        </h1>
        <p class="text-blue-100 text-lg">
          Here's what's happening with your media collection
        </p>
        <p
          v-if="userStore.profile?.timezone"
          class="text-blue-200 text-sm mt-1">
          {{ getCurrentTimeInUserTimezone() }}
        </p>
      </div>
      <div class="hidden md:block">
        <div
          class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
          <img
            v-if="userStore.profile?.avatar_url"
            :src="userStore.profile.avatar_url"
            :alt="getDisplayName()"
            class="w-20 h-20 object-cover" />
          <svg
            v-else
            class="w-10 h-10"
            fill="currentColor"
            viewBox="0 0 24 24">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "@/stores/user";
import { useDateTime } from "@/composables/useDateTime";

const userStore = useUserStore();
const { getCurrentTimeInUserTimezone, getTimeOfDayGreeting } = useDateTime();

const getDisplayName = () => {
  const profile = userStore.profile;
  if (!profile) return "";

  const firstName = profile.first_name;
  const lastName = profile.last_name;

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else {
    return profile.email?.split("@")[0] || "";
  }
};

const getPersonalizedGreeting = () => {
  const displayName = getDisplayName();
  return displayName ? `, ${displayName}` : "";
};
</script>
