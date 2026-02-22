# prd environment values — docflow-360
# §6.3 Applied by pipeline identity only; never run manually against prd.
# §4   Production write access is pipeline-only. Break-glass requires incident ticket.

environment        = "prd"
location           = "eastus2"
owner_team         = "platform"
cost_center        = "CC-0001"
customer           = "platform"
compliance_profile = "soc2"

registry     = "ghcr.io/sh-pendoah"
# image_tag is injected by the promote.yml pipeline at apply time via -var

api_min_replicas = 2   # prd always has 2+ replicas for availability
api_max_replicas = 20
api_cpu          = "1.0"
api_memory       = "2Gi"

worker_min_replicas = 2
worker_max_replicas = 10
worker_cpu          = "1.0"
worker_memory       = "2Gi"
