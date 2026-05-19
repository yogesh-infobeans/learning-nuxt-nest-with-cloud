export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['vuetify-nuxt-module', '@nuxt/eslint'],
  css: ['@mdi/font/css/materialdesignicons.min.css'],
  vuetify: {
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light',
      },
    },
  },
  runtimeConfig: {
    apiBaseUrl:
      process.env.NUXT_API_BASE_URL ??
      process.env.NUXT_PUBLIC_API_BASE_URL ??
      'http://localhost:4000',
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000',
    },
  },
});
