param(
  [Parameter(Mandatory = $true)][string]$Cwd,
  [Parameter(Mandatory = $true)][string]$EnvFile,
  [string[]]$Skip = @()
)

Get-Content $EnvFile | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith('#')) { return }
  $idx = $line.IndexOf('=')
  if ($idx -lt 1) { return }
  $name = $line.Substring(0, $idx).Trim()
  $value = $line.Substring($idx + 1).Trim()
  if ($Skip -contains $name) { return }
  if ($name -in @('NEXT_PUBLIC_STUDENT_PORTAL_URL', 'NEXT_PUBLIC_ADMIN_PORTAL_URL')) { return }
  Write-Host "Adding $name to $Cwd"
  foreach ($envName in @('production', 'preview', 'development')) {
    $value | vercel env add $name $envName --cwd $Cwd --force 2>&1 | Out-Host
  }
}

# Placeholder portal URLs; updated after first deploy
$studentUrl = "https://scalexlms-student.vercel.app"
$adminUrl = "https://scalexlms-admin.vercel.app"
Write-Host "Adding NEXT_PUBLIC_STUDENT_PORTAL_URL"
foreach ($envName in @('production', 'preview', 'development')) {
  $studentUrl | vercel env add NEXT_PUBLIC_STUDENT_PORTAL_URL $envName --cwd $Cwd --force 2>&1 | Out-Host
}
Write-Host "Adding NEXT_PUBLIC_ADMIN_PORTAL_URL"
foreach ($envName in @('production', 'preview', 'development')) {
  $adminUrl | vercel env add NEXT_PUBLIC_ADMIN_PORTAL_URL $envName --cwd $Cwd --force 2>&1 | Out-Host
}
