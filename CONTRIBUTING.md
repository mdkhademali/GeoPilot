# Contributing
1. `npm ci`, then `npm run typecheck && npm run lint && npm test` must pass before a pull request.
2. Keep scientific content accurate: cite formulas and sources; do not add unverifiable URLs.
3. Keep processing local. Any new network call needs a user action, a documented reason and a CSP/permission review.
4. Add tests for logic changes (`tests/`). Format with `npm run format`.
5. Do not add telemetry, remote code or API keys.
