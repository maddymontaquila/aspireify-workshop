# Checkpoint 04: deploy with Docker Compose

This checkpoint packages the bingo application as a working Compose deployment, with equivalent [C#](csharp/README.md) and [TypeScript](typescript/README.md) AppHosts.

Choose **YARP** or **nginx** for the frontend container. Both serve the built Vue application and reverse-proxy `/api/version-info` and `/bingohub`, including WebSockets. The admin portal remains a separate endpoint. No browser CORS exception, development server, or hardcoded backend address is required in the deployed frontend.

This is a **local, HTTP-only deployment exercise**, not a hardened internet-facing production template. Aspire generates dynamically allocated host ports using Compose's default bindings, which are not restricted to loopback. Use a trusted local environment; PostgreSQL and Redis remain internal to the Compose network.

## What changed since checkpoint 03?

| Concern | Checkpoint 04 |
|---|---|
| Deployment model | `AddDockerComposeEnvironment` / `addDockerComposeEnvironment` generates Compose services, parameters, networking, volumes, and a dashboard. |
| Frontend | A reverse-proxy container serves built files instead of `vite dev`. There are two interchangeable implementations. |
| Backend configuration | Containers run in Production. The admin explicitly opts into `/health` and `/alive`; developer producer/OpenAPI endpoints stay disabled. |
| Readiness | Aspire translates ordinary waits to Compose `service_started` dependencies. These are startup ordering, not readiness guarantees; check HTTP endpoints before exercising the app. |
| Migrations | The worker uses Npgsql's bounded transient retries while PostgreSQL becomes ready. It is one-shot, has no restart policy by default, and must exit successfully before the admin starts. Unhandled failures produce a nonzero exit code. |
| Data | PostgreSQL uses a named volume. Redeploying or switching proxy implementation retains database contents. Redis remains disposable. |
| Packaging | Aspire uses stock PostgreSQL/Redis images and .NET SDK container publishing for both admin and migrations. Only the optional nginx frontend needs a handwritten Dockerfile. |
| Developer experience | Named dashboard URLs remain. The interactive developer-only commands are left in checkpoint 03; production work uses the authenticated admin UI. |

The workload source still lives under `demo/start/src`. Health endpoint exposure outside Development is opt-in and enabled only by checkpoint 04. Vite still requires `BINGO_ADMIN_URL` when serving in development, but no longer requires a backend address to build static assets.

The Compose environment is a single declaration. Resource references, waits, endpoints, and volumes drive the generated file; this checkpoint does not rewrite it through a Compose-file callback.

## Choose the proxy

In either AppHost, leave exactly one of these lines active:

```csharp
var frontend = AddYarpFrontend();
// var frontend = AddNginxFrontend();
```

```typescript
const frontend = await addYarpFrontend();
// const frontend = await addNginxFrontend();
```

To demonstrate nginx, comment out the YARP line and uncomment the nginx line. Redeploy from the same AppHost directory. The resource is named `bingoboard` in both cases, so Aspire replaces the frontend rather than creating a second public application.

| | YARP | nginx |
|---|---|---|
| Teaching focus | Aspire-managed reverse-proxy configuration and static-file packaging. | An explicit multi-stage Dockerfile and runtime proxy configuration. |
| Source of routing | `WithConfiguration` / `withConfiguration` in the AppHost. | [`default.conf.template`](../../start/src/bingo-board/nginx/default.conf.template). |
| Static build | A build-only Vite resource is consumed by `PublishWithStaticFiles` / `publishWithStaticFiles`. | [`Dockerfile.nginx`](../../start/src/bingo-board/Dockerfile.nginx) runs `npm ci` and `npm run build`, then copies `dist` into an unprivileged nginx image. |
| Backend address | Aspire references become service-discovery configuration. | Aspire injects `BINGO_ADMIN_URL`; nginx's entrypoint substitutes it into the template at container startup. |
| Local `aspire run` | Vite starts automatically. YARP is explicit-start; when started, it proxies static/dev requests to Vite and API/hub requests to the admin. | Vite starts automatically. nginx is explicit-start and serves a built snapshot alongside Vite when started. Rebuild nginx after frontend changes; Vite retains HMR. |
| Deployed frontend | YARP serves `/app/wwwroot`; the Vite build resource is not a running Compose service. | nginx serves `/usr/share/nginx/html`; Node is absent from the final image. |

Do not edit generated Compose output to switch implementations. The AppHost and Dockerfiles are the source of truth.

For local YARP-to-Vite traffic, the AppHost adds only `aspire.dev.internal` to Vite's allowed hosts. Do not disable Vite's host checking to make container-to-host proxying work.

## Prerequisites

Use the repository's [.NET, Node, Aspire, and container prerequisites](../../../README.md#prerequisites). For this checkpoint, verify the Compose provider as well:

```bash
aspire --version
podman info
podman compose version
```

The examples use Podman. Docker users can use Docker's Compose commands and omit `ASPIRE_CONTAINER_RUNTIME=podman`. Aspire and the .NET SDK handle container packaging. The only build customization selects the local machine's architecture: Linux ARM64 or AMD64. There are no image-format overrides, custom infrastructure/admin Dockerfiles, or Compose-file callbacks.

This Aspire version otherwise defaults to AMD64 builds. On an ARM workshop machine, emulated .NET/nginx containers can fail at runtime, so keep the native-platform selection. A remote host with a different architecture needs its own explicit target choice. This API is experimental in the pinned version; the C# AppHost suppresses its `ASPIREPIPELINES003` diagnostic.

Allow time for the first build to download .NET 10 SDK/runtime images, Node 24, PostgreSQL 18.3, Redis 8.6, the Aspire dashboard, and YARP or nginx. Later runs reuse image layers.

## Run locally before packaging

Choose a variant and follow its setup instructions. Run all commands below from that variant's directory:

```bash
aspire run
```

Supply a **development-only** `admin-password`. Open the player and admin URLs from the dashboard. Sign in as `admin`, generate a board, and check that the admin can update the player.

Use **Play bingo (Vite)** on the `dev-frontend` resource for normal development, regardless of which proxy is selected. The selected proxy, `bingoboard`, is intentionally **Not started**, not broken. No development resource waits for it.

To test through the proxy, choose its **Start** command in the dashboard, or run the following from another terminal in the same AppHost directory:

```bash
aspire resource bingoboard start
aspire wait bingoboard
```

Open **Play bingo** on `bingoboard` to compare it with the direct Vite endpoint. Stop the optional proxy with `aspire resource bingoboard stop`; Vite keeps running.

Explicit start applies only to local run mode. In publish/deploy mode, the proxy starts normally. YARP consumes `dev-frontend` as a build-only resource; nginx excludes that resource from publishing and builds the static assets in its own Dockerfile. Neither deployment runs Vite.

Stop the foreground AppHost with Ctrl+C before moving on. If you used `aspire start`, stop it with `aspire stop`. Earlier checkpoints still share build outputs and the admin launch-profile port, so run only one local AppHost at a time.

## Publish: inspect without deploying

```bash
aspire publish --list-steps
aspire publish
```

Inspect `aspire-output/docker-compose.yaml` and the **unfilled** `.env` placeholders. Publishing does not build the application images or start the deployment.

Find the following in the output:

- `compose-dashboard`, `postgres`, `cache`, `migrations`, `boardadmin`, and `bingoboard`.
- No running `dev-frontend` or Vite development service.
- `migrations` waits for PostgreSQL to start; `boardadmin` waits for Redis to start and migrations to complete successfully; `bingoboard` waits for admin to start.
- Dynamically assigned host ports for frontend, admin, and dashboard, using the runtime's default host binding rather than a loopback-only override.
- A named PostgreSQL volume and internal database/cache addresses, not `localhost` connection strings between containers.
- Image and secret placeholders rather than committed deployment values.

Local AppHost health checks do not automatically become container `HEALTHCHECK` probes in this Compose output. Use the application's HTTP endpoints and user journey to check readiness.

## Deploy: build and run the containers

```bash
aspire deploy --list-steps
ASPIRE_CONTAINER_RUNTIME=podman aspire deploy
```

For PowerShell, set `$env:ASPIRE_CONTAINER_RUNTIME = "podman"` first, then run `aspire deploy`.

Aspire builds the application images, uses stock PostgreSQL/Redis images, resolves deployment parameters, writes `.env.Production`, and starts the Compose project. Supply the admin password when requested. Do not assume the development AppHost's parameter store and the deployment environment have the same values.

Use the **new URLs printed by deployment** for `bingoboard`, `boardadmin`, and `compose-dashboard`. Host ports can change after recreation. The admin's container listens on port 8080 internally; that is not necessarily its host port. A started container may still be initializing: wait for the admin's `/health` and the player's `/api/version-info` to return HTTP 200 before running the smoke check.

For unattended execution, supply required parameters through an approved local environment/secret mechanism and use `--non-interactive`. Do not put passwords in command-line arguments, source files, screenshots, or chat transcripts.

`.env.Production` contains resolved secrets in plaintext. Keep the generated `aspire-output` directory private and untracked. Do not share raw `compose config` output, container environment dumps, or the dashboard login token.

## Prove the deployment works

1. Open the player URL. Request a board with 25 squares.
2. Sign in to the admin URL with the deployed password. Confirm that the player appears.
3. Call/update a square and confirm the player receives the live update without reloading.
4. Request `<player-url>/api/version-info`; it should return JSON without redirecting to the admin origin.
5. Check the admin's `/health` and `/alive`. Both should return `Healthy` in Production.
6. Confirm the admin's `/api/demo/producer/status` and `/openapi/v1.json` return 404. Do not enable Development to restore these routes.
7. Open the deployed dashboard and generate traffic before inspecting telemetry. The local AppHost dashboard from `aspire run` is a different process.

### Repeatable smoke check

The [smoke script](smoke.mjs) checks built asset delivery, API routing, probes, development endpoint exclusion, cookie/antiforgery login, a full bingo board, and live updates through an actual WebSocket connection. It creates a disposable player in Redis and toggles/restores one square on that player's board; use it only on a workshop deployment.

The script uses the frontend's existing SignalR dependency. From the repository root, install it if needed:

```bash
npm ci --prefix demo/start/src/bingo-board
```

From the chosen checkpoint AppHost directory, substitute the URLs printed by `aspire deploy`:

```bash
node --env-file=aspire-output/.env.Production ../smoke.mjs http://localhost:PLAYER_PORT http://localhost:ADMIN_PORT
```

Node reads `ADMIN_PASSWORD` from the generated file without printing it. Alternatively set `BINGO_ADMIN_PASSWORD` using your shell's hidden-input/secret mechanism and omit `--env-file`. A successful run prints one `PASS` line; failures exit nonzero.

## Inspect, stop, and resume the correct Compose project

Aspire assigns a project name based on this AppHost. **Do not let Compose guess a project name from the `aspire-output` directory.**

```bash
podman compose ls
```

Find the row whose **ConfigFiles** points to this variant's `aspire-output/docker-compose.yaml`. Set `COMPOSE_PROJECT_NAME` to that row's **Name** (replace the example value below):

```bash
export COMPOSE_PROJECT_NAME="name-from-the-matching-compose-ls-row"
podman compose -f aspire-output/docker-compose.yaml --env-file aspire-output/.env.Production ps -a
podman compose -f aspire-output/docker-compose.yaml --env-file aspire-output/.env.Production logs --tail 50 migrations boardadmin bingoboard
```

`migrations` should be **Exited (0)**; PostgreSQL, Redis, admin, and frontend should be running. Do not require a Compose `healthy` status: these images have no workshop-added container probes. Use the HTTP/user-journey checks to establish application readiness.

To stop this deployment **without deleting its data**:

```bash
podman compose -f aspire-output/docker-compose.yaml --env-file aspire-output/.env.Production stop
```

Run `aspire deploy` again to rebuild/reconcile and resume. Migrations run against the retained database and do not duplicate seed squares. A changed configured admin password is applied by the migration worker.

`aspire stop` stops a local AppHost, **not** a Compose deployment. `aspire destroy` is destructive teardown: inspect the intended AppHost/environment and volume scope first and only confirm it when you want the deployment's data removed. Volume deletion is not a routine repair for authentication or migration errors.

C# and TypeScript variants are separate deployment projects with separate volumes. Switching proxy within one variant retains its database; switching AppHost language does not migrate data between those projects.

## Startup and recovery exercise

Aspire preserves the critical successful-migration gate through `WaitForCompletion` / `waitForCompletion`. Other waits become Compose `service_started`: PostgreSQL/Redis/admin may still be initializing when their dependents start. The migration worker's existing execution-strategy blocks now use Npgsql's built-in transient retries to handle database startup; retries are bounded and do not turn permanent failures into success. The proxy can briefly return an upstream error while the admin starts.

The migration worker explicitly sets a failure exit code because logging a `BackgroundService` exception alone does not reliably communicate failure to Compose.

For a facilitator-controlled failure drill, use a disposable deployment and a temporary Compose override that supplies an empty `Authentication__AdminPassword` to `migrations`. Stop the app services before recreating the migration with that override. The worker must exit nonzero, and admin/frontend must remain stopped. Remove the override and redeploy normally to recover; retain the PostgreSQL volume.

For a persistence drill, note an existing square's contents/creation time, stop and redeploy or swap the frontend implementation, then confirm the same record remains and seed rows are not duplicated. Live player/cache state is not covered by this promise.

## Troubleshooting

| Symptom | Check |
|---|---|
| Old Compose output still requires healthy PostgreSQL/Redis | Republish/redeploy from the current AppHost. The default model uses stock images and `service_started`, not custom infrastructure probes. |
| Proxy briefly returns 502 during startup | Wait for the admin's `/health` and then retry the player's `/api/version-info`. Container start is not HTTP readiness. |
| Migration fails with database authentication errors | Inspect the retained volume's credential history and the resolved deployment parameter source. Do not delete the volume or rotate its password blindly. |
| Migration exits 1 and frontend never starts | Read migration logs first. Fix the underlying configuration/schema problem and redeploy; do not remove the completion dependency. |
| Page loads but board creation fails | Inspect `/bingohub/negotiate` and the WebSocket upgrade. Verify the selected proxy's runtime backend address. |
| Admin health is 404 | Confirm Production has `HealthChecks__ExposeEndpoints=true` and ServiceDefaults is enabled. |
| Admin login fails after a redeploy | Use the current deployment password. Login cookies may also be invalidated by container replacement. |
| Compose commands show no containers | Match the ConfigFiles row in `podman compose ls` and set the correct `COMPOSE_PROJECT_NAME`. |
| AppHost warns that a frontend helper is unused | Expected for the deliberately commented-out alternative. Keep only one call active. |
| A .NET image fails to build | Inspect Aspire's build step and the .NET SDK container-publishing output; the admin and migrations do not use Dockerfile SDK stages. |
| ARM deployment hits .NET runtime or nginx emulation errors | Inspect the image architecture. Keep the native-platform selection rather than running the default AMD64 images under emulation. |

## Production decisions intentionally left for the afternoon

This deployment is fully functional locally, but it does not configure public ingress/TLS or restrict published ports to loopback. Do not treat the default host bindings as an access-control boundary. Review trusted proxies and forwarded-header settings explicitly before adding TLS ingress.

The default `self` health check proves HTTP responsiveness, not ongoing database/cache availability. Startup dependencies do not provide runtime dependency recovery. PostgreSQL has persistence but no workshop-managed backup/restore policy; Redis state and container-local authentication keys are not durable. Expect to sign in again after container replacement.

Before public deployment, review application authorization, identity, secrets, authentication key storage, backups, ingress, connection recovery/scale-out, telemetry access/retention, and costs. Those are the [Day 2 production-shape exercise](../../../content/day-2.md#1300-1515--tweak-its-production-shape), not claims made by this checkpoint.
