<script setup lang="ts">
definePageMeta({
  layout: 'guest',
});

const { login } = useAuth();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

const submit = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    await login({
      email: email.value,
      password: password.value,
    });
    await navigateTo('/');
  } catch (error) {
    errorMessage.value = 'Invalid email or password.';
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-card>
    <v-card-title class="text-h5">Sign in</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="submit">
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          autocomplete="email"
          required
        />
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          autocomplete="current-password"
          required
        />
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
          {{ errorMessage }}
        </v-alert>
        <v-btn type="submit" color="primary" block :loading="loading">
          Login
        </v-btn>
      </v-form>
    </v-card-text>
    <v-card-actions class="px-4 pb-4">
      <span class="text-body-2">Need an account?</span>
      <v-spacer />
      <NuxtLink to="/register">Register</NuxtLink>
    </v-card-actions>
  </v-card>
</template>
