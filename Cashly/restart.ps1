# Quick fix script - Kill all node processes and restart fresh

Write-Host "Stopping all node processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

Write-Host "Waiting for cleanup..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host "Starting server..." -ForegroundColor Green
Set-Location "$PSScriptRoot\server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "Starting client..." -ForegroundColor Green  
Set-Location "$PSScriptRoot\client"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "Done! Check the new terminal windows." -ForegroundColor Cyan
