# Checkpoint 02: customize the inner loop

This checkpoint turns the first AppHost into a tailored developer experience. Both variants orchestrate the same application source under [`demo/start/src`](../../start/src) and add:

- A secret parameter shared by the migration worker and admin portal
- A custom icon for the admin resource
- Named dashboard URLs for playing and managing the game
- An interactive HTTP command that adds a square through the admin API
- Structured command output showing what the API changed

Choose either:

- [`csharp`](csharp/README.md) for a C# file-based AppHost.
- [`typescript`](typescript/README.md) for a TypeScript AppHost.

The HTTP command targets a development-only endpoint in the admin application. Aspire renders its arguments as a dashboard form and also exposes them as options through `aspire resource`.
