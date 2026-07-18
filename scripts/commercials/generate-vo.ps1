# Thin wrapper — prefer the Node generator (UTF-8 safe).
# Usage: powershell -File scripts/commercials/generate-vo.ps1
$ErrorActionPreference = "Stop"
Set-Location (Resolve-Path (Join-Path $PSScriptRoot "../.."))
if (-not $env:FFMPEG_PATH -and (Test-Path "C:\Program Files\Jellyfin\Server\ffmpeg.exe")) {
  $env:FFMPEG_PATH = "C:\Program Files\Jellyfin\Server\ffmpeg.exe"
  $env:FFPROBE_PATH = "C:\Program Files\Jellyfin\Server\ffprobe.exe"
}
node scripts/commercials/generate-vo.mjs
