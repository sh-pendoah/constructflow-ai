output "api_url" {
  description = "Public URL of the API Container App"
  value       = module.api.url
}

output "worker_name" {
  description = "Name of the worker Container App"
  value       = module.worker.name
}

output "scheduler_name" {
  description = "Name of the scheduler Container App"
  value       = module.scheduler.name
}

output "container_app_environment_id" {
  description = "Azure Container Apps environment ID"
  value       = azurerm_container_app_environment.main.id
}

output "resource_group_name" {
  description = "Resource group name for this environment"
  value       = azurerm_resource_group.main.name
}
