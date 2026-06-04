## Summary

<!-- What changed and why -->

## Full-stack checklist

- [ ] **Backend** — API/service/DTO/entity updated (`apps/backend/src/`)
- [ ] **Frontend** — pages/composables/UI updated (`apps/frontend/`)
- [ ] **Backend unit tests** — added/updated/removed (`*.spec.ts` under backend)
- [ ] **Frontend unit tests** — added/updated/removed (`*.spec.ts` under frontend)
- [ ] **Playwright e2e** — added/updated/removed (`e2e/`) if routes or user flows changed
- [ ] **Config/env** — `.env.example`, `docker-compose.yml` if new settings
- [ ] **Removed dead code** — deleted features have tests removed too

## Test plan

- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] `docker compose up -d --build` && `npm run test:e2e` (if UI/API flows touched)
