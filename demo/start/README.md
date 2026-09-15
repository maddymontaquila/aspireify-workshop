# Aspireify Bingo: starting point

This is the deliberately un-Aspireified starting point for the workshop. It is based on the real [AspiriFridays Bingo](https://github.com/maddymontaquila/aspirifridays) application, but every part must be configured and started separately.

## Application layout

```text
start/
├── AspireifyBingo.slnx
├── Directory.Packages.props
├── compose.yaml
└── src/
    ├── BingoBoard.Admin/             # Blazor admin portal and SignalR hub
    ├── BingoBoard.Data/              # EF Core model and migrations
    ├── BingoBoard.MigrationService/  # One-shot migration and seed worker
    ├── BingoBoard.ServiceDefaults/   # Shared defaults enabled by checkpoint 03
    └── bingo-board/                  # Vue/Vite player frontend
```

`BingoBoard.ServiceDefaults` is present because every checkpoint shares this source tree. It remains inactive in the starting application and the first two checkpoints; checkpoint 03 enables it through configuration.

The optional nginx Dockerfile and proxy configuration are used by [checkpoint 04](../checkpoints/04-compose/README.md), not by this manual startup path. The .NET projects use SDK container publishing without Dockerfiles. Vite requires its backend URL when serving locally, but building static assets does not require a running backend.

The running application has five resources:

| Resource | Purpose | Fixed local port |
| --- | --- | ---: |
| PostgreSQL | Users, bingo-square definitions, and application data | `5432` |
| Redis | Bingo-board cache and SignalR backplane | `6379` |
| Migration worker | Applies EF Core migrations and seeds the database | None |
| Admin backend | Blazor admin portal, HTTP API, and SignalR hub | `5039` |
| Player frontend | Vue application served by Vite | `5173` |

The player frontend proxies `/api/version-info` and `/bingohub` to the admin backend. That relationship is configured manually in `src/bingo-board/.env`.

## Prerequisites

- .NET 10 SDK
- Node.js 24 LTS
- Podman or Docker with Compose support (note: the below instructions use Podman, but work the same with Docker)

## Manual startup order

The application has no orchestrator. You are responsible for starting its resources in dependency order:

```text
PostgreSQL ──> Migration worker ──> Admin backend ──> Player frontend
Redis ────────────────────────────> Admin backend
```

You will need three long-running processes—Compose, the admin backend, and Vite—plus a one-shot migration command. The commands below assume each terminal starts in the `demo/start` directory.

## Start the application

The commands below intentionally expose the manual setup and startup ordering that the workshop will replace with Aspire.

### 1. Start PostgreSQL and Redis

```bash
podman compose up -d
```

Confirm both containers are running:

```bash
podman compose ps
```

### 2. Configure the .NET services

Set these variables in every terminal that runs a .NET project:

```bash
export ConnectionStrings__db="Host=localhost;Port=5432;Database=bingo;Username=postgres;Password=postgres"
export ConnectionStrings__cache="localhost:6379"
export Authentication__AdminPassword="admin"
```

### 3. Run migrations and seed data

Start the database before running this command. The worker uses bounded Npgsql transient retries if PostgreSQL is still initializing:

```bash
dotnet run --project src/BingoBoard.MigrationService
```

Wait for the worker to apply the migration, seed the bingo squares and admin user, and exit successfully before starting the admin application.

### 4. Start the admin portal and SignalR hub

```bash
dotnet run --project src/BingoBoard.Admin --launch-profile http
```

The admin portal is available at <http://localhost:5039>. Sign in as `admin` using the password configured above.

### 5. Configure and start the player frontend

In a new terminal, starting from `demo/start`:

```bash
cd src/bingo-board
cp .env.example .env
npm ci
npm run dev
```

The player frontend is available at <http://localhost:5173>.

## Verify the application

1. Open <http://localhost:5173> and request a bingo board.
2. Open <http://localhost:5039> and sign in to the admin portal.
3. Confirm that the player appears in the connected-client list.
4. Enable live mode or update a square and confirm that SignalR updates the player.

## Fixed-port behavior

There is no dynamic port allocation or service discovery in this starting state. If `5432`, `6379`, `5039`, or `5173` is already in use, the corresponding resource fails to start. You must locate the conflict or manually update every configuration value that refers to that port.

This limitation is intentional: Aspire will later own port allocation and inject resource connection information.

## Stop and clean up

Stop the frontend and admin processes with <kbd>Ctrl</kbd>+<kbd>C</kbd> in their respective terminals.

Stop PostgreSQL and Redis without deleting database data:

```bash
podman compose stop
```

To remove the containers and the persisted database volume:

```bash
podman compose down --volumes
```

## Common startup failures

- **The migration worker cannot connect:** PostgreSQL is not ready, port `5432` is occupied, or `ConnectionStrings__db` was not set in that terminal.
- **The admin backend exits during startup:** one of the two connection strings is missing, Redis is unavailable, or migrations have not completed.
- **Vite reports that `BINGO_ADMIN_URL` is missing:** copy `.env.example` to `.env` inside `src/bingo-board`.
- **The frontend loads but cannot create a board:** verify that the admin backend is running on `5039` and inspect the Vite terminal for proxy or WebSocket errors.
- **A port is already allocated:** stop the conflicting process or update the port and every manually coupled configuration value.
