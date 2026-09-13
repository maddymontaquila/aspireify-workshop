# C# AppHost: observe the system

This file-based C# AppHost enables ServiceDefaults for the admin application and migration worker.

```bash
aspire run
```

Aspire prompts for the `admin-password` parameter on the first run. Use it to sign in to the admin portal as `admin`.

Open the dashboard and use the application or its commands, then inspect **Structured logs**, **Traces**, and **Metrics**. The migration worker's **Migrating database** activity and admin HTTP requests provide useful starting points.
