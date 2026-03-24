<script setup lang="ts">
import AppShell from '../components/layout/AppShell.vue'
</script>

<template>
  <AppShell>
    <section class="panel not-found">
      <p class="eyebrow">404</p>
      <h2>That route is not part of the starter setup.</h2>
      <RouterLink class="button" to="/">Back to home</RouterLink>
    </section>
  </AppShell>
</template>

<style scoped>
.not-found {
  padding: 2rem;
  text-align: center;
}

.not-found h2 {
  margin: 0.4rem 0 1rem;
}
</style>
