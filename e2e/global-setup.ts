const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const apiURL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:4000';

async function waitForService(url: string, label: string, attempts = 30) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 401 || response.status === 404) {
        return;
      }
    } catch {
      // retry until timeout
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(`${label} is not reachable at ${url}. Start the stack with: docker compose up -d --build`);
}

export default async function globalSetup() {
  await waitForService(`${apiURL}/books`, 'Backend API');
  await waitForService(baseURL, 'Frontend app');
}
