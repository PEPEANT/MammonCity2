[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptRoot = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $scriptRoot ".."))
$removeScript = Join-Path $scriptRoot "remove-green-screen.ps1"

$jobs = @(
  @{
    Input = Join-Path $projectRoot "me_0.png"
    Output = Join-Path $projectRoot "assets\\characters\\player\\me-standing.png"
  },
  @{
    Input = Join-Path $projectRoot "mom__0.png"
    Output = Join-Path $projectRoot "assets\\characters\\player\\mom-reward.png"
  }
)

foreach ($job in $jobs) {
  if (-not (Test-Path $job.Input)) {
    throw "Input image not found: $($job.Input)"
  }

  & powershell -ExecutionPolicy Bypass -File $removeScript -InputPath $job.Input -OutputPath $job.Output
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to process: $($job.Input)"
  }
}

Write-Output "Processed player scene assets into assets\\characters\\player"
