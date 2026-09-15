# C# AppHost: Docker Compose deployment

From the repository root:

```bash
cd demo/checkpoints/04-compose/csharp
aspire publish
ASPIRE_CONTAINER_RUNTIME=podman aspire deploy
```

Supply the development-only admin password when requested. Use the player, admin, and dashboard URLs printed by deployment.

The `announce-images-built` deployment pipeline step runs after the aggregate image build step succeeds and prints a confirmation before deployment completes. Inspect its ordering with `aspire deploy --list-steps`.

YARP is selected by default. To demonstrate nginx, comment out `var frontend = AddYarpFrontend();` and uncomment `var frontend = AddNginxFrontend();`, then redeploy.

For local development, `aspire run` starts Vite (`dev-frontend`); the selected proxy (`bingoboard`) stays stopped until you start it from the dashboard or with `aspire resource bingoboard start`. Deployment starts the proxy normally and does not run Vite.

Follow the shared [checkpoint walkthrough](../README.md) for the local run path, artifact inspection, smoke check, correctly scoped Compose commands, data persistence, and cleanup.
