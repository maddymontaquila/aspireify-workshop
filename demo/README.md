# Workshop demo

The demo is organized as a sequence of workshop states.

- [`start`](start/README.md) is the deliberately un-Aspireified application attendees begin with.
- [`checkpoints/01-apphost`](checkpoints/01-apphost/README.md) contains equivalent C# and TypeScript AppHosts for the first Aspirification pass.
- [`checkpoints/02-customize`](checkpoints/02-customize/README.md) adds parameters, dashboard URLs and icons, and an interactive HTTP command.
- [`checkpoints/03-observe`](checkpoints/03-observe/README.md) adds ServiceDefaults, OpenTelemetry signals, explicit HTTP health checks, and the Day 1 acceptance/restart checklist.
- [`checkpoints/04-compose`](checkpoints/04-compose/README.md) deploys the app with Docker Compose, with interchangeable YARP and nginx frontend containers.
- Additional checkpoints are in progress.

The starting application is based on the real [AspiriFridays Bingo](https://github.com/maddymontaquila/aspirifridays) app while keeping the core workshop path limited to its web frontend, admin/SignalR backend, migration worker, PostgreSQL database, and Redis cache.
