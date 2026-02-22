# §6.1 Minimal reusable Azure Container App module.
# Used by api, worker, and scheduler.

variable "name" {
  type        = string
  description = "Container app name"
}

variable "resource_group_name" {
  type        = string
  description = "Resource group"
}

variable "environment_id" {
  type        = string
  description = "ACA environment ID"
}

variable "image" {
  type        = string
  description = "Full container image reference (registry/name:tag)"
}

variable "min_replicas" {
  type    = number
  default = 1
}

variable "max_replicas" {
  type    = number
  default = 5
}

variable "cpu" {
  type    = string
  default = "0.5"
}

variable "memory" {
  type    = string
  default = "1Gi"
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "env_vars" {
  type    = map(string)
  default = {}
}

variable "external_ingress" {
  type        = bool
  description = "Whether to expose an external HTTPS ingress. Set to false for internal-only services (worker, scheduler)."
  default     = false
}

variable "http_port" {
  type        = number
  description = "Port the container listens on for HTTP traffic."
  default     = 3000
}

variable "liveness_probe" {
  type = object({
    path = string
    port = number
  })
  default = null
}

variable "readiness_probe" {
  type = object({
    path = string
    port = number
  })
  default = null
}

resource "azurerm_container_app" "this" {
  name                         = var.name
  container_app_environment_id = var.environment_id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Multiple"  # enables ACA revisions for canary/rollback
  tags                         = var.tags

  template {
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    container {
      name   = var.name
      image  = var.image
      cpu    = var.cpu
      memory = var.memory

      dynamic "env" {
        for_each = var.env_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      dynamic "liveness_probe" {
        for_each = var.liveness_probe != null ? [var.liveness_probe] : []
        content {
          transport = "HTTP"
          path      = liveness_probe.value.path
          port      = liveness_probe.value.port
        }
      }

      dynamic "readiness_probe" {
        for_each = var.readiness_probe != null ? [var.readiness_probe] : []
        content {
          transport = "HTTP"
          path      = readiness_probe.value.path
          port      = readiness_probe.value.port
        }
      }
    }
  }

  ingress {
    external_enabled = var.external_ingress
    target_port      = var.http_port
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }
}

output "url" {
  value = "https://${azurerm_container_app.this.latest_revision_fqdn}"
}

output "name" {
  value = azurerm_container_app.this.name
}
