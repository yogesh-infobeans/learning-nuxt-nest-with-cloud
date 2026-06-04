import { getAuthRedirect } from '~/utils/auth-session';

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, loadProfile, clearSession } = useAuth();

  const redirect = getAuthRedirect(to.path, isAuthenticated.value);
  if (redirect) {
    return navigateTo(redirect);
  }

  try {
    await loadProfile();
  } catch {
    clearSession();
    return navigateTo('/login');
  }
});
