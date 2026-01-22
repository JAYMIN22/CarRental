# Quick Git Commands to Upload Your Project

## Step 1: Configure Git (One-time setup)

Replace with YOUR actual name and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 2: Commit Your Changes

```bash
git commit -m "Initial commit: Complete MERN Car Rental System with all modules"
```

## Step 3: Create Repository on GitHub/GitLab

### GitHub:
1. Go to https://github.com/new
2. Repository name: `car-rental-system`
3. Choose Public or Private
4. **DO NOT** check "Initialize with README"
5. Click "Create repository"

### GitLab:
1. Go to https://gitlab.com/projects/new
2. Create blank project
3. Fill in project name
4. Click "Create project"

## Step 4: Connect and Push

After creating the repository, copy the repository URL and run:

```bash
# Add remote (replace URL with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/car-rental-system.git

# Rename branch to main (if needed)
git branch -M main

# Push to remote
git push -u origin main
```

## Step 5: Share with Team

1. Go to repository → Settings → Collaborators (GitHub) or Members (GitLab)
2. Add team members by username/email
3. Give them Write access

## Team Members Clone:

```bash
git clone https://github.com/YOUR_USERNAME/car-rental-system.git
cd car-rental-system
```

---

**Note:** The `.env` file is already in `.gitignore` and won't be uploaded (this is good for security!)
