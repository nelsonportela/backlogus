/* eslint-env browser */
import { ref, onMounted } from "vue";

/**
 * Composable for handling PWA installation and fullscreen features
 */
export function usePWA() {
  const canInstall = ref(false);
  const installPrompt = ref(null);
  const isInstalled = ref(false);
  const isStandalone = ref(false);

  const checkInstallation = () => {
    // Check if app is running in standalone mode (PWA installed)
    isStandalone.value =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://");

    isInstalled.value = isStandalone.value;
  };

  const handleBeforeInstallPrompt = (event) => {
    // Prevent the mini-infobar from appearing on mobile
    event.preventDefault();

    // Stash the event so it can be triggered later
    installPrompt.value = event;
    canInstall.value = true;
  };

  const handleAppInstalled = () => {
    console.log("PWA was installed");
    canInstall.value = false;
    installPrompt.value = null;
    isInstalled.value = true;

    // Add installed class for styling
    document.documentElement.classList.add("is-installed");
  };

  const installApp = async () => {
    if (!installPrompt.value) {
      return false;
    }

    // Show the install prompt
    installPrompt.value.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.value.userChoice;

    // Clean up the prompt
    installPrompt.value = null;
    canInstall.value = false;

    return outcome === "accepted";
  };

  const requestFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        return true;
      } catch (err) {
        console.warn("Fullscreen request failed:", err);
        return false;
      }
    }
    return true;
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
        return true;
      } catch (err) {
        console.warn("Exit fullscreen failed:", err);
        return false;
      }
    }
    return true;
  };

  onMounted(() => {
    checkInstallation();

    // Listen for install prompt
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed
    window.addEventListener("appinstalled", handleAppInstalled);

    // Listen for display mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    mediaQuery.addEventListener("change", checkInstallation);

    // Cleanup function is handled by Vue's onUnmounted automatically
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      mediaQuery.removeEventListener("change", checkInstallation);
    };
  });

  return {
    canInstall,
    isInstalled,
    isStandalone,
    installApp,
    requestFullscreen,
    exitFullscreen,
  };
}
