# Environment and master.env

This repo's `.env` is sourced from the central **master.env** in Repos root. Do not copy the full master.env here.

- **APP_SLUG:** `docflow-360`
- **APP_DOMAIN:** `docflow-360.shtrial.com`

**Generate .env** (from Repos root):

```powershell
.\scripts\generate-repo-env.ps1 -AppSlug docflow-360 -AppDomain docflow-360.shtrial.com -RepoPath ".\sh-pendoah\docflow-360"
```

Uses master.env sections: 1–2, 4–5, 6–9 (App context, URLs, DB, Spaces, Azure, DO Inference, third-party). See Repos root `docs/env-master-mapping.md`.
