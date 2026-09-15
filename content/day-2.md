# Day 2: content and exercises

This is the first detailed teaching draft for the [Day 2 agenda](agenda.md#day-2-from-a-local-model-to-a-production-path). It builds on [checkpoint 03](../demo/checkpoints/03-observe/README.md), the Day 1 stopping point.

**Through-line:** use runtime evidence to make one improvement, turn the local model into inspectable deployment artifacts, and make the remaining production decisions explicit.

**Material status:** checkpoint 03 is the starting code. The agent exercise below uses a reversible edit to that checkpoint. [Checkpoint 04](../demo/checkpoints/04-compose/README.md) supplies runnable C# and TypeScript Compose deployments with both YARP and nginx frontend containers, a deployment walkthrough, and an executable smoke check. Provider-specific production adaptations and captured presentation fallbacks still need to be prepared. Do not present artifact generation as a completed deployment.

## Before the room arrives

Restart checkpoint 03 using the same AppHost variant and complete its acceptance checklist. Keep both languages conceptually equivalent, but demonstrate one language at a time. All checkpoints share the workload source tree, so do not run simultaneous variants or apply a sample-wide production change without checking the earlier checkpoints.

Have a local-only disposable copy available for planted faults. Capture a healthy resource view, a migration trace, a request trace, and the specific error evidence for the rehearsed fault. Redact tokens, parameter values, connection strings, and identifying data before sharing screenshots or telemetry. Never send an attendee's private code or logs to an agent service without their authorization.

Check container runtime/Compose availability, package/image downloads, and agent authentication before the first block. No cloud account or paid AI subscription is required for the common path. Attendees can use Copilot CLI, Claude Code, Codex CLI, OpenCode, a paired workflow, or manual investigation.

## 09:00-10:15 — Agentic Power Hour

**Outcome:** explain a failure using runtime evidence, make one bounded correction, and demonstrate recovery. The skill being taught is evidence-based diagnosis, not a particular agent or an impressive prompt.

| Time | Content |
|---|---|
| 09:00-09:10 | Resume yesterday's app; resolve missing parameters and choose the attendee's own slice or checkpoint 03. |
| 09:10-09:20 | Architectural context versus live context; instructions/skills versus tools; permissions and evidence quality. |
| 09:20-09:35 | Facilitator fault investigation: reproduce, observe, form a hypothesis, make a minimal correction, verify. |
| 09:35-10:05 | Open lab, including agent setup or the no-agent path. |
| 10:05-10:15 | Compare evidence and fixes; capture one limitation or unsafe suggestion the agent made. |

### Teach and demonstrate

The AppHost answers "what should be connected?" Resource state, health details, logs, and traces answer "what actually happened?" Source access alone cannot establish runtime health. An agent should identify the correct AppHost before starting, stopping, or changing anything; this repository deliberately contains multiple AppHosts.

Show `aspire agent init --help`, then use interactive `aspire agent init` from the chosen workspace to configure the attendee's supported agent. Review what it writes rather than treating generated instructions as magic. Skills, CLI access, and an MCP connection are different surfaces; an MCP server is optional, not a requirement to complete the exercise.

From the chosen AppHost directory, demonstrate this read-first toolbox:

```bash
aspire describe
aspire logs boardadmin
aspire otel logs boardadmin
aspire otel traces boardadmin
```

Use `aspire describe` for this app's resource state; use `aspire ps` to discover running AppHosts. Read console logs when a resource has not started or has not emitted telemetry. Discover URLs rather than assuming localhost ports.

### Core exercise: the app runs, but the frontend is waiting

Start from a healthy checkpoint 03. In a disposable copy, change only the admin's HTTP health-check path from `/health` to `/not-a-health-endpoint` in the chosen AppHost. Leave the application endpoint unchanged. Restart the AppHost so the altered model takes effect.

**Expected symptom:** the admin process starts but its HTTP health check fails, and the frontend waits on the admin. Resource state and a direct request to the configured probe path distinguish a bad health contract from a crashed backend. Ordinary application requests can succeed while the resource is unhealthy.

Use this prompt, substituting the actual AppHost path:

> Work only on this local workshop AppHost: `<path>`. The frontend is waiting after startup. First inspect resource state, health details, and relevant logs; report observations separately from hypotheses. Do not edit until you can explain which dependency is blocking it and why. Propose the smallest correction, then verify health and an application request after I approve it. Do not remove health checks or waits, change credentials, delete data, deploy, commit, or push.

After reviewing the diagnosis, restore the correct probe path. Restart for the model change, wait for the frontend, then request `/api/version-info` through the frontend and find the matching admin HTTP trace. Do not claim the missing health-probe trace is a telemetry bug: ServiceDefaults deliberately filters those paths.

**Turn in:** the symptom, two concrete observations, root cause, minimal diff, and recovery evidence. Keep secrets out of the record.

**Short/no-agent path:** manually perform the same investigation with the dashboard and CLI, or review the facilitator's captured evidence. The output is the same; writing a prompt is not the success criterion.

**Stretch:** investigate an actual issue in the attendee's application, or add one targeted diagnostic signal after identifying a genuine blind spot. Require the agent to explain what that signal proves and what it does not. Do not broaden into an unbounded refactor.

### Failure cards and facilitator fallback

| Planted or common failure | Evidence to look for | Teaching point |
|---|---|---|
| Admin health path is wrong | Admin running but unhealthy; probe receives a non-success response; frontend waiting. | Running is not ready. Correct the contract, not the wait. |
| ServiceDefaults switch is disabled while `/health` is still probed | No mapped health endpoint and no new admin OTLP data. | Instrumentation and health endpoint registration require application participation. |
| Agent selects a different checkpoint or cannot access CLI tools | AppHost path does not match, or tools return access/setup errors. | Fix context/access first; do not let guesses substitute for observations. |

Use only one planted fault at a time. Restore the known-good checkpoint before lunch preparation. If setup consumes more than ten minutes of lab time, switch to pairing or the captured-evidence exercise.

## 10:30-12:00 — Package and ship it

**Outcome:** inspect a generated deployment representation and explain how each part of the local slice will run. A working Compose deployment is the full path; artifact inspection is the honest fallback.

| Time | Content |
|---|---|
| 10:30-10:40 | Run, publish, and deploy are different operations; generating YAML is not shipping an app. |
| 10:40-11:00 | Facilitator adds a Compose target, reviews artifacts and pipeline steps, and demonstrates the packaged user journey. |
| 11:00-11:45 | Open lab: publish, inspect, then deploy locally if the slice and runtime are ready. |
| 11:45-12:00 | Compare the generated model with local development; record gaps and stop only the deployment created for the lab. |

### Teach and demonstrate

Docker Compose is the common **deployment format**, not a requirement to use Docker Desktop and not a universal production recommendation. Use Podman for the facilitator workflow and show the Docker equivalent. Use the selected provider's Compose tooling for deployed container state/logs; a local AppHost dashboard is not automatically a remote operations plane.

Demonstrate integration discovery and the Docker Compose environment in both AppHost languages. Inspect the actual installed version's generated pipeline rather than copying guessed step names. `aspire publish` generates deployment artifacts; `aspire deploy` also performs deployment work. Confirm image-building behavior from the selected pipeline: a published Compose file does not prove its referenced images exist.

### Sample packaging decisions demonstrated by checkpoint 04

| Local resource or behavior | Required deployment treatment |
|---|---|
| Vite development server | `dev-frontend` always starts for local development; the selected YARP/nginx proxy is explicit-start for optional testing. Deployment serves built assets from the proxy only, with no running `vite dev` or `vite preview`. |
| Vite `server.proxy` | YARP AppHost routes or the nginx template preserve `/api/version-info` and `/bingohub`, including WebSocket upgrades. The development proxy is not embedded in static assets. |
| `BINGO_ADMIN_URL` | Vite now requires the URL only when serving, not building. Aspire supplies the nginx proxy address at container startup; YARP uses Aspire references. Neither implementation rewrites already-built JavaScript. |
| .NET admin | Aspire uses .NET SDK container publishing, with no admin Dockerfile. Run in Production and explicitly decide ingress/TLS and forwarded-header behavior; do not depend on development launch-profile ports or certificates. |
| `/health` and `/alive` | Checkpoint 04 explicitly opts into endpoint exposure in Production. Default Compose startup dependencies do not wait for HTTP readiness; verify the endpoints rather than expecting container health probes. Earlier checkpoints retain the Development-only default. |
| Migration worker | Bounded Npgsql retries handle database startup. One-shot execution, a nonzero exit on failure, and Compose's successful-completion dependency keep the application stopped when migration fails. |
| PostgreSQL / Redis | Aspire uses stock images without custom Dockerfiles or a Compose-file callback. Inspect addresses, credentials, volumes, and network visibility. Database persistence and disposable cache state are different promises. |
| Developer HTTP command | `/api/demo/producer/*` is Development-only. Do not expose it just to preserve **Add bingo square** in a deployed app. Test through the authenticated admin UI instead. |
| Telemetry | Choose an OTLP destination and its access controls; local dashboard wiring is not a production retention policy. |

The most useful demo reveal is: **the HTML loads, but there is no playable board because the Vite proxy disappeared.** Show the missing request path in browser/network evidence, then demonstrate checkpoint 04's production routing solution. Swap the commented frontend declaration to compare YARP and nginx without changing the workload code.

### Core exercise: follow the model into the artifacts

1. Start from the repaired, known-good local slice. Add the Compose integration/environment to the attendee's AppHost, or use [checkpoint 04](../demo/checkpoints/04-compose/README.md).
2. Publish. Identify each generated service, image/build context, parameter placeholder, endpoint, network, volume, and startup dependency. Record one development-only behavior that must not leak into deployment.
3. Trace the browser-to-frontend-to-admin route and the admin-to-database/cache routes. Explain why a container's `localhost` is not another service.
4. Prepare local development-only deployment values through the supported parameter workflow. Do not commit filled environment files or print rendered secret values in the shared room.
5. If ready, deploy locally and use the generated endpoints to request a board, sign in to the admin, and receive a live square update. Inspect container logs and migration exit status as well as the HTTP response.
6. Record the outcome as **artifact reviewed**, **images built**, or **deployed and user journey verified**. Note any blocker rather than collapsing these into "done."

**Turn in:** the artifact location, a resource-to-service mapping, one verified route, one persistence decision, and the achieved outcome.

**Short path:** publish and annotate artifacts. If publishing is blocked, inspect the facilitator's captured artifacts and clearly label this as review-only, not a successful publish.

**Stretch:** repeat deployment using the same image versions and retained database, and verify the migration/seed behavior. Explain what survives and what does not; do not delete an existing volume to make the second run pass.

### Failure cards and facilitator fallback

| Failure | Evidence | Recovery focus |
|---|---|---|
| Static page loads, board does not | `/bingohub` negotiation/WebSocket or API request fails. | Production proxy/routing, not another frontend rebuild with guessed URLs. |
| HTTP health check returns 404 | `/health` is not mapped under Production. | Deliberate production health endpoint mapping and exposure. |
| Compose exists but startup fails | Missing image, build-context error, or unresolved parameter. | Distinguish artifact generation, image preparation, configuration, and execution. |

Prepare a sanitized Compose output plus a successful-run recording for slow networks or unavailable runtimes. Cleanup must target this lab's deployment only. Stop containers without deleting data for routine cleanup; teach destructive teardown separately, after inspecting its exact volume scope and obtaining explicit approval.

## 13:00-15:15 — Tweak its production shape

**Outcome:** adapt one part of the model to an intended target and produce a prioritized, evidence-backed local-to-production gap analysis. Cloud provisioning is optional.

| Time | Content |
|---|---|
| 13:00-13:15 | Debrief Compose surprises and select a relevant target for the room. |
| 13:15-13:40 | Facilitator target adaptation: show which application relationships stay the same and which infrastructure choices change. |
| 13:40-13:50 | Attendees choose one bounded adaptation and define its success check. |
| 13:50-14:55 | Open lab with short, demand-driven topic clinics. |
| 14:55-15:15 | Peer review of the adaptation, remaining gaps, cost/cleanup responsibilities, and next steps. |

### Teach and demonstrate

Begin with a before/after resource mapping, not a tour of every cloud integration. Retain Compose as the account-free baseline. Select one provider-specific path based on the room's needs, access, and the facilitator's rehearsed material; do not make the core lab depend on a cloud subscription.

Separate the AppHost's target/environment selection from the deployed application's runtime environment. A target named `staging` does not by itself establish the correct application health, identity, ingress, or secrets behavior.

Use one concrete adaptation to expose the production decisions. Good options are dependency-aware readiness, an existing/managed database reference, production ingress for the frontend and SignalR backend, or a CI artifact handoff. Extend resource behavior only after explaining why a standard integration does not cover the requirement.

### Core exercise: change one production assumption

Complete the worksheet below for the chosen slice. Select one high-value gap, define a visible success condition, and implement the smallest model/configuration change that addresses it. Publish or otherwise inspect the target output; deploy only where access, costs, and cleanup are understood and approved.

| Area | Question to answer | Attendee decision / evidence / next action |
|---|---|---|
| Target and ownership | Where does each resource run, and who operates it? | |
| Images and delivery | What immutable artifact moves through CI/CD? Who builds and deploys it? | |
| Configuration and secrets | Which values differ by environment? Who supplies/rotates them? | |
| Identity | How do workloads and users authenticate? Which development credentials must disappear? | |
| Data and migrations | What persists? How are backup, restore, migrations, and a failed migration handled? | |
| Networking and ingress | What is public/private? Where do TLS, proxy trust, and WebSocket routing live? | |
| Health and recovery | What does readiness check? What happens after a dependency fails, not just at startup? | |
| Observability | Where do logs/traces/metrics go, who can read them, and how long are they retained? | |
| Scale and state | How do SignalR connections, Redis state, and authentication cookies behave across instances/restarts? | |
| Cost and cleanup | Who owns the bill and teardown? Which data must never be removed automatically? | |

**Turn in:** one implemented adaptation with output/runtime evidence, the top three remaining gaps ordered by impact, and the next action for each. Distinguish a verified change from a design decision awaiting implementation.

**Short path:** make one target-specific configuration change and inspect its generated representation without provisioning. If blocked, produce an explicit proposed change and peer-review it; label it unimplemented.

**Stretch clinics:** managed database plus workload identity; external OTLP destination and retention; ingress and WebSocket scaling; migration failure/recovery; CI packaging and promotion. Choose one, not all. Require a stop condition and a cleanup owner before any cloud action.

### Failure cards and facilitator fallback

| Failure | Evidence | Discussion |
|---|---|---|
| Works locally, cannot reach managed dependency | DNS/network/authentication error from the consumer. | Separate connectivity from identity and authorization; avoid broad permission grants. |
| Healthy but unusable after restart or scale-out | Lost cached state, disconnected clients, or invalid sessions. | Persistence, reconnect behavior, and shared authentication key management are application concerns. |
| Generated output does not match intended environment | Unexpected addresses, exposure, or development settings. | Inspect evaluated configuration and target binding; do not assume the environment label applies everywhere. |

Keep an annotated target mapping and a no-cloud example ready. Accounts, permissions, cost approvals, or provisioning delays must not consume the entire afternoon.

## 15:40-17:00 — Show-and-tell, Q+A, and wrap

Keep 15:30-15:40 free for the organizer's evaluation. No new required technical topic belongs in this final block.

| Time | Content |
|---|---|
| 15:40-15:50 | Pair rehearsal: choose one improvement and one piece of evidence. |
| 15:50-16:25 | Volunteer demos: about five minutes each; use pairs/small groups if everyone wants to share. |
| 16:25-16:45 | Prioritized parking-lot questions, not another feature lecture. |
| 16:45-16:50 | Formal close: write the next three actions and point to resources. |
| 16:50-17:00 | Optional individual help, cleanup checks, and informal sharing. |

**Demo prompt:** What was painful yesterday? What does your AppHost model now? Show one real improvement and its evidence. What is still not production-ready?

**No working deployment required:** a diagnosed failure, a useful dashboard command, an inspected artifact, or a justified production decision is a valid demo. Failed attempts with clear evidence are useful teaching material.

**Exit exercise:** record three next actions: one to do next week, one production risk to resolve before shipping, and one optional capability to explore. Give each action an owner and an observable completion condition. Confirm that any workshop deployment has a cleanup owner.

**Fallbacks:** use pair demos if time is short, evidence screenshots if the runtime fails, and anonymous written questions if people prefer not to present. Never require a live demo of confidential code, credentials, or customer data.

## Remaining content build order

1. Rehearse the checkpoint 03 restart and health-path fault in both AppHost languages; capture sanitized healthy/broken/recovered evidence.
2. Use checkpoint 04's YARP/nginx alternatives to rehearse the packaging demonstration in both AppHost languages.
3. Re-run the supplied smoke check on the event machines, rehearse the Docker equivalent, and capture sanitized artifact-only fallbacks. The checkpoint documents non-destructive stop and explicitly scoped teardown.
4. Build one modular production-target adaptation, with a no-cloud path and a documented cost/cleanup boundary.
5. Turn the rehearsed commands and observed failures into attendee walkthroughs. Only then mark the deployment exercises ready to deliver.

## Reference starting points

- [Aspire CLI reference](https://aspire.dev/reference/cli/)
- [Docker Compose deployment](https://aspire.dev/deployment/docker-compose/)
- [Docker hosting integration](https://aspire.dev/integrations/compute/docker/)
- [Deployment environments](https://aspire.dev/deployment/environments/)

Use the installed CLI's `--help`, `aspire docs search`, and `aspire docs api search` to verify version-sensitive commands and C#/TypeScript API shapes while building the runnable material.
