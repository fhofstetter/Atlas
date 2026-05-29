# Atlas - Chrome + DevTools MCP Startup Script
Write-Host "=== Atlas: Chrome + DevTools MCP Startup ===" -ForegroundColor Cyan
Write-Host ""

$debugPort = 9222
$chrome = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
$profileDir = "$env:TEMP\chrome-debug-profile"

# 1. Check / start Chrome
Write-Host "[1] Checking Chrome on port $debugPort ..." -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "http://localhost:$debugPort/json/version" -UseBasicParsing -TimeoutSec 2
    $info = $resp.Content | ConvertFrom-Json
    Write-Host "    Already running: $($info.Browser)" -ForegroundColor Green
} catch {
    Write-Host "    Starting Chrome with --remote-debugging-port=$debugPort ..." -ForegroundColor Yellow
    Start-Process -FilePath $chrome -ArgumentList "--remote-debugging-port=$debugPort", "--user-data-dir=$profileDir"
    Start-Sleep 3
    $resp = Invoke-WebRequest -Uri "http://localhost:$debugPort/json/version" -UseBasicParsing -TimeoutSec 5
    $info = $resp.Content | ConvertFrom-Json
    Write-Host "    Started: $($info.Browser)" -ForegroundColor Green
}

Write-Host ""

# 2. Note about the MCP server
Write-Host "[2] chrome-devtools-mcp is a stdio server." -ForegroundColor Yellow
Write-Host "    Claude Code launches it automatically from .mcp.json on startup." -ForegroundColor Gray
Write-Host "    Config: C:\Data\Projects\code\Atlas\.mcp.json" -ForegroundColor Gray
Write-Host ""

# 3. Launch Claude Code in Atlas
Write-Host "[3] Starting Claude Code in Atlas directory ..." -ForegroundColor Yellow
Set-Location "C:\Data\Projects\code\Atlas"
claude
