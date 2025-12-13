$files = git status -u --porcelain | ForEach-Object { 
    $line = $_.Trim()
    # Handle the status code prefix (usually 2 chars + space = 3 chars, but Trim removes leading space if any)
    # Porcelain format: XY Path
    # If X or Y is ?, it's ??
    # We want the path part.
    # Split by space and take the rest? No, filenames can have spaces.
    # Pattern: ^(..)\s+(.*)$
    if ($line -match "^(..)\s+(.*)$") {
        $Matches[2].Trim('"') # Remove quotes if present
    }
}

$totalFiles = $files.Count
$targetCommits = 35 + 45 + 35 + 50 # 165
$actualCommits = $targetCommits

Write-Host "Total Files to commit: $totalFiles"
Write-Host "Target Commits: $targetCommits"

if ($totalFiles -eq 0) {
    Write-Host "No files changed. Exiting."
    Exit
}

# Determine file distribution
# We want to use all files across $targetCommits.
# Some commits will have (Total / Target) rounded up, some rounded down.
# Or simpler:
# Commits with 2 files = Files - Commits (if simple case of 1 or 2)
# If Files < Commits, we can't make target commits unless empty commits?
# Assuming Files >= Commits based on user prompt (252 > 165).
$commitsWithMore = $totalFiles - $targetCommits
if ($commitsWithMore -lt 0) { $commitsWithMore = 0 } # Should not happen

$batches = @()
$fileIndex = 0

for ($i = 0; $i -lt $targetCommits; $i++) {
    if ($fileIndex -ge $totalFiles) { 
        # Run out of files, stop or create empty? 
        # User requested specific number of commits, but if we ran out of files, we stop.
        break 
    }
    
    $count = 1
    if ($i -lt $commitsWithMore) {
        $count = 2
    }
    
    # Take files
    $batch = @()
    for ($j = 0; $j -lt $count; $j++) {
        if ($fileIndex -lt $totalFiles) {
            $batch += $files[$fileIndex]
            $fileIndex++
        }
    }
    $batches += ,$batch
}

Write-Host "Created $($batches.Count) batches."

# Define Days
$days = @(
    @{ date = "2025-12-13T09:00:00"; count = 35 },
    @{ date = "2025-12-14T09:00:00"; count = 45 },
    @{ date = "2025-12-15T09:00:00"; count = 35 },
    @{ date = "2025-12-16T09:00:00"; count = 50 }
)

$batchIndex = 0

foreach ($day in $days) {
    $baseDate = Get-Date $day.date
    $count = $day.count
    
    Write-Host "Processing $($day.date) - Planned Commits: $count"
    
    for ($i = 0; $i -lt $count; $i++) {
        if ($batchIndex -ge $batches.Count) { 
             Write-Host "  No more files to commit."
             break 
        }
        
        $filesToCommit = $batches[$batchIndex]
        $batchIndex++
        
        # Add files
        foreach ($f in $filesToCommit) {
            # Use dot for relative path if needed, but simple string usually works
            git add "$f"
        }
        
        # Calculate time with offset
        $minutes = $i * 15 # Spread out over the day
        $commitDate = $baseDate.AddMinutes($minutes).ToString("yyyy-MM-dd HH:mm:ss")
        
        # Message
        $msg = "Update " + ($filesToCommit[0] -replace ".*[\\/]", "") # just filename
        if ($filesToCommit.Count -gt 1) { $msg += " and related files" }
        
        # Commit with date
        $env:GIT_AUTHOR_DATE = "$commitDate"
        $env:GIT_COMMITTER_DATE = "$commitDate"
        
        # Suppress output for clean log
        git commit -m "$msg" --date "$commitDate" | Out-Null
        
        Write-Host "  [$($batchIndex)/$($batches.Count)] Committed on $commitDate : $msg"
    }
}
