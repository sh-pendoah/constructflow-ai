# Deploy docflow-360 on DigitalOcean (POC)

This is an **optional** way to run docflow-360 on DigitalOcean App Platform for lightweight or POC use.

- **Production and staging:** Use **Azure Terraform** in [infra/](../infra/). That is the source of truth for stg/prd.
- **This DO spec** (`app.do-poc.yaml`): Uses shared Postgres/Spaces and env-injected secrets (no `databases:` block). Set `MONGO_URI`, `REDIS_URL`, `DO_SPACES_*`, and `AZURE_*` in the DO app’s environment (from master.env).

## Deploy

```bash
doctl apps create --spec app.do-poc.yaml
# Or update existing app:
doctl apps update <app-id> --spec app.do-poc.yaml
```

Ensure the app’s env vars are set in the DO dashboard (or via CI). The spec defines only `api` and `web`; worker and scheduler are not included in this POC.
