# TypeScript AppHost: customized inner loop

This TypeScript AppHost adds dashboard polish and an interactive developer command to the first checkpoint.

Install its local tooling and generate the Aspire SDK:

```bash
npm install
aspire restore
```

Then run the application:

```bash
aspire run
```

Aspire prompts for the `admin-password` parameter on the first run. Use it to sign in to the admin portal as `admin`.

In the dashboard:

1. Use **Play bingo**, **Manage board**, and **Manage squares** to open named application views.
2. Open the `boardadmin` resource commands.
3. Run **Add bingo square**, fill in the form, and inspect the structured API response.

The same command is available from the CLI:

```bash
aspire resource boardadmin add-bingo-square \
  --id "workshop-demo" \
  --label "Someone says distributed monolith" \
  --category "workshop"
```
