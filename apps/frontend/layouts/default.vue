<script setup lang="ts">
const { user, logout } = useAuth();
</script>

<template>
  <v-app>
    <v-app-bar color="primary" elevation="1">
      <v-app-bar-title>Book Platform</v-app-bar-title>
      <v-spacer />
      <span v-if="user" class="text-body-2 mr-4">{{ user.name }}</span>
      <v-btn variant="text" @click="logout">Logout</v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="py-6">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
