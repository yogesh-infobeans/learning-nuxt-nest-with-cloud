<script setup lang="ts">
definePageMeta({
  layout: 'guest',
});

const { register } = useAuth();

const name = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

const submit = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    await register({
      name: name.value,
      email: email.value,
      password: password.value,
    });
    await navigateTo('/');
  } catch (error) {
    errorMessage.value = 'Registration failed. Email may already be in use.';
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-card>
    <v-card-title class="text-h5">Create account</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="submit">
        <v-text-field v-model="name" label="Name" autocomplete="name" required />
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
          autocomplete="new-password"
          hint="Minimum 8 characters"
          persistent-hint
          required
        />
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
          {{ errorMessage }}
        </v-alert>
        <v-btn type="submit" color="primary" block :loading="loading">
          Register
        </v-btn>
      </v-form>
    </v-card-text>
    <v-card-actions class="px-4 pb-4">
      <span class="text-body-2">Already registered?</span>
      <v-spacer />
      <NuxtLink to="/login">Login</NuxtLink>
    </v-card-actions>
  </v-card>
</template>
