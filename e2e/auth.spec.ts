import { expect, test } from '@playwright/test';
import { createTestUser, loginUser, logoutUser, registerUser } from './helpers/auth';

test.describe('Authentication', () => {
  test('redirects guests from home to login', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/login');
    await expect(page.getByText('Sign in', { exact: true })).toBeVisible();
  });

  test('registers a new user and opens the home page', async ({ page }) => {
    const user = createTestUser('register');

    await registerUser(page, user);

    await expect(page.getByRole('heading', { name: 'Nuxt + Nest Book Platform', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });

  test('logs in an existing user', async ({ page }) => {
    const user = createTestUser('login');

    await registerUser(page, user);
    await logoutUser(page);
    await loginUser(page, user);

    await expect(page.getByText(user.name)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nuxt + Nest Book Platform', level: 1 })).toBeVisible();
  });

  test('shows an error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('missing-user@example.com');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid email or password.')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('navigates between login and register pages', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL('/register');
    await expect(page.getByText('Create account', { exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByText('Sign in', { exact: true })).toBeVisible();
  });

});
