/**
 * Application entry point.
 * Creates the Vue 3 app instance, installs Pinia for state management
 * and Vue Router for navigation, then mounts to the DOM.
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app')
