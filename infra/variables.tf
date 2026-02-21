# §6.4 Mandatory variables — all resources must supply these values.
# Values are provided per-environment via environments/{env}/terraform.tfvars.

variable "environment" {
  type        = string
  description = "Deployment environment: xpl | dev | stg | prd"
  validation {
    condition     = contains(["xpl", "dev", "stg", "prd"], var.environment)
    error_message = "environment must be one of: xpl, dev, stg, prd (§5.2 environment model)."
  }
}

variable "location" {
  type        = string
  description = "Azure region (e.g. 'eastus2', 'westeurope')"
  default     = "eastus2"
}

# ── §6.4 Mandatory tags ────────────────────────────────────────────────────────

variable "owner_team" {
  type        = string
  description = "Team that owns and is on-call for this environment"
}

variable "cost_center" {
  type        = string
  description = "Cost center code for billing allocation"
}

variable "customer" {
  type        = string
  description = "Customer identifier (internal: 'platform')"
  default     = "platform"
}

variable "compliance_profile" {
  type        = string
  description = "Compliance profile applied to this environment (e.g. 'soc2', 'none')"
  default     = "none"
}

# ── Container registry ─────────────────────────────────────────────────────────

variable "registry" {
  type        = string
  description = "Container registry host (e.g. 'ghcr.io/sh-pendoah')"
}

variable "image_tag" {
  type        = string
  description = "Immutable image tag (git SHA) to deploy — §5.2 build once, promote many"
}

# ── Secrets (injected via pipeline, never in tfvars) ──────────────────────────

variable "mongo_uri" {
  type        = string
  description = "MongoDB connection string"
  sensitive   = true
}

variable "redis_url" {
  type        = string
  description = "Redis connection URL"
  sensitive   = true
}

variable "jwt_secret" {
  type        = string
  description = "JWT signing secret"
  sensitive   = true
}

# ── API service sizing ─────────────────────────────────────────────────────────

variable "api_min_replicas" {
  type        = number
  description = "Minimum ACA replicas for API service"
  default     = 1
}

variable "api_max_replicas" {
  type        = number
  description = "Maximum ACA replicas for API service"
  default     = 10
}

variable "api_cpu" {
  type        = string
  description = "CPU allocation for API service (e.g. '0.5')"
  default     = "0.5"
}

variable "api_memory" {
  type        = string
  description = "Memory allocation for API service (e.g. '1Gi')"
  default     = "1Gi"
}

# ── Worker sizing ──────────────────────────────────────────────────────────────

variable "worker_min_replicas" {
  type        = number
  description = "Minimum ACA replicas for worker service"
  default     = 1
}

variable "worker_max_replicas" {
  type        = number
  description = "Maximum ACA replicas for worker service"
  default     = 5
}

variable "worker_cpu" {
  type        = string
  description = "CPU allocation for worker service"
  default     = "0.5"
}

variable "worker_memory" {
  type        = string
  description = "Memory allocation for worker service"
  default     = "1Gi"
}
