$ErrorActionPreference = 'Stop'
$root = Resolve-Path "$PSScriptRoot\.."

& (Join-Path $root 'scripts/validate-name-and-gov.ps1')

$healthRefs = rg -n --hidden --glob '!**/.git/**' '/health|healthz|healthcheck' (Join-Path $root 'apps/api')
if ($LASTEXITCODE -ne 0 -or -not $healthRefs) {
  Write-Error 'No /health-style endpoint found in apps/api.'
}

$runtimeRefs = rg -n --hidden --glob '!**/.git/**' 'apps/ai-runtime|ai-runtime' $root
if ($LASTEXITCODE -ne 0 -or -not $runtimeRefs) {
  Write-Error 'No ai-runtime references found.'
}

Write-Host 'Golden smoke checks passed.'
