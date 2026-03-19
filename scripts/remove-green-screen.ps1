[CmdletBinding()]
param(
  [string]$InputPath = "",
  [string]$OutputPath = "",
  [int]$SampleSize = 12,
  [double]$TransparentDistance = 42,
  [double]$OpaqueDistance = 90,
  [int]$GreenDominanceThreshold = 12,
  [int]$DespillBias = 10
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$scriptRoot = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($InputPath)) {
  $primaryDefault = Join-Path $scriptRoot "..\\me_0.png"
  $legacyDefault = Join-Path $scriptRoot "..\\grok-image-b7e09d46-ad53-4b28-98b8-e0d005131488.png"
  $InputPath = if (Test-Path $primaryDefault) { $primaryDefault } else { $legacyDefault }
}
if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $OutputPath = Join-Path $scriptRoot "..\\assets\\characters\\player\\me-standing.png"
}

if (-not ("MammonCity.GreenScreenRemover" -as [type])) {
  Add-Type -ReferencedAssemblies "System.Drawing" -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

namespace MammonCity
{
    public static class GreenScreenRemover
    {
        private struct RgbSample
        {
            public double R;
            public double G;
            public double B;
        }

        public static void Remove(
            string inputPath,
            string outputPath,
            int sampleSize,
            double transparentDistance,
            double opaqueDistance,
            int greenDominanceThreshold,
            int despillBias)
        {
            using (var sourceOriginal = new Bitmap(inputPath))
            using (var source = new Bitmap(sourceOriginal.Width, sourceOriginal.Height, PixelFormat.Format32bppArgb))
            using (var graphics = Graphics.FromImage(source))
            {
                graphics.DrawImage(sourceOriginal, 0, 0, sourceOriginal.Width, sourceOriginal.Height);
                var key = GetAverageCornerColor(source, Math.Max(1, sampleSize));
                using (var output = new Bitmap(source.Width, source.Height, PixelFormat.Format32bppArgb))
                {
                    ProcessPixels(source, output, key, transparentDistance, opaqueDistance, greenDominanceThreshold, despillBias);
                    output.Save(outputPath, ImageFormat.Png);
                }
            }
        }

        private static RgbSample GetAverageCornerColor(Bitmap bitmap, int sampleSize)
        {
            int width = bitmap.Width;
            int height = bitmap.Height;
            int size = Math.Min(sampleSize, Math.Min(width, height));

            int[,] corners = new int[,]
            {
                { 0, 0 },
                { Math.Max(0, width - size), 0 },
                { 0, Math.Max(0, height - size) },
                { Math.Max(0, width - size), Math.Max(0, height - size) }
            };

            double totalR = 0;
            double totalG = 0;
            double totalB = 0;
            long totalPixels = 0;

            for (int cornerIndex = 0; cornerIndex < 4; cornerIndex++)
            {
                int startX = corners[cornerIndex, 0];
                int startY = corners[cornerIndex, 1];

                for (int y = startY; y < startY + size; y++)
                {
                    for (int x = startX; x < startX + size; x++)
                    {
                        Color pixel = bitmap.GetPixel(x, y);
                        totalR += pixel.R;
                        totalG += pixel.G;
                        totalB += pixel.B;
                        totalPixels++;
                    }
                }
            }

            return new RgbSample
            {
                R = totalR / totalPixels,
                G = totalG / totalPixels,
                B = totalB / totalPixels
            };
        }

        private static void ProcessPixels(
            Bitmap source,
            Bitmap output,
            RgbSample key,
            double transparentDistance,
            double opaqueDistance,
            int greenDominanceThreshold,
            int despillBias)
        {
            Rectangle rect = new Rectangle(0, 0, source.Width, source.Height);
            BitmapData srcData = source.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            BitmapData dstData = output.LockBits(rect, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

            try
            {
                int bytes = Math.Abs(srcData.Stride) * source.Height;
                byte[] srcBuffer = new byte[bytes];
                byte[] dstBuffer = new byte[bytes];
                Marshal.Copy(srcData.Scan0, srcBuffer, 0, bytes);

                for (int y = 0; y < source.Height; y++)
                {
                    int rowOffset = y * srcData.Stride;

                    for (int x = 0; x < source.Width; x++)
                    {
                        int index = rowOffset + (x * 4);
                        int blue = srcBuffer[index];
                        int green = srcBuffer[index + 1];
                        int red = srcBuffer[index + 2];
                        int alpha = srcBuffer[index + 3];

                        double distance = Math.Sqrt(
                            Math.Pow(red - key.R, 2) +
                            Math.Pow(green - key.G, 2) +
                            Math.Pow(blue - key.B, 2));

                        int greenDominance = green - Math.Max(red, blue);
                        int outputAlpha;

                        if (greenDominance >= greenDominanceThreshold && distance <= transparentDistance)
                        {
                            outputAlpha = 0;
                        }
                        else if (greenDominance <= 0 || distance >= opaqueDistance)
                        {
                            outputAlpha = 255;
                        }
                        else
                        {
                            double normalized = (distance - transparentDistance) / Math.Max(1, opaqueDistance - transparentDistance);
                            outputAlpha = ClampToByte((int)Math.Round(normalized * 255.0));
                        }

                        if (alpha < outputAlpha)
                        {
                            outputAlpha = alpha;
                        }

                        int cleanedGreen = green;
                        int cleanedRed = red;
                        int cleanedBlue = blue;
                        if (greenDominance > 0)
                        {
                            int cap = Math.Max(red, blue) + despillBias;
                            cleanedGreen = Math.Min(cleanedGreen, cap);
                        }

                        if (outputAlpha == 0)
                        {
                            cleanedRed = 0;
                            cleanedGreen = 0;
                            cleanedBlue = 0;
                        }

                        dstBuffer[index] = (byte)cleanedBlue;
                        dstBuffer[index + 1] = (byte)cleanedGreen;
                        dstBuffer[index + 2] = (byte)cleanedRed;
                        dstBuffer[index + 3] = (byte)outputAlpha;
                    }
                }

                Marshal.Copy(dstBuffer, 0, dstData.Scan0, bytes);
            }
            finally
            {
                source.UnlockBits(srcData);
                output.UnlockBits(dstData);
            }
        }

        private static int ClampToByte(int value)
        {
            if (value < 0) return 0;
            if (value > 255) return 255;
            return value;
        }
    }
}
"@
}

$resolvedInput = [System.IO.Path]::GetFullPath($InputPath)
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)

if (-not (Test-Path $resolvedInput)) {
  throw "Input image not found: $resolvedInput"
}

$outputDirectory = Split-Path -Parent $resolvedOutput
if (-not (Test-Path $outputDirectory)) {
  New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
}

[MammonCity.GreenScreenRemover]::Remove(
  $resolvedInput,
  $resolvedOutput,
  $SampleSize,
  $TransparentDistance,
  $OpaqueDistance,
  $GreenDominanceThreshold,
  $DespillBias
)

Write-Output "Created transparent PNG: $resolvedOutput"
