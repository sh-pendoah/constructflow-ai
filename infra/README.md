# Infrastructure — docflow-360

Terraform-managed Azure infrastructure following **2026 End-to-End AI Solution Playbook §6**.

## Principles

- **Terraform is the default** — no ad-hoc scripts for provisioning (§6.1).
- **Remote state required** — state stored in Azure Blob Storage; access is restricted (§6.2).
- **Pipeline-only apply in stg/prd** — humans never run `terraform apply` against stg/prd (§6.3).
- **Drift detection** — scheduled runs check for configuration drift (§6.3).
- **Mandatory tags** — all resources tagged: environment, owner, cost-center, customer, compliance (§6.4).

## Layout

```
infra/
├── README.md              — this file
├── providers.tf           — Azure + backend config
├── main.tf                — root module composition
├── variables.tf           — input variable definitions
├── outputs.tf             — exported values
├── modules/
│   └── container-app/     — reusable ACA module
└── environments/
    ├── stg/
    │   └── terraform.tfvars   — stg-specific values
    └── prd/
        └── terraform.tfvars   — prd-specific values
```

## Usage

### Local plan (non-destructive)

```bash
cd infra
terraform init \
  -backend-config="resource_group_name=rg-docflow-tfstate" \
  -backend-config="storage_account_name=stdocflowtfstate" \
  -backend-config="container_name=tfstate" \
  -backend-config="key=docflow-360.tfstate"

terraform plan -var-file="environments/stg/terraform.tfvars"
```

### CI/CD apply (stg)

The `promote.yml` workflow authenticates via OIDC and runs:

```bash
terraform apply -var-file="environments/stg/terraform.tfvars" -auto-approve
```

### Rollback

ACA rollback is handled by traffic-shifting (no Terraform change required).
See [runbook: api-service](../docs/runbooks/api-service.md#rollback).

## Naming convention

All resources follow: `{product}-{component}-{env}` (e.g., `docflow-360-api-stg`).

## Required environment variables / GitHub secrets

| Secret / Variable         | Description                          |
|---------------------------|--------------------------------------|
| `AZURE_CLIENT_ID`         | OIDC federated identity client ID    |
| `AZURE_TENANT_ID`         | Azure tenant ID                      |
| `AZURE_SUBSCRIPTION_ID`   | Target subscription                  |
| `ACA_RESOURCE_GROUP_STG`  | ACA resource group for stg           |
| `ACA_RESOURCE_GROUP_PRD`  | ACA resource group for prd           |
| `ACA_DOMAIN`              | ACA default domain suffix            |
