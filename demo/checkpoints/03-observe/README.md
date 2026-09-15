# Checkpoint 03: observe the system

This checkpoint adds the Aspire ServiceDefaults template to the .NET workloads and enables it from the AppHost. Both variants orchestrate the same application source under [`demo/start/src`](../../start/src).

ServiceDefaults configures:

- OpenTelemetry logs, metrics, and traces
- OTLP export to the Aspire dashboard
- Runtime, ASP.NET Core, and HTTP client instrumentation
- Service discovery and standard HTTP resilience defaults
- Development-only `/health` and `/alive` endpoints

The migration worker also registers its existing `Migrations` activity source so its one-shot database migration appears as a custom trace.

The AppHost explicitly connects the admin's `/health` endpoint with `WithHttpHealthCheck("/health")` / `withHttpHealthCheck({ path: '/health' })`. The frontend's wait on the admin now includes this health signal, rather than only waiting for its process to start.

The Vite frontend does not use the .NET ServiceDefaults project, so the AppHost adds an explicit HTTP health check against `/`. This verifies that Vite is responding rather than only checking that its process is running. It does not verify the proxy or the SignalR connection.

Choose either [`csharp`](csharp/README.md) or [`typescript`](typescript/README.md). The AppHost language changes how telemetry is enabled for the workloads, not how the .NET services emit it.

## Day 1 finish line

This is the stopping point for **a working, observable local vertical slice**, not a production-ready application. Use the same AppHost variant tomorrow; there is no need to translate languages or finish modeling every service in an attendee's own application.

Run these checks before leaving:

| Check | Action | Expected evidence |
|---|---|---|
| Configuration and startup | Start from the chosen checkpoint directory and supply `admin-password` when prompted. | PostgreSQL and Redis become healthy; migrations finish successfully; admin and frontend become healthy. A successfully finished migration worker is expected, not a failed service. |
| Useful vertical slice | Open **Play bingo**, request a board, then sign in to **Admin home** as `admin` with the configured password. | A playable board and a connected player in the admin portal. |
| Real-time behavior | Enable live mode and call a square that is present on the player's board. | The connected player receives the change without a page reload. |
| Day 1 customization | Use **Add bingo square** with a unique ID and inspect **Manage squares**; use **Generate demo links**. | The new square is listed and the returned links use this run's endpoints. |
| Structured logs | Select `migrations` in **Structured logs**. | Migration/seed messages have structured fields, not just raw console output. |
| Trace | Find **Migrating database** for `migrations`; visit the frontend's `/api/version-info` and inspect admin traces. | A custom migration activity and an admin HTTP request trace. Health-probe requests are deliberately filtered out of traces. |
| Metric | Generate several admin HTTP requests, then inspect **Metrics** for `boardadmin`. | An ASP.NET Core request metric, such as `http.server.request.duration`, has samples. Allow an export interval and refresh. |
| Health | Inspect `boardadmin` and `bingoboard` health details. | Successful HTTP probes to `/health` and `/`, respectively. |

For an attendee's own application, the minimum is one real user journey, one useful log, one trace, one metric, and an explicitly connected health signal. A screenshot of green processes alone is not the acceptance check.

## What these signals do and do not prove

The shared ServiceDefaults code currently registers only the `self` check. `/health` runs all registered checks, while `/alive` selects checks tagged `live`; with only `self` registered, both report the same result. Neither endpoint proves that the admin can query PostgreSQL or Redis. Hosting integrations check those infrastructure resources separately; startup waits are not ongoing dependency recovery.

The frontend has no browser OpenTelemetry instrumentation in this checkpoint. An admin HTTP trace is not an end-to-end browser-to-database trace, and database command logs do not imply database spans. Treat adding dependency-aware readiness, a business activity, or browser telemetry as a later improvement rather than a hidden Day 1 requirement.

`Aspire:UseServiceDefaults` is a workshop switch because checkpoints share `demo/start/src`. The start state and checkpoints 01/02 leave it off. Attendees adding ServiceDefaults to their own application can call it directly; they do not need to copy this switch.

## Stop tonight; resume tomorrow

1. Keep the chosen checkpoint path and your source changes. Keep local development parameter values in local secret storage, not in notes or source control.
2. Stop a foreground `aspire run` with <kbd>Ctrl</kbd>+<kbd>C</kbd>. If you used `aspire start`, run `aspire stop` from the same AppHost directory.
3. Keep the PostgreSQL volume. Do not delete volumes as a routine end-of-day cleanup. The database persists, but Redis is not configured with a data volume, so live game/cache state is not a durable save.
4. Tomorrow, start the same variant from the same directory with `aspire run`, supplying any requested parameters. Migrations run again; existing seed squares are not duplicated. The migration worker also updates the admin password to match the configured value.
5. Reopen links from the new dashboard and repeat the user-journey check. Do not rely on yesterday's URLs or dashboard telemetry still being available.

Run only one checkpoint at a time: all variants share source/build outputs, and the admin still inherits ports from its launch profile. Changing variant or using isolated execution is not a substitute for a data backup.

## If a check fails

| Symptom | First useful evidence | Recovery |
|---|---|---|
| Resources remain waiting | Parameter resource state and migration console logs. | Supply a missing `admin-password` in the dashboard. A non-interactive start can launch the AppHost while resources wait for a value. |
| Frontend waits for admin | Admin console logs and health-check details. | Confirm ServiceDefaults is enabled and `/health` is mapped in Development; fix the check rather than removing the wait. |
| UI loads but gameplay fails | Browser network errors, admin logs, and Redis health. | Inspect the `/bingohub` proxy and backend connection; Vite's root health check does not cover them. |
| Proxied requests redirect to the admin origin | The frontend's `/api/version-info` or `/bingohub/negotiate` returns an HTTPS redirect. | Keep the C# admin's explicit `http` launch profile aligned with its HTTP endpoint reference; do not disable browser security or add permissive CORS as a workaround. |
| No request traces | Generate a request to `/api/version-info`, not only `/health`. | Confirm ServiceDefaults and OTLP configuration; allow export time. Check the resource and time filter. |
| No migration trace after restarting the dashboard | Migration completion state and console logs. | Capture it on a new AppHost run; the worker is one-shot and old dashboard telemetry is not durable. |
| Port already in use | AppHost/resource console logs. | Stop the previous workshop instance; do not kill unrelated processes. |

The next step is [Day 2: content and exercises](../../../content/day-2.md): use this runtime evidence to investigate a failure, then distinguish the local model from its deployment representation.
