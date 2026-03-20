param(
  [string]$ProjectPath = "$PSScriptRoot\..",
  [string]$NodeVersion = "20.11.1",
  [int]$Port = 3000
)

Write-Host "=== Conduit auto-repair starting ==="

Set-Location $ProjectPath

# 1. Ensure Node via nvm (optional: comment out if not using nvm)
if (Get-Command nvm -ErrorAction SilentlyContinue) {
  Write-Host "Using nvm to set Node $NodeVersion"
  nvm use $NodeVersion | Out-Null
}

Write-Host "Node version: $(node -v)"
Write-Host "NPM version:  $(npm -v)"

# 2. Kill anything on the target port
Write-Host "Checking for existing process on port $Port..."
$net = netstat -ano | Select-String ":$Port"
if ($net) {
  $pid = ($net -split '\s+')[-1]
  Write-Host "Killing PID $pid on port $Port"
  taskkill /PID $pid /F | Out-Null
}

# 3. Clean install
Write-Host "Cleaning node_modules and lockfile..."
if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }
if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force }

Write-Host "Running npm ci..."
npm ci
if ($LASTEXITCODE -ne 0) {
  Write-Error "npm ci failed. Aborting."
  exit 1
}

# 4. Rebuild native modules
Write-Host "Rebuilding better-sqlite3..."
npm rebuild better-sqlite3 --build-from-source
if ($LASTEXITCODE -ne 0) {
  Write-Error "better-sqlite3 rebuild failed. Aborting."
  exit 1
}

# 5. Run migrations (if script exists)
Write-Host "Running migrations (if defined)..."
npm run migrate
# ignore non-zero if you want, or enforce:
# if ($LASTEXITCODE -ne 0) { Write-Error "Migrations failed. Aborting."; exit 1 }

# 6. Start server
Write-Host "Starting Conduit server..."
Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $ProjectPath

Start-Sleep -Seconds 5

# 7. Health check
Write-Host "Checking health endpoint..."
try {
  $resp = Invoke-WebRequest "http://localhost:$Port/health" -UseBasicParsing -TimeoutSec 5
  Write-Host "Health response: $($resp.StatusCode) $($resp.Content)"
} catch {
  Write-Error "Health check failed. Conduit may not be running correctly."
}

Write-Host "=== Conduit auto-repair complete ==="
