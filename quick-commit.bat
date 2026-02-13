@echo off
REM Quick Git Commit Batch Script
REM Usage: quick-commit.bat "Your commit message"

if "%1"=="" (
    set MESSAGE=Update project files
) else (
    set MESSAGE=%1
)

echo === Quick Git Commit ===
echo.

git add .
git status --short

if errorlevel 1 (
    echo No changes to commit.
    pause
    exit /b
)

echo.
echo Committing with message: "%MESSAGE%"
git commit -m "%MESSAGE%"

if errorlevel 1 (
    echo Commit failed!
    pause
    exit /b
)

echo.
echo Commit successful!
echo.
set /p PUSH="Push to remote? (y/n): "
if /i "%PUSH%"=="y" (
    git push
)

echo.
echo Done!
pause
