locals {
  # §6.4 Mandatory resource tags applied to every resource in this workspace.
  common_tags = {
    environment  = var.environment
    owner        = var.owner_team
    cost_center  = var.cost_center
    customer     = var.customer
    compliance   = var.compliance_profile
    product      = "docflow-360"
    managed_by   = "terraform"
  }

  name_prefix = "docflow-360"
}

# ── Resource group ─────────────────────────────────────────────────────────────
resource "azurerm_resource_group" "main" {
  name     = "rg-${local.name_prefix}-${var.environment}"
  location = var.location
  tags     = local.common_tags
}

# ── Azure Container Apps environment ──────────────────────────────────────────
resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-${local.name_prefix}-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.common_tags
}

resource "azurerm_container_app_environment" "main" {
  name                       = "cae-${local.name_prefix}-${var.environment}"
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  tags                       = local.common_tags
}

# ── API service (Azure Container Apps) ────────────────────────────────────────
module "api" {
  source = "./modules/container-app"

  name                = "${local.name_prefix}-api-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  environment_id      = azurerm_container_app_environment.main.id
  image               = "${var.registry}/${local.name_prefix}-api:${var.image_tag}"
  min_replicas        = var.api_min_replicas
  max_replicas        = var.api_max_replicas
  cpu                 = var.api_cpu
  memory              = var.api_memory
  external_ingress    = true
  http_port           = 3000
  tags                = local.common_tags

  env_vars = {
    PORT         = "3000"
    NODE_ENV     = var.environment == "prd" ? "production" : "staging"
    MONGO_URI    = var.mongo_uri
    REDIS_URL    = var.redis_url
    JWT_SECRET   = var.jwt_secret
  }

  liveness_probe = {
    path = "/health/live"
    port = 3000
  }

  readiness_probe = {
    path = "/health/ready"
    port = 3000
  }
}

# ── Worker service ─────────────────────────────────────────────────────────────
module "worker" {
  source = "./modules/container-app"

  name                = "${local.name_prefix}-worker-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  environment_id      = azurerm_container_app_environment.main.id
  image               = "${var.registry}/${local.name_prefix}-worker:${var.image_tag}"
  min_replicas        = var.worker_min_replicas
  max_replicas        = var.worker_max_replicas
  cpu                 = var.worker_cpu
  memory              = var.worker_memory
  external_ingress    = false  # worker is internal-only; no public HTTP endpoint
  tags                = local.common_tags

  env_vars = {
    NODE_ENV  = var.environment == "prd" ? "production" : "staging"
    MONGO_URI = var.mongo_uri
    REDIS_URL = var.redis_url
  }
}

# ── Scheduler service ──────────────────────────────────────────────────────────
module "scheduler" {
  source = "./modules/container-app"

  name                = "${local.name_prefix}-scheduler-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  environment_id      = azurerm_container_app_environment.main.id
  image               = "${var.registry}/${local.name_prefix}-scheduler:${var.image_tag}"
  # Scheduler must always have exactly 1 replica to prevent duplicate alert sends.
  # See docs/runbooks/scheduler-service.md#deployment for operational details.
  min_replicas        = 1
  max_replicas        = 1
  cpu                 = "0.25"
  memory              = "0.5Gi"
  external_ingress    = false  # scheduler is internal-only; no public HTTP endpoint
  tags                = local.common_tags

  env_vars = {
    NODE_ENV  = var.environment == "prd" ? "production" : "staging"
    MONGO_URI = var.mongo_uri
    REDIS_URL = var.redis_url
  }
}
