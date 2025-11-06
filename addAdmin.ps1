# PowerShell script to add admin user to database

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force

# Navigate to backend directory
Set-Location -Path "backend"

# Run the Node.js script to add admin
Write-Host "Adding admin user to database..."
node scripts/addAdmin.js

# Check if the command was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Admin user added successfully!"
} else {
    Write-Host "Failed to add admin user."
}

# Pause to see the output
Read-Host -Prompt "Press Enter to exit"
