import { ref, watch } from "vue";

const isDark = ref(false);

// Initialize theme from localStorage or system preference
const initTheme = () => {
  const saved = localStorage.getItem("theme");
  if (saved) {
    isDark.value = saved === "dark";
  } else {
    // Check system preference
    isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  applyTheme();
};

// Apply theme to document
const applyTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

// Watch for changes and persist
watch(isDark, (newValue) => {
  localStorage.setItem("theme", newValue ? "dark" : "light");
  applyTheme();
});

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  return {
    isDark,
    toggleTheme,
    initTheme,
  };
}
