import { expect, type Page } from '@playwright/test';

export type TestUser = {
  name: string;
  email: string;
  password: string;
};

export function createTestUser(prefix = 'e2e'): TestUser {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    name: `${prefix} User`,
    email: `${prefix}-${suffix}@example.com`,
    password: 'password123',
  };
}

export async function registerUser(page: Page, user: TestUser) {
  await page.goto('/register');
  await page.getByLabel('Name').fill(user.name);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByText(user.name)).toBeVisible();
}

export async function loginUser(page: Page, user: Pick<TestUser, 'email' | 'password'>) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/');
}

export async function logoutUser(page: Page) {
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL('/login');
}
