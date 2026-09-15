# C# AppHost: observe the system

This file-based C# AppHost enables ServiceDefaults for the admin application and migration worker.

The admin explicitly uses its `http` launch profile to match Vite's HTTP backend reference and the TypeScript variant. Otherwise, inheriting the AppHost's HTTPS profile redirects proxied API and SignalR requests out of the frontend origin. The dashboard can still use HTTPS; production TLS belongs to the Day 2 deployment exercise.

From the repository root:

```bash
cd demo/checkpoints/03-observe/csharp
aspire run
```

Aspire prompts for the `admin-password` parameter on the first run. Use it to sign in to the admin portal as `admin`.

Open the dashboard and use the application or its commands, then inspect **Structured logs**, **Traces**, and **Metrics**. The migration worker's **Migrating database** activity and admin HTTP requests provide useful starting points.

Before finishing Day 1, complete the shared [acceptance and restart checklist](../README.md#day-1-finish-line). The admin's `/health` probe and the frontend's `/` probe should both be healthy.
