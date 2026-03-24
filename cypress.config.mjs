import { defineConfig } from 'cypress'

export default defineConfig({
  video: true,
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  e2e: {
    baseUrl: 'http://127.0.0.1:4173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: false,
  },
})
