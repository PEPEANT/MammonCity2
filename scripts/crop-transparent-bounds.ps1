[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,

  [Parameter(Mandatory = $true)]
  [string]$OutputPath,

  [int]$Padding = 8
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$resolvedInput = [System.IO.Path]::GetFullPath($InputPath)
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)

if (-not (Test-Path $resolvedInput)) {
  throw "Input image not found: $resolvedInput"
}

$outputDirectory = Split-Path -Parent $resolvedOutput
if ($outputDirectory) {
  New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
}

$bitmap = [System.Drawing.Bitmap]::new($resolvedInput)
try {
  $minX = $bitmap.Width
  $minY = $bitmap.Height
  $maxX = -1
  $maxY = -1

  for ($y = 0; $y -lt $bitmap.Height; $y++) {
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
      if ($bitmap.GetPixel($x, $y).A -gt 0) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -lt 0) {
    throw "No opaque pixels found in: $resolvedInput"
  }

  $safePadding = [Math]::Max(0, $Padding)
  $minX = [Math]::Max(0, $minX - $safePadding)
  $minY = [Math]::Max(0, $minY - $safePadding)
  $maxX = [Math]::Min($bitmap.Width - 1, $maxX + $safePadding)
  $maxY = [Math]::Min($bitmap.Height - 1, $maxY + $safePadding)

  $rect = [System.Drawing.Rectangle]::FromLTRB($minX, $minY, $maxX + 1, $maxY + 1)
  $cropped = $bitmap.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $cropped.Save($resolvedOutput, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $cropped.Dispose()
  }
}
finally {
  $bitmap.Dispose()
}

Write-Output "Cropped transparent bounds: $resolvedOutput"
