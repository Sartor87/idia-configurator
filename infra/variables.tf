variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "westeurope"
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "rg-idia-configurator"
}

variable "app_name" {
  description = "Name of the Static Web App resource"
  type        = string
  default     = "stapp-idia-configurator"
}
