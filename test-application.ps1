# Quick Application Test Script

Write-Host "=== Car Rental System Diagnostic ===" -ForegroundColor Cyan
Write-Host ""

# Test Backend
Write-Host "1. Testing Backend (Port 5000)..." -ForegroundColor Yellow
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✓ Backend is running!" -ForegroundColor Green
    Write-Host "   Response: $($backend.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Backend is NOT running!" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    Write-Host "   Solution: Run 'cd backend && npm run dev'" -ForegroundColor Yellow
}

Write-Host ""

# Test Frontend
Write-Host "2. Testing Frontend (Port 3000)..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✓ Frontend is running!" -ForegroundColor Green
    Write-Host "   Status Code: $($frontend.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Frontend is NOT running!" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    Write-Host "   Solution: Run 'cd frontend && npm start'" -ForegroundColor Yellow
}

Write-Host ""

# Test API Endpoint
Write-Host "3. Testing API Registration Endpoint..." -ForegroundColor Yellow
try {
    $testData = @{
        name = "Test User"
        email = "test$(Get-Random)@test.com"
        password = "test123"
        phone = "1234567890"
        role = "Customer"
    } | ConvertTo-Json

    $register = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testData `
        -UseBasicParsing `
        -TimeoutSec 5
    
    Write-Host "   ✓ Registration API is working!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   ⚠ Registration endpoint exists but returned error (might be duplicate email)" -ForegroundColor Yellow
    } else {
        Write-Host "   ✗ Registration API error!" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Diagnostic Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "2. Press F12 to open Developer Console" -ForegroundColor White
Write-Host "3. Check for any red error messages" -ForegroundColor White
Write-Host "4. Try to register a new user" -ForegroundColor White
Write-Host ""
