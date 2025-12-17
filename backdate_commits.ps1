$ErrorActionPreference = "Stop"

# Configuration
$TargetChanges = 90
$TotalCommits = 60
$CommitsDay1 = 35
$CommitsDay2 = 25
$Date1 = Get-Date -Date "2025-12-17 09:00:00"
$Date2 = Get-Date -Date "2025-12-18 09:00:00"

# 1. Get all file paths
Write-Host "Detecting changes..."
git add -A
$files = git diff --name-only --cached
git reset
$fileList = $files -split "`n" | Where-Object { $_ -ne "" }

$count = $fileList.Count
Write-Host "Found $count changed files."

if ($count -lt $TotalCommits) {
    Write-Warning "Not enough files ($count) for $TotalCommits commits. Each valid file will be a commit, up to available count."
    $TotalCommits = $count
}

# 2. Distribute files
# We need to distribute $count files into $TotalCommits groups
# Implementation: simple round-robin or chunking
$groups = @()
for ($i = 0; $i -lt $TotalCommits; $i++) {
    $groups += ,@() # Array of arrays
}

for ($i = 0; $i -lt $count; $i++) {
    $groupIndex = $i % $TotalCommits
    # Only if we want to limit to exactly 90 changes (files), we stop
    if ($i -ge $TargetChanges) { break }
    $groups[$groupIndex] += $fileList[$i]
}

# 3. Commit Loop
Write-Host "Starting commits..."

for ($i = 0; $i -lt $TotalCommits; $i++) {
    $filesToCommit = $groups[$i]
    if ($null -eq $filesToCommit -or $filesToCommit.Count -eq 0) {
        continue
    }

    # Determine Date
    if ($i -lt $CommitsDay1) {
        # Day 1
        $commitDate = $Date1.AddMinutes($i * 5)
    } else {
        # Day 2
        $offset = $i - $CommitsDay1
        $commitDate = $Date2.AddMinutes($offset * 5)
    }
    
    $dateStr = $commitDate.ToString("yyyy-MM-dd HH:mm:ss")
    
    # Git Add
    foreach ($file in $filesToCommit) {
        git add $file
    }
    
    # Git Commit
    $msg = "Update $($filesToCommit[0])"
    if ($filesToCommit.Count -gt 1) {
        $msg += " and $($filesToCommit.Count - 1) other files"
    }
    
    $env:GIT_COMMITTER_DATE = "$dateStr"
    git commit -m "$msg" --date "$dateStr" | Out-Null
    
    Write-Host "[$($i+1)/$TotalCommits] Committed on $dateStr : $msg"
}

Write-Host "Done."
