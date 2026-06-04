import { test as base, type Page } from '@playwright/test';
import { createTestUser, registerUser, type TestUser } from '../helpers/auth';

type AuthFixtures = {
  testUser: TestUser;
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use) => {
    await use(createTestUser());
  },
  authenticatedPage: async ({ page, testUser }, use) => {
    await registerUser(page, testUser);
    await use(page);
  },
});

export { expect } from '@playwright/test';
