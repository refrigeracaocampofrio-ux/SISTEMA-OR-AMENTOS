#!/usr/bin/env pwsh
param([string]$Name, [string]$Value)

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = 'cmd.exe'
$psi.Arguments = "/c npx vercel env add $Name production"
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false

$proc = [System.Diagnostics.Process]::Start($psi)
$proc.StandardInput.WriteLine('yes')
$proc.StandardInput.WriteLine($Value)
$proc.StandardInput.Close()

$stdout = $proc.StandardOutput.ReadToEnd()
$stderr = $proc.StandardError.ReadToEnd()
$proc.WaitForExit()

Write-Host $stdout
if ($proc.ExitCode -ne 0) {
    Write-Error $stderr
    exit $proc.ExitCode
}
