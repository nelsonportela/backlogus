import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import LoginView from "@/views/LoginView.vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import HomeView from "@/views/HomeView.vue";
import GamesView from "@/views/GamesView.vue";
import MoviesView from "@/views/MoviesView.vue";
import ShowsView from "@/views/ShowsView.vue";
import BooksView from "@/views/BooksView.vue";
import SettingsView from "@/views/SettingsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/",
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "dashboard",
          redirect: { name: "home" },
        },
        {
          path: "home",
          name: "home",
          component: HomeView,
        },
        {
          path: "games",
          name: "games",
          component: GamesView,
        },
        {
          path: "movies",
          name: "movies",
          component: MoviesView,
        },
        {
          path: "tv",
          name: "tv",
          component: ShowsView,
        },
        {
          path: "books",
          name: "books",
          component: BooksView,
        },
        {
          path: "settings",
          name: "settings",
          component: SettingsView,
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: "login" });
  } else if (to.name === "login" && authStore.isAuthenticated) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
