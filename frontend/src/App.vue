<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { useViewportHeight } from "@/composables/useViewportHeight";

// Initialize dynamic viewport height handling
useViewportHeight();
</script>
