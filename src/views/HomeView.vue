<script setup lang="ts">
import AppShell from '../components/layout/AppShell.vue'
</script>

<template>
  <AppShell>
    <section class="panel home-view">
      <div>
        <p class="eyebrow">Structure in place</p>
        <h2>Frontend now has routing, a Pinia auth store, and typed API services.</h2>
        <p class="muted">
          Use this as the baseline for feature modules. Add domain-specific services next to
          `authApi` and route views next to the current starter views.
        </p>
      </div>

      <div class="home-view__grid">
        <article>
          <h3>Services</h3>
          <p>Centralized `httpClient`, cookie-based auth helpers, and a health API example.</p>
        </article>
        <article>
          <h3>State</h3>
          <p>A reusable auth store that initializes once and drives protected routes.</p>
        </article>
        <article>
          <h3>Routing</h3>
          <p>Public, guest-only, and authenticated routes are already wired.</p>
        </article>
      </div>
    </section>
  </AppShell>
</template>

<style scoped>
.home-view {
  padding: 2rem;
}

.home-view h2 {
  margin: 0.4rem 0 0.75rem;
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  max-width: 16ch;
}

.home-view__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.home-view__grid article {
  padding: 1.2rem;
  border-radius: 18px;
  background: rgba(31, 77, 87, 0.06);
}

.home-view__grid h3 {
  margin: 0 0 0.4rem;
}

@media (max-width: 768px) {
  .home-view__grid {
    grid-template-columns: 1fr;
  }
}
</style>
