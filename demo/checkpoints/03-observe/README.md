# Checkpoint 03: observe the system

This checkpoint adds the Aspire ServiceDefaults template to the .NET workloads and enables it from the AppHost. Both variants orchestrate the same application source under [`demo/start/src`](../../start/src).

ServiceDefaults configures:

- OpenTelemetry logs, metrics, and traces
- OTLP export to the Aspire dashboard
- Runtime, ASP.NET Core, and HTTP client instrumentation
- Service discovery and standard HTTP resilience defaults
- Development-only `/health` and `/alive` endpoints

The migration worker also registers its existing `Migrations` activity source so its one-shot database migration appears as a custom trace.

The Vite frontend does not use the .NET ServiceDefaults project, so the AppHost adds an explicit HTTP health check against `/`. This verifies that Vite is responding rather than only checking that its process is running.

Choose either [`csharp`](csharp/README.md) or [`typescript`](typescript/README.md). The AppHost language changes how telemetry is enabled for the workloads, not how the .NET services emit it.
