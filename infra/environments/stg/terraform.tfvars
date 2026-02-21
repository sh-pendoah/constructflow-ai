# stg environment values — docflow-360
# §6.3 Applied by pipeline identity only; never run manually against stg.

environment        = "stg"
location           = "eastus2"
owner_team         = "platform"
cost_center        = "CC-0001"
customer           = "platform"
compliance_profile = "none"

registry     = "ghcr.io/sh-pendoah"
# image_tag is injected by the promote.yml pipeline at apply time via -var

api_min_replicas = 1
api_max_replicas = 5
api_cpu          = "0.5"
api_memory       = "1Gi"

worker_min_replicas = 1
worker_max_replicas = 3
worker_cpu          = "0.5"
worker_memory       = "1Gi"
