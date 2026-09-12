# Checkpoint 01: first AppHost

This checkpoint replaces the manual multi-terminal startup process with an Aspire AppHost. Both variants orchestrate the same application source under [`demo/start/src`](../../start/src).

Choose either:

- [`csharp`](csharp/README.md) for a C# file-based AppHost.
- [`typescript`](typescript/README.md) for a TypeScript AppHost.

The two AppHosts intentionally model the same resources and relationships:

- PostgreSQL with a persistent data volume
- Redis
- Database migration and seed worker
- Admin portal and SignalR hub
- Vue/Vite player frontend

The AppHost language changes how the model is expressed, not which workloads Aspire can orchestrate.
