output "static_web_app_url" {
  description = "Default hostname of the Static Web App"
  value       = "https://${azurerm_static_web_app.app.default_host_name}"
}

output "deployment_token" {
  description = "Deployment token — use as AZURE_STATIC_WEB_APPS_API_TOKEN in CI/CD"
  value       = azurerm_static_web_app.app.api_key
  sensitive   = true
}
