# TypeScript AppHost: observe the system

This TypeScript AppHost enables ServiceDefaults for the admin application and migration worker.

From the repository root, install its locked local tooling and generate the Aspire SDK:

```bash
cd demo/checkpoints/03-observe/typescript
npm ci
aspire restore
```

Then run the application:

```bash
aspire run
```

Aspire prompts for the `admin-password` parameter on the first run. Use it to sign in to the admin portal as `admin`.

Open the dashboard and use the application or its commands, then inspect **Structured logs**, **Traces**, and **Metrics**. The migration worker's **Migrating database** activity and admin HTTP requests provide useful starting points.

Before finishing Day 1, complete the shared [acceptance and restart checklist](../README.md#day-1-finish-line). The admin's `/health` probe and the frontend's `/` probe should both be healthy.
