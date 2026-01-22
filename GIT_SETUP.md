# Git Setup Guide for Group Project

## Step 1: Commit Your Changes

All files are staged. Now commit them:

```bash
git commit -m "Initial commit: Complete MERN Car Rental System"
```

## Step 2: Create Remote Repository

### Option A: GitHub (Recommended)

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Name it: `car-rental-system` (or any name you prefer)
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

### Option B: GitLab

1. Go to [GitLab.com](https://gitlab.com) and sign in
2. Click **"New project"** → **"Create blank project"**
3. Fill in project name and visibility
4. Click **"Create project"**

## Step 3: Connect Local Repository to Remote

After creating the remote repository, GitHub/GitLab will show you commands. Use these:

### For GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/car-rental-system.git
```

### For GitLab:
```bash
git remote add origin https://gitlab.com/YOUR_USERNAME/car-rental-system.git
```

**Replace `YOUR_USERNAME` with your actual GitHub/GitLab username!**

## Step 4: Push to Remote

```bash
# Push to main/master branch
git branch -M main
git push -u origin main
```

If you're already on a different branch (like `mongo-uri`):
```bash
git push -u origin mongo-uri
```

## Step 5: Share with Your Group

1. Go to your repository on GitHub/GitLab
2. Click **"Settings"** → **"Collaborators"** (GitHub) or **"Members"** (GitLab)
3. Add your team members by their username or email
4. Give them **Write** or **Admin** access

## Step 6: Team Members Clone the Project

Your team members should run:

```bash
git clone https://github.com/YOUR_USERNAME/car-rental-system.git
cd car-rental-system
```

## Important Notes

### ⚠️ Never Commit These Files:
- `.env` files (contains secrets)
- `node_modules/` (too large)
- `uploads/` (user-uploaded files)
- `*.log` files

These are already in `.gitignore` and will be automatically excluded.

### For Team Members After Cloning:

1. **Backend setup:**
   ```bash
   cd backend
   npm install
   # Create .env file (copy from .env.example or ask team lead)
   mkdir uploads
   ```

2. **Frontend setup:**
   ```bash
   cd frontend
   npm install
   ```

3. **Create admin user:**
   ```bash
   cd backend
   node -e "require('./middleware/createAdmin.js')"
   ```

## Common Git Commands for Group Work

```bash
# Pull latest changes from remote
git pull origin main

# Check current status
git status

# See what branch you're on
git branch

# Create a new branch for a feature
git checkout -b feature-name

# Switch branches
git checkout branch-name

# Push your branch
git push -u origin feature-name

# Merge changes (after pull request is approved)
git checkout main
git pull origin main
git merge feature-name
```

## Branch Strategy (Recommended)

- `main` - Production-ready code
- `develop` - Development branch
- `feature/feature-name` - Individual features
- `bugfix/bug-name` - Bug fixes

## Troubleshooting

### If you get "remote already exists":
```bash
git remote remove origin
git remote add origin YOUR_REPO_URL
```

### If push is rejected:
```bash
git pull origin main --rebase
git push origin main
```

### To see remote URL:
```bash
git remote -v
```
