# Quick Commit Guide - Easy Git Commits

## 🚀 Method 1: Use the Script (Easiest!)

### PowerShell Script (Windows):
```powershell
# With custom message
.\commit.ps1 "Fixed login bug"

# With default message
.\commit.ps1
```

### Batch Script (Windows):
```cmd
# With custom message
quick-commit.bat "Fixed login bug"

# With default message
quick-commit.bat
```

## 🚀 Method 2: Git Aliases (Fastest!)

### Setup (One-time):
```bash
# Quick commit and push
git config --global alias.cm '!f() { git add . && git commit -m "$1" && git push; }; f'

# Quick save (auto message)
git config --global alias.save '!git add . && git commit -m "Save progress" && git push'

# Quick commit only
git config --global alias.quick '!git add . && git commit -m'
```

### Usage:
```bash
# Commit and push in one command
git cm "Fixed login bug"

# Quick save with auto message
git save

# Commit only (no push)
git quick "Fixed login bug"
```

## 🚀 Method 3: Simple Commands

### 3-Step Process:
```bash
git add .
git commit -m "Your message"
git push
```

### 2-Step Process (if you want to review first):
```bash
git add .
git commit -m "Your message"
# Then push separately: git push
```

## 📝 Common Commit Messages

```bash
git cm "Update project files"
git cm "Fix login issue"
git cm "Add new feature"
git cm "Update documentation"
git cm "Fix bug in booking"
git cm "Refactor code"
```

## ⚡ Pro Tips

1. **Use the script**: `.\commit.ps1 "message"` - Does everything automatically
2. **Use git aliases**: Set up once, use forever - fastest method!
3. **Short messages**: Keep commit messages short and clear
4. **Commit often**: Small, frequent commits are better than large ones

## 🔧 Setup Git Aliases (Recommended)

Run this once to set up quick commands:

```bash
git config --global alias.cm '!f() { git add . && git commit -m "$1" && git push; }; f'
git config --global alias.save '!git add . && git commit -m "Save progress" && git push'
```

Then use:
- `git cm "message"` - Commit and push
- `git save` - Quick save with auto message

## 📋 Quick Reference

| Command | What it does |
|---------|-------------|
| `.\commit.ps1 "msg"` | Add, commit, optionally push |
| `git cm "msg"` | Add, commit, and push (if alias set) |
| `git save` | Quick save with auto message |
| `git add . && git commit -m "msg" && git push` | Manual 3-in-1 |
