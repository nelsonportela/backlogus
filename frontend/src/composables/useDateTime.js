import { computed } from "vue";
import { useUserStore } from "@/stores/user";

export function useDateTime() {
  const userStore = useUserStore();

  const userTimezone = computed(() => {
    return userStore.profile?.timezone || "UTC";
  });

  const formatDateInUserTimezone = (date, options = {}) => {
    if (!date) return "";

    try {
      const parsedDate = new Date(date);
      const defaultOptions = {
        timeZone: userTimezone.value,
        year: "numeric",
        month: "short",
        day: "numeric",
        ...options,
      };

      return new Intl.DateTimeFormat("en-US", defaultOptions).format(parsedDate);
    } catch (error) {
      console.warn("Error formatting date:", error);
      // Fallback to regular date formatting
      return new Date(date).toLocaleDateString();
    }
  };

  const formatTimeInUserTimezone = (date, options = {}) => {
    if (!date) return "";

    try {
      const parsedDate = new Date(date);
      const defaultOptions = {
        timeZone: userTimezone.value,
        hour: "2-digit",
        minute: "2-digit",
        ...options,
      };

      return new Intl.DateTimeFormat("en-US", defaultOptions).format(parsedDate);
    } catch (error) {
      console.warn("Error formatting time:", error);
      // Fallback to regular time formatting
      return new Date(date).toLocaleTimeString();
    }
  };

  const formatDateTimeInUserTimezone = (date, options = {}) => {
    if (!date) return "";

    try {
      const parsedDate = new Date(date);
      const defaultOptions = {
        timeZone: userTimezone.value,
        year: "numeric",
        month: "short", 
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        ...options,
      };

      return new Intl.DateTimeFormat("en-US", defaultOptions).format(parsedDate);
    } catch (error) {
      console.warn("Error formatting datetime:", error);
      // Fallback to regular datetime formatting
      return new Date(date).toLocaleString();
    }
  };

  const formatRelativeDateInUserTimezone = (date) => {
    if (!date) return "";

    try {
      const parsedDate = new Date(date);
      const now = new Date();
      
      // Convert both dates to the user's timezone for proper comparison
      const userNow = new Date(now.toLocaleString("en-US", { timeZone: userTimezone.value }));
      const userDate = new Date(parsedDate.toLocaleString("en-US", { timeZone: userTimezone.value }));
      
      const diffInMs = userNow - userDate;
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

      if (diffInMinutes < 1) {
        return "Just now";
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
      } else {
        return formatDateInUserTimezone(date);
      }
    } catch (error) {
      console.warn("Error formatting relative date:", error);
      return formatDateInUserTimezone(date);
    }
  };

  const getCurrentTimeInUserTimezone = (options = {}) => {
    try {
      const now = new Date();
      const defaultOptions = {
        timeZone: userTimezone.value,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23", // Force 24-hour format
        ...options,
      };

      return new Intl.DateTimeFormat("en-US", defaultOptions).format(now);
    } catch (error) {
      console.warn("Error getting current time:", error);
      return new Date().toLocaleString();
    }
  };

  const getTimeOfDayGreeting = () => {
    try {
      const now = new Date();
      const userTime = new Date(now.toLocaleString("en-US", { timeZone: userTimezone.value }));
      const hour = userTime.getHours();

      if (hour < 6) {
        return "Good night";
      } else if (hour < 12) {
        return "Good morning";
      } else if (hour < 17) {
        return "Good afternoon";  
      } else if (hour < 22) {
        return "Good evening";
      } else {
        return "Good night";
      }
    } catch (error) {
      console.warn("Error getting time of day:", error);
      return "Hello";
    }
  };

  return {
    userTimezone,
    formatDateInUserTimezone,
    formatTimeInUserTimezone,
    formatDateTimeInUserTimezone,
    formatRelativeDateInUserTimezone,
    getCurrentTimeInUserTimezone,
    getTimeOfDayGreeting,
  };
}
