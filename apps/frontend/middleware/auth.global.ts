export default defineNuxtRouteMiddleware(async (to) => {
  const { guestPaths, isAuthenticated, loadProfile, clearSession } = useAuth();

  if (guestPaths.has(to.path)) {
    if (isAuthenticated.value) {
      return navigateTo('/');
    }
    return;
  }

  if (!isAuthenticated.value) {
    return navigateTo('/login');
  }

  try {
    await loadProfile();
  } catch {
    clearSession();
    return navigateTo('/login');
  }
});
