# Azure Integration Test
# Validates that Azure OpenAI and Azure Document Intelligence are properly configured

# Load environment variables from .env
Get-Content ..\.env | ForEach-Object {
  if ($_ -match '^([^#][^=]+)=(.*)$') {
    [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
  }
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   Worklighter Azure Integration Tests" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$results = @{}

# Test 1: API Health Check
Write-Host "🧪 Testing API Health..." -ForegroundColor Yellow
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 5
  $health = $response.Content | ConvertFrom-Json

  if ($health.status -eq "healthy" -or $health.status -eq "ok") {
    Write-Host "✅ API is healthy" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    if ($health.services) {
      Write-Host "   MongoDB: $($health.services.mongodb)" -ForegroundColor Gray
      Write-Host "   Redis: $($health.services.redis)" -ForegroundColor Gray
    }
    elseif ($health.mongodb) {
      Write-Host "   MongoDB: $($health.mongodb)" -ForegroundColor Gray
      Write-Host "   Redis: $($health.redis)" -ForegroundColor Gray
    }
    $results.api = $true
  }
  else {
    Write-Host "❌ API health check failed" -ForegroundColor Red
    $results.api = $false
  }
}
catch {
  Write-Host "❌ API health check failed: $_" -ForegroundColor Red
  $results.api = $false
}

# Test 2: Azure OpenAI
Write-Host "`n🧪 Testing Azure OpenAI Connection..." -ForegroundColor Yellow

$azureOpenAIEndpoint = $env:AZURE_OPENAI_ENDPOINT
$azureOpenAIKey = $env:AZURE_OPENAI_API_KEY
$azureOpenAIDeployment = $env:AZURE_OPENAI_DEPLOYMENT
$azureOpenAIVersion = if ($env:AZURE_OPENAI_API_VERSION) { $env:AZURE_OPENAI_API_VERSION } else { "2025-03-01-preview" }

if (-not $azureOpenAIEndpoint -or -not $azureOpenAIKey -or -not $azureOpenAIDeployment) {
  Write-Host "❌ Azure OpenAI credentials not configured" -ForegroundColor Red
  $results.openai = $false
}
else {
  Write-Host "   Endpoint: $azureOpenAIEndpoint" -ForegroundColor Gray
  Write-Host "   Deployment: $azureOpenAIDeployment" -ForegroundColor Gray
  Write-Host "   API Version: $azureOpenAIVersion" -ForegroundColor Gray

  try {
    $url = "$azureOpenAIEndpoint/openai/deployments/$azureOpenAIDeployment/chat/completions?api-version=$azureOpenAIVersion"

    $body = @{
      messages    = @(
        @{
          role    = "user"
          content = "Extract the following data as JSON: Invoice number INV-12345, date 2024-01-15, total `$1,234.56"
        }
      )
      max_tokens  = 200
      temperature = 0.1
    } | ConvertTo-Json -Depth 10

    $headers = @{
      "Content-Type" = "application/json"
      "api-key"      = $azureOpenAIKey
    }

    $response = Invoke-WebRequest -Uri $url -Method POST -Headers $headers -Body $body -TimeoutSec 30
    $data = $response.Content | ConvertFrom-Json

    if ($data.choices -and $data.choices[0].message.content) {
      Write-Host "✅ Azure OpenAI responding successfully" -ForegroundColor Green
      $preview = $data.choices[0].message.content.Substring(0, [Math]::Min(100, $data.choices[0].message.content.Length))
      Write-Host "   Response preview: $preview..." -ForegroundColor Gray
      $results.openai = $true
    }
    else {
      Write-Host "❌ Azure OpenAI returned empty response" -ForegroundColor Red
      $results.openai = $false
    }
  }
  catch {
    Write-Host "❌ Azure OpenAI connection failed: $_" -ForegroundColor Red
    $results.openai = $false
  }
}

# Test 3: Azure Document Intelligence
Write-Host "`n🧪 Testing Azure Document Intelligence..." -ForegroundColor Yellow

$docIntelEndpoint = if ($env:AZURE_FORM_RECOGNIZER_ENDPOINT) { $env:AZURE_FORM_RECOGNIZER_ENDPOINT } else { $env:AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT }
$docIntelKey = if ($env:AZURE_FORM_RECOGNIZER_API_KEY) { $env:AZURE_FORM_RECOGNIZER_API_KEY } else { $env:AZURE_DOCUMENT_INTELLIGENCE_API_KEY }

if (-not $docIntelEndpoint -or -not $docIntelKey) {
  Write-Host "❌ Azure Document Intelligence credentials not configured" -ForegroundColor Red
  $results.documentIntelligence = $false
}
else {
  Write-Host "   Endpoint: $docIntelEndpoint" -ForegroundColor Gray

  try {
    $url = "$docIntelEndpoint/formrecognizer/documentModels?api-version=2024-11-30"
    $headers = @{
      "Ocp-Apim-Subscription-Key" = $docIntelKey
    }

    $response = Invoke-WebRequest -Uri $url -Method GET -Headers $headers -TimeoutSec 10

    if ($response.StatusCode -eq 200) {
      Write-Host "✅ Azure Document Intelligence accessible" -ForegroundColor Green
      $results.documentIntelligence = $true
    }
    else {
      Write-Host "❌ Azure Document Intelligence API error: $($response.StatusCode)" -ForegroundColor Red
      $results.documentIntelligence = $false
    }
  }
  catch {
    Write-Host "❌ Azure Document Intelligence connection failed: $_" -ForegroundColor Red
    $results.documentIntelligence = $false
  }
}

# Test 4: Azure Blob Storage
Write-Host "`n🧪 Testing Azure Blob Storage..." -ForegroundColor Yellow

$storageAccount = $env:AZURE_STORAGE_ACCOUNT
$storageConnection = $env:AZURE_STORAGE_CONNECTION_STRING
$storageContainer = $env:AZURE_STORAGE_CONTAINER

if (-not $storageAccount -or -not $storageConnection -or -not $storageContainer) {
  Write-Host "⚠️  Azure Blob Storage not fully configured (optional)" -ForegroundColor Yellow
  $results.blobStorage = $true # Not critical
}
else {
  Write-Host "   Account: $storageAccount" -ForegroundColor Gray
  Write-Host "   Container: $storageContainer" -ForegroundColor Gray
  Write-Host "✅ Azure Blob Storage configured" -ForegroundColor Green
  $results.blobStorage = $true
}

# Summary
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   Test Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   API Health:             $(if ($results.api) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($results.api) { 'Green' } else { 'Red' })
Write-Host "   Azure OpenAI:           $(if ($results.openai) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($results.openai) { 'Green' } else { 'Red' })
Write-Host "   Document Intelligence:  $(if ($results.documentIntelligence) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($results.documentIntelligence) { 'Green' } else { 'Red' })
Write-Host "   Blob Storage:           $(if ($results.blobStorage) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($results.blobStorage) { 'Green' } else { 'Red' })
Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$allPassed = $results.Values | Where-Object { $_ -eq $false } | Measure-Object | Select-Object -ExpandProperty Count
if ($allPassed -eq 0) {
  Write-Host "✅ All Azure integration tests PASSED" -ForegroundColor Green
  exit 0
}
else {
  Write-Host "❌ Some Azure integration tests FAILED" -ForegroundColor Red
  exit 1
}
