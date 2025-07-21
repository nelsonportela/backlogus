import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./stores/auth";
import { useTheme } from "./composables/useTheme";
import "./style.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Initialize theme
const { initTheme } = useTheme();
initTheme();

// Initialize auth after Pinia is set up
const authStore = useAuthStore();
authStore.initializeAuth();

app.mount("#app");
