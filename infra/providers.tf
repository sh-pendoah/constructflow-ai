# §6.1 Terraform is the default. §7.1 OIDC to Azure — no long-lived credentials.

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.110"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.53"
    }
  }

  # §6.2 Remote state — restricted access; state never stored locally in prod.
  backend "azurerm" {
    # Values injected at init time via -backend-config or CI/CD env vars.
    # resource_group_name  = "rg-docflow-tfstate"
    # storage_account_name = "stdocflowtfstate"
    # container_name       = "tfstate"
    # key                  = "docflow-360.tfstate"
  }
}

provider "azurerm" {
  features {}

  # §7.1 OIDC authentication: client_id, tenant_id, subscription_id
  # are injected via ARM_CLIENT_ID / ARM_TENANT_ID / ARM_SUBSCRIPTION_ID
  # environment variables set by azure/login@v2 in CI/CD.
  use_oidc = true
}
