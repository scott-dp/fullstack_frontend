<script setup lang="ts">
/**
 * Public landing page shown to unauthenticated visitors.
 * Showcases the IK System features and encourages login or registration.
 */
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="landing">
    <header class="landing-header">
      <div class="landing-container">
        <span class="landing-logo">IK System</span>
        <nav class="landing-nav">
          <template v-if="auth.isAuthenticated">
            <router-link to="/app" class="btn btn-primary">Go to Dashboard</router-link>
          </template>
          <template v-else>
            <router-link to="/login" class="btn btn-secondary">Sign In</router-link>
            <router-link to="/register" class="btn btn-primary">Get Started</router-link>
          </template>
        </nav>
      </div>
    </header>

    <section class="hero">
      <div class="landing-container">
        <span class="hero-badge">IK-Mat &amp; IK-Alkohol</span>
        <h1>Digital Internal Control<br />for Food &amp; Alcohol Compliance</h1>
        <p class="hero-sub">
          Replace paper checklists and manual routines with a structured digital solution.
          Monitor daily operations, ensure proper documentation, and pass inspections with confidence.
        </p>
        <div class="hero-actions">
          <router-link v-if="!auth.isAuthenticated" to="/register" class="btn btn-primary btn-lg">
            Start Free Trial
          </router-link>
          <router-link v-else to="/app" class="btn btn-primary btn-lg">
            Open Dashboard
          </router-link>
          <a href="#features" class="btn btn-secondary btn-lg">See Features</a>
        </div>
      </div>
    </section>

    <section id="features" class="features">
      <div class="landing-container">
        <h2 class="section-title">Everything you need for compliance</h2>
        <p class="section-sub">Two integrated services covering food and alcohol regulations</p>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            <h3>Digital Checklists</h3>
            <p>Daily, weekly, and monthly task lists for hygiene, cleaning, and safety procedures. Never miss a routine.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3>Temperature Logging</h3>
            <p>Record storage temperatures with automatic alerts when readings go outside safe thresholds.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            </div>
            <h3>Deviation Management</h3>
            <p>Report, track, and resolve non-compliance incidents with full audit trails and comment threads.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
            </div>
            <h3>Role-Based Access</h3>
            <p>Staff, managers, and administrators each see exactly what they need. Full control over permissions.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <h3>Smart Notifications</h3>
            <p>Alerts for overdue tasks, temperature deviations, and assigned issues so nothing slips through.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>
            </div>
            <h3>Compliance Dashboard</h3>
            <p>Real-time overview of your compliance status with analytics on checklists, temperatures, and deviations.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="services-section">
      <div class="landing-container">
        <div class="services-grid">
          <div class="service-card food">
            <h3>IK-Mat</h3>
            <p class="service-label">Food Compliance</p>
            <ul>
              <li>Hygiene and cleaning checklists</li>
              <li>Temperature monitoring</li>
              <li>Food safety documentation</li>
              <li>HACCP support</li>
            </ul>
          </div>
          <div class="service-card alcohol">
            <h3>IK-Alkohol</h3>
            <p class="service-label">Alcohol Compliance</p>
            <ul>
              <li>Responsible service routines</li>
              <li>Age verification documentation</li>
              <li>Staff training records</li>
              <li>Serving practice audits</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="landing-container">
        <h2>Ready to simplify compliance?</h2>
        <p>Join restaurants, bars, and cafes already using IK System to stay audit-ready.</p>
        <router-link v-if="!auth.isAuthenticated" to="/register" class="btn btn-primary btn-lg">
          Create your account
        </router-link>
        <router-link v-else to="/app" class="btn btn-primary btn-lg">
          Go to Dashboard
        </router-link>
      </div>
    </section>

    <footer class="landing-footer">
      <div class="landing-container">
        <p>IK System &mdash; Digital Internal Control for Food &amp; Alcohol Compliance</p>
        <p class="text-sm">Sponsored by Everest Sushi &amp; Fusion AS (org. 937 219 997)</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  min-height: 100vh;
  background: var(--bg);
}

/* Header */
.landing-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}
.landing-header .landing-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}
.landing-logo {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-h);
  letter-spacing: -0.5px;
}
.landing-nav {
  display: flex;
  gap: 8px;
}

/* Container */
.landing-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero */
.hero {
  padding: 80px 0 64px;
  text-align: center;
}
.hero-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-bg);
  margin-bottom: 20px;
}
.hero h1 {
  font-size: 48px;
  line-height: 1.1;
  letter-spacing: -1.5px;
  margin: 0 auto 16px;
  max-width: 700px;
}
.hero-sub {
  font-size: 17px;
  color: var(--text);
  max-width: 560px;
  margin: 0 auto 32px;
  line-height: 1.6;
}
.hero-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.btn-lg {
  padding: 12px 24px;
  font-size: 16px;
}

/* Features */
.features {
  padding: 64px 0;
  background: var(--bg-secondary);
}
.section-title {
  text-align: center;
  font-size: 32px;
  margin-bottom: 4px;
}
.section-sub {
  text-align: center;
  color: var(--text);
  margin-bottom: 40px;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.feature-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
}
.feature-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--accent-bg);
  color: var(--accent);
  margin-bottom: 14px;
}
.feature-card h3 {
  margin-bottom: 6px;
}
.feature-card p {
  font-size: 14px;
  color: var(--text);
  line-height: 1.5;
}

/* Services */
.services-section {
  padding: 64px 0;
}
.services-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.service-card {
  border-radius: var(--radius);
  padding: 32px;
  border: 1px solid var(--border);
}
.service-card.food {
  border-left: 4px solid var(--success);
}
.service-card.alcohol {
  border-left: 4px solid var(--warning);
}
.service-card h3 {
  font-size: 24px;
  margin-bottom: 2px;
}
.service-label {
  color: var(--text);
  font-size: 14px;
  margin-bottom: 16px;
}
.service-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.service-card li {
  font-size: 15px;
  color: var(--text-h);
  padding-left: 20px;
  position: relative;
}
.service-card li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.service-card.food li::before {
  background: var(--success);
}
.service-card.alcohol li::before {
  background: var(--warning);
}

/* CTA */
.cta-section {
  padding: 64px 0;
  text-align: center;
  background: var(--bg-secondary);
}
.cta-section h2 {
  font-size: 32px;
  margin-bottom: 8px;
}
.cta-section p {
  color: var(--text);
  margin-bottom: 24px;
}

/* Footer */
.landing-footer {
  padding: 32px 0;
  text-align: center;
  border-top: 1px solid var(--border);
  color: var(--text);
  font-size: 14px;
}
.landing-footer p + p {
  margin-top: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .hero { padding: 48px 0 40px; }
  .hero h1 { font-size: 32px; }
  .features-grid { grid-template-columns: 1fr; }
  .services-grid { grid-template-columns: 1fr; }
  .hero-actions { flex-direction: column; align-items: center; }
}
</style>
