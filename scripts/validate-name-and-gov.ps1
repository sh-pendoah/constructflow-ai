$ErrorActionPreference = 'Stop'

$root = Resolve-Path "$PSScriptRoot\.."
$repoName = Split-Path $root -Leaf
$canonical = 'docflow-360'

if ($repoName -ne $canonical) {
  Write-Error "Repository folder must be 'docflow-360', found '$repoName'."
}

$requiredPaths = @(
  'apps/api',
  'apps/ai-runtime',
  'gov-config.yaml',
  'gov-config.schema.json',
  'tests/golden-smoke.ps1'
)
foreach ($p in $requiredPaths) {
  if (-not (Test-Path (Join-Path $root $p))) {
    Write-Error "Missing required path: $p"
  }
}

$legacyPattern = '(q[u]adtech|w[o]rklighter|w[o]rklight|v[o]xops|v[e]ntureforge|f[i]nanceiq|sh-pendoah/(q[u]adtech|w[o]rklighter|v[o]xops|v[e]ntureforge)|@(q[u]adtech|w[o]rklighter|v[o]xops|v[e]ntureforge)/)'

$legacyPaths = rg --files $root | rg $legacyPattern
if ($LASTEXITCODE -eq 0 -and $legacyPaths) {
  Write-Host $legacyPaths
  Write-Error 'Legacy slug found in file paths.'
}

$legacyContent = rg -n --hidden --glob '!**/.git/**' --glob '!**/node_modules/**' --glob '!**/scripts/validate-name-and-gov.ps1' $legacyPattern $root
if ($LASTEXITCODE -eq 0 -and $legacyContent) {
  Write-Host $legacyContent
  Write-Error 'Legacy slug found in file contents.'
}

$govFile = Join-Path $root 'gov-config.yaml'
$raw = Get-Content -LiteralPath $govFile -Raw

function Require-Match($pattern, $message) {
  if ($raw -notmatch $pattern) {
    Write-Error $message
  }
}

Require-Match "(?m)^\s*compliance_mode:\s*(strict|open)\s*(#.*)?$" 'Invalid or missing compliance_mode'
Require-Match "(?m)^\s*data_residency:\s*\S+\s*(#.*)?$" 'Invalid or missing data_residency'
Require-Match "(?m)^\s*budget_cap_daily_usd:\s*[0-9]+(\.[0-9]+)?\s*(#.*)?$" 'Invalid or missing budget_cap_daily_usd'
Require-Match "(?m)^\s*audit_log_retention_days:\s*[0-9]+\s*(#.*)?$" 'Invalid or missing audit_log_retention_days'
Require-Match "(?m)^\s*human_in_the_loop_threshold:\s*(0(\.[0-9]+)?|1(\.0+)?)\s*(#.*)?$" 'Invalid or missing human_in_the_loop_threshold'

$traceparent = rg -n --hidden --glob '!**/.git/**' 'traceparent' $root
if ($LASTEXITCODE -ne 0 -or -not $traceparent) {
  Write-Error 'Missing traceparent usage/documentation in repo.'
}

$tracestate = rg -n --hidden --glob '!**/.git/**' 'tracestate' $root
if ($LASTEXITCODE -ne 0 -or -not $tracestate) {
  Write-Error 'Missing tracestate usage/documentation in repo.'
}

Write-Host 'Release blockers passed.'

