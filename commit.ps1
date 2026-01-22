# Quick Git Commit Script
# Usage: .\commit.ps1 "Your commit message"

param(
    [Parameter(Mandatory=$false)]
    [string]$message = "Update project files"
)

Write-Host "=== Quick Git Commit ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "Error: Not a git repository!" -ForegroundColor Red
    exit 1
}

# Get current branch
$branch = git branch --show-current
Write-Host "Current branch: $branch" -ForegroundColor Yellow
Write-Host ""

# Add all changes
Write-Host "Adding all changes..." -ForegroundColor Yellow
git add .
$status = git status --short

if ($status) {
    Write-Host "Files to commit:" -ForegroundColor Green
    git status --short
    Write-Host ""
    
    # Commit with message
    Write-Host "Committing with message: '$message'" -ForegroundColor Yellow
    git commit -m $message
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Commit successful!" -ForegroundColor Green
        Write-Host ""
        
        # Ask if user wants to push
        $push = Read-Host "Push to remote? (y/n)"
        if ($push -eq 'y' -or $push -eq 'Y') {
            Write-Host "Pushing to origin/$branch..." -ForegroundColor Yellow
            git push origin $branch
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Push successful!" -ForegroundColor Green
            } else {
                Write-Host "✗ Push failed!" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "✗ Commit failed!" -ForegroundColor Red
    }
} else {
    Write-Host "No changes to commit." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Cyan
