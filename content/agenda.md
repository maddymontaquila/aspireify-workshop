# Aspireify Your Stack: 2-Day Workshop Agenda

## At a glance

The workshop follows one progression:

> **See it → run it → improve it → understand it → unleash the agent → ship it → productionize it → share what you built**

| Day | Workshop block | Theme |
|---|---|---|
| Day 1 | 09:00–10:15 | **See your system:** understand Aspire and map the stack |
| Day 1 | 10:30–12:00 | **Get it running:** create the first Aspire model |
| Day 1 | 13:00–15:15 | **Make it useful and repeatable:** add dependencies, configuration, reliability, and custom resource commands |
| Day 1 | 15:30–17:00 | **Understand and harden it:** observe, debug, recover, and finish the slice |
| Day 2 | 09:00–10:15 | **Agentic Power Hour:** give an AI coding agent the context to operate the stack |
| Day 2 | 10:30–12:00 | **Package and ship it:** publish and deploy with Docker Compose |
| Day 2 | 13:00–15:15 | **Make it production-shaped:** target environments and purposeful customization |
| Day 2 | 15:40–17:00 | **Show, ask, and wrap:** attendee demos, parking-lot Q&A, and optional final help |

Each block is a mini-workshop:

> **Short slides → live demonstration → open lab → shared troubleshooting or checkpoint**

The content is intended to become reusable at other events. For now, the agenda is deliberately planned against NDC Oslo's fixed model of four workshop blocks per day so the detailed content does not drift away from the actual time available. Breakfast, lunch, breaks, and the Day 2 evaluation are not workshop content.

## Workshop promise

Attendees bring an existing application and use Aspire to improve how it is developed, observed, tested, and deployed.

By the end of Day 1, each attendee should have:

- an AppHost that models at least one useful vertical slice of their application;
- the application running through Aspire with its dependencies and configuration wired in;
- a working dashboard view that helps them diagnose the application.

By the end of Day 2, each attendee should have:

- a concrete deployment path and an understanding of the gaps between their local and production models;
- at least one deeper Aspire capability applied to their application;
- a prioritized plan for continuing their Aspirification after the workshop.

The workshop stays polyglot, cloud-neutral, and centered on attendee applications. A prepared sample application provides a fallback for anyone who cannot use their own codebase.

## Facilitation principles

- **Teach one repeatable process:** inventory the system, model a vertical slice, run it, observe it, improve the model, and prepare it for deployment.
- **Prefer progress over completeness:** attendees do not need to model their entire stack to succeed.
- **Explain the model before the API:** use the resource graph to connect AppHost code, service discovery, dependencies, health, and deployment.
- **Keep lecture segments short:** every technical block ends with a concrete change or decision in the attendee's application.
- **Use real failures as material:** setup, startup-order, configuration, networking, and telemetry problems become guided troubleshooting examples.
- **Adapt the deep dives:** attendee needs determine which deployment target and advanced customization topics receive the most detail.

---

## Day 1: Aspirifying for local development

**Day 1 milestone:** a meaningful slice of the attendee's existing application starts reliably through Aspire and can be inspected in the dashboard.

| Time | Session | Outcome and hands-on checkpoint |
|---|---|---|
| 08:00–09:00 | Breakfast | NDC breakfast; no workshop content scheduled. |
| 09:00–10:15 | **See your system:** understand Aspire and map the stack | Introduce the workshop workflow and the essential Aspire mental model: AppHost, resources, references, endpoints, orchestration, and the distinction between running and deploying. Map the sample application together, then have attendees inventory their own stack and choose one achievable vertical slice. **Open lab:** create and review each attendee's first resource graph. |
| 10:15–10:30 | Morning break |  |
| 10:30–12:00 | **Get it running:** create the first Aspire model | Run `aspire init`, choose an AppHost style, and demonstrate how existing projects, executables, JavaScript/Python apps, and containers enter the resource model. Add the first endpoints, references, and startup dependency. Include the agent-assisted Aspireify path while explaining the generated result. **Open lab:** attendees create their AppHost and get at least one application service running through Aspire. |
| 12:00–13:00 | Lunch |  |
| 13:00–15:15 | **Make it useful and repeatable:** dependencies, configuration, and reliability | Extend the first service into a useful vertical slice by adding databases, caches, queues, containers, or external services. Cover references, service discovery, connection information, parameters, secrets, environment variables, persistence, `WaitFor`, health checks, resource lifecycle, and custom commands that replace repeated developer scripts or README steps. Discuss what belongs in the AppHost versus application or environment configuration. **Open lab:** attendees connect a real dependency, expose one useful workflow where appropriate, remove manual startup or connection-string steps, and prove the slice can restart cleanly. |
| 15:15–15:30 | Afternoon break |  |
| 15:30–17:00 | **Understand and harden it:** observe, debug, recover, and finish the slice | Use the resource view, console and structured logs, traces, and metrics to follow a request across services. Introduce a failure, diagnose it from runtime evidence, and improve health checks, startup ordering, configuration, or recovery behavior where needed. **Open lab:** attendees investigate and harden their own application, close Day 1 gaps, and leave the selected slice running or with a clearly evidenced blocker. |

---

## Day 2: From a local model to a production path

**Day 2 milestone:** each attendee can explain how their Aspire application model maps toward deployment and leaves with one advanced improvement plus a prioritized next-step plan.

| Time | Session | Outcome and hands-on checkpoint |
|---|---|---|
| 08:00–09:00 | Breakfast | NDC breakfast; no workshop content scheduled. |
| 09:00–10:15 | **Agentic Power Hour:** give an AI coding agent the context to operate the stack | Show why Aspire is an unusually powerful foundation for agent-assisted development: the AppHost provides an architectural model, while the CLI, skills, dashboard data, logs, traces, resource state, commands, and optional MCP server provide live operational context. Demonstrate Copilot helping investigate a real failure and make a useful change based on runtime evidence rather than source-code guesses. **Open lab:** attendees configure their agent workflow and use it to diagnose, explain, or improve one part of their Aspireified application. Close by comparing prompts, evidence, changes, and failure modes. |
| 10:15–10:30 | Morning break |  |
| 10:30–12:00 | **Package and ship it:** publish and deploy with Docker Compose | Move from run mode to publish and deploy mode. Add a Docker Compose environment, inspect generated artifacts and pipeline steps, and discuss images, networking, environment values, persistent data, and resources that need a different production representation. Use Docker or Podman according to attendee environments. **Open lab:** attendees publish or deploy their modeled slice and inspect what Aspire produced. |
| 12:00–13:00 | Lunch |  |
| 13:00–15:15 | **Make it production-shaped:** target environments and purposeful customization | Show how the same application model maps to a real target without implying that Aspire removes infrastructure decisions. Select the most relevant deployment path for the room and cover environments, existing or managed resources, identity and secrets, persistence, ingress, CI/CD boundaries, and cleanup. Demonstrate environment-specific modeling and how to extend or replace resource behavior only where the production target requires it. **Open lab:** attendees complete a local-to-production gap analysis and adapt one part of their model for its intended target. |
| 15:15–15:30 | Afternoon break |  |
| 15:30–15:40 | Workshop evaluation | Required organizer slot. |
| 15:40–17:00 | **Show, ask, and wrap:** attendee demos, parking-lot Q&A, and optional final help | Keep the final block intentionally light. Start with short attendee demos focused on what they Aspireified, what improved, and what they learned—not polished presentations. Use the remaining group energy to answer open questions and address the highest-value items collected in the parking lot across both days. Close the formal workshop with key resources and a simple next-step prompt. Use any remaining time as optional office hours, individual troubleshooting, or informal show-and-tell rather than introducing another major topic. |

---

## Standard teaching rhythm for technical blocks

1. **Open with a short slide segment** that frames the problem, defines the key terms, and introduces the relevant Aspire features or APIs. Slides should give attendees the mental model and vocabulary needed for the exercise, not exhaustively document the feature.
2. **Show the idea in a real application** by live-coding the smallest useful change.
3. **Give attendees a bounded open-lab exercise** with a visible success condition and optional stretch goal.
4. **Support and troubleshoot** while attendees apply the concept to their own application or the fallback sample.
5. **Regroup around runtime evidence** to discuss common failure modes, useful variations, and attendee discoveries.
6. **Capture unresolved or adjacent questions** in the parking lot rather than allowing them to consume the block.

## Content-building guardrails

- Build demos around one evolving polyglot application so attendees see the same resource model mature across both days.
- Keep each opening slide segment concise and tied directly to the demo and lab that follow.
- Prepare a short version and a stretch version of every exercise; real applications will progress at different speeds.
- For every block, create a facilitator demo, an attendee exercise, a success check, two or three planted failure modes, and a fallback path.
- Keep C# and TypeScript AppHost examples conceptually equivalent. The AppHost language must not imply a restriction on workload languages.
- Treat Docker Compose as the common deployment exercise, not as the universal production recommendation.
- Keep provider-specific deployment material modular so the room can choose the most relevant target.
- Do not promise that every attendee will fully deploy their application during the workshop; the durable outcome is a tested path and an explicit gap analysis.

## Initial content build order

1. The evolving sample application and its before-Aspire startup experience.
2. Day 1 resource-model walkthrough and first Aspirification exercise.
3. Dependency/configuration exercise and planted startup failure.
4. Observability investigation that uses logs and a distributed trace.
5. Docker Compose publish/deploy exercise and artifact review.
6. Production gap-analysis worksheet.
7. Agentic Power Hour setup, failure scenario, prompts, and evidence-based debugging exercise.
8. Production-target adaptation and optional parking-lot topic modules.
9. Attendee demo prompts, final next-step prompt, and facilitator troubleshooting notes.
