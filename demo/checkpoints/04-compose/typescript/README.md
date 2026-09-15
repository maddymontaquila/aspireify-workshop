# TypeScript AppHost: Docker Compose deployment

From the repository root:

```bash
cd demo/checkpoints/04-compose/typescript
npm ci
aspire restore
npm run build
npm run lint
aspire publish
ASPIRE_CONTAINER_RUNTIME=podman aspire deploy
```

Supply the development-only admin password when requested. Use the player, admin, and dashboard URLs printed by deployment.

YARP is selected by default. To demonstrate nginx, comment out `const frontend = await addYarpFrontend();` and uncomment `const frontend = await addNginxFrontend();`, then redeploy.

For local development, `aspire run` starts Vite (`dev-frontend`); the selected proxy (`bingoboard`) stays stopped until you start it from the dashboard or with `aspire resource bingoboard start`. Deployment starts the proxy normally and does not run Vite.

The generated `.aspire/modules` directory is not source: change `apphost.mts`, not the SDK. Follow the shared [checkpoint walkthrough](../README.md) for the local run path, artifact inspection, smoke check, correctly scoped Compose commands, data persistence, and cleanup.
