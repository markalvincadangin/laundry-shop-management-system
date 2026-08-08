[CmdletBinding()]
param(
    [string]$ExpectedVersion,
    [switch]$SkipRemoteTunnelCheck
)
$ErrorActionPreference = 'Stop'
$failures = [System.Collections.Generic.List[string]]::new()
function Check([bool]$Condition, [string]$Message) {
    if ($Condition) { Write-Host "PASS  $Message" -ForegroundColor Green }
    else { Write-Host "FAIL  $Message" -ForegroundColor Red; $failures.Add($Message) }
}

function Invoke-NativeCapture {
    param(
        [Parameter(Mandatory=$true)][string]$FilePath,
        [string[]]$ArgumentList = @()
    )

    $stdoutFile = [System.IO.Path]::GetTempFileName()
    $stderrFile = [System.IO.Path]::GetTempFileName()
    try {
        $process = Start-Process -FilePath $FilePath `
            -ArgumentList $ArgumentList `
            -NoNewWindow -Wait -PassThru `
            -RedirectStandardOutput $stdoutFile `
            -RedirectStandardError $stderrFile

        $lines = @()
        if (Test-Path $stdoutFile) { $lines += @(Get-Content $stdoutFile -ErrorAction SilentlyContinue) }
        if (Test-Path $stderrFile) { $lines += @(Get-Content $stderrFile -ErrorAction SilentlyContinue) }

        [pscustomobject]@{
            ExitCode = $process.ExitCode
            Output   = ($lines -join [Environment]::NewLine)
        }
    } finally {
        Remove-Item $stdoutFile,$stderrFile -Force -ErrorAction SilentlyContinue
    }
}

$regPath = 'HKLM:\Software\Himotech\LaundryShopMS'
$configPath = 'C:\ProgramData\LaundryShopMS\config\application-prod.properties'
$tunnelConfig = 'C:\ProgramData\LaundryShopMS\tunnel\ngrok.yml'
$appPath = 'C:\Program Files\Laundry Shop Management System'
$java = Join-Path $appPath 'runtime\bin\java.exe'
$ngrok = Join-Path $appPath 'tunnel\ngrok.exe'
$pgCache = 'C:\ProgramData\LaundryShopMS\cache\postgresql-16.14-1-windows-x64.exe'
$pgExpectedSha256 = 'D389834DF279A9B7CE4B4A030B6545FD0BEFB05385FF66932AC37454AD9B9312'
$ngrokCache = 'C:\ProgramData\LaundryShopMS\cache\ngrok-v3-3.39.9-windows-amd64.zip'
$ngrokExpectedSha256 = '12F99DC3B2145AB1503602434E00FD38199A5545DC051DD86BA526C11AB97DB1'
$pgDebugTrace = 'C:\ProgramData\LaundryShopMS\logs\postgresql-installer-debug.log'
$managedPostgres = $false
$dbPort = 0
$tunnelEnabled = $false
$tunnelPublicUrl = $null

Check (Test-Path $regPath) 'Installer registry metadata exists'
if (Test-Path $regPath) {
    $reg = Get-ItemProperty $regPath
    if ($ExpectedVersion) { Check ($reg.InstalledVersion -eq $ExpectedVersion) "InstalledVersion is $ExpectedVersion" }
    Check ([int]$reg.DbPort -gt 0) 'DbPort metadata is valid'
    Check ($reg.ManagedPostgres -in @('true','false')) 'ManagedPostgres metadata is valid'
    Check ($reg.TunnelEnabled -in @('true','false')) 'TunnelEnabled metadata is valid'
    $managedPostgres = ($reg.ManagedPostgres -eq 'true')
    $dbPort = [int]$reg.DbPort
    $tunnelEnabled = ($reg.TunnelEnabled -eq 'true')
    $tunnelPublicUrl = $reg.TunnelPublicUrl
    $secretNames = @($reg.PSObject.Properties.Name | Where-Object { $_ -match '(password|secret|jwt|authtoken)' })
    Check ($secretNames.Count -eq 0) 'Registry contains no secret/password/authtoken values'
}

if ($managedPostgres) {
    Check (Test-Path $pgCache) 'Verified PostgreSQL prerequisite cache is retained for retry/recovery'
    if (Test-Path $pgCache) {
        $cacheHash = (Get-FileHash $pgCache -Algorithm SHA256).Hash
        Check ($cacheHash -eq $pgExpectedSha256) 'Cached PostgreSQL prerequisite SHA-256 is valid'
    }

    $pgSvc = Get-Service -Name 'postgresql-laundryms-16' -ErrorAction SilentlyContinue
    Check ($null -ne $pgSvc) 'Managed PostgreSQL service is registered with dedicated service name'
    if ($pgSvc) { Check ($pgSvc.Status -eq 'Running') 'Managed PostgreSQL service is running' }

    if ($dbPort -gt 0) {
        $listeners = @(Get-NetTCPConnection -State Listen -LocalPort $dbPort -ErrorAction SilentlyContinue)
        Check ($listeners.Count -gt 0) "Managed PostgreSQL is listening on configured port $dbPort"
    }

    Check (-not (Test-Path $pgDebugTrace)) 'Successful managed PostgreSQL install did not retain the sensitive EDB debug trace'
}

Check (Test-Path $configPath) 'Protected production configuration exists'
Check (Test-Path $java) 'Bundled Java runtime exists'
if (Test-Path $java) {
    $javaResult = Invoke-NativeCapture -FilePath $java -ArgumentList @('-version')
    if ($javaResult.Output) { Write-Host $javaResult.Output }
    Check ($javaResult.ExitCode -eq 0) 'Bundled Java runtime executes successfully'
}

$svc = Get-Service -Name 'LaundryShopMS' -ErrorAction SilentlyContinue
Check ($null -ne $svc) 'LaundryShopMS Windows service is registered'
if ($svc) { Check ($svc.Status -eq 'Running') 'LaundryShopMS Windows service is running' }

try {
    $r = Invoke-WebRequest 'http://127.0.0.1:8765/api/v1/health' -UseBasicParsing -TimeoutSec 5
    Check ($r.StatusCode -eq 200) 'Application health endpoint returns HTTP 200'
} catch {
    Check $false "Application health endpoint is reachable: $($_.Exception.Message)"
}

if (Test-Path $configPath) {
    $props = @{}
    Get-Content $configPath | Where-Object { $_ -and -not $_.StartsWith('#') -and $_.Contains('=') } | ForEach-Object {
        $i = $_.IndexOf('='); $props[$_.Substring(0,$i).Trim()] = $_.Substring($i+1).Trim()
    }
    Check ($props['spring.datasource.username'] -eq 'laundryms_app') 'Runtime database role is laundryms_app'
    Check (-not $props.ContainsKey('app.security.allowed-origin') -or $props['app.security.allowed-origin'] -ne 'http://localhost:3000') 'Development localhost:3000 CORS value is absent'
    Check (-not ((Get-Content $configPath -Raw) -match '(?i)ngrok|authtoken')) 'Application production config contains no Ngrok authtoken/configuration'

    $acl = Get-Acl $configPath
    $unexpected = @($acl.Access | Where-Object {
        $id = $_.IdentityReference.Value
        $id -notmatch 'SYSTEM$' -and $id -notmatch 'Administrators$'
    })
    Check ($unexpected.Count -eq 0) 'Production config ACL exposes no non-admin/non-SYSTEM principals'
}

if ($tunnelEnabled) {
    Check (Test-Path $tunnelConfig) 'Protected Ngrok v3 configuration exists'
    Check (Test-Path $ngrok) 'Ngrok tunnel agent exists'
    Check (Test-Path $ngrokCache) 'Verified Ngrok archive cache exists'
    if (Test-Path $ngrokCache) {
        Check ((Get-FileHash $ngrokCache -Algorithm SHA256).Hash -eq $ngrokExpectedSha256) 'Cached Ngrok archive SHA-256 is valid'
    }
    if (Test-Path $ngrok) {
        $sig = Get-AuthenticodeSignature $ngrok
        Check ($sig.Status -eq 'Valid' -and $sig.SignerCertificate.Subject -match 'ngrok') 'Ngrok executable has a valid ngrok Authenticode publisher signature'
        $ngrokVersion = Invoke-NativeCapture -FilePath $ngrok -ArgumentList @('version')
        $versionOutput = $ngrokVersion.Output
        Check ($ngrokVersion.ExitCode -eq 0 -and $versionOutput -match '3\.39\.9') 'Ngrok agent version is pinned to 3.39.9'
    }

    $tunnelSvc = Get-Service -Name 'LaundryShopMSTunnel' -ErrorAction SilentlyContinue
    Check ($null -ne $tunnelSvc) 'LaundryShopMSTunnel Windows service is registered'
    if ($tunnelSvc) { Check ($tunnelSvc.Status -eq 'Running') 'LaundryShopMSTunnel Windows service is running' }

    Check ($tunnelPublicUrl -and $tunnelPublicUrl -match '^https://[^/]+$') 'TunnelPublicUrl registry metadata is a bare HTTPS origin'

    if (Test-Path $tunnelConfig) {
        $text = Get-Content $tunnelConfig -Raw
        Check ($text -match 'version:\s*"3"') 'Ngrok configuration uses v3 format'
        Check ($text -match 'http://127\.0\.0\.1:8765') 'Ngrok upstream is restricted to localhost LaundryMS service'
        Check ($text -match '(?m)^\s*authtoken:\s*.+$') 'Ngrok configuration contains an authtoken'
        $acl = Get-Acl $tunnelConfig
        $unexpected = @($acl.Access | Where-Object {
            $id = $_.IdentityReference.Value
            $id -notmatch 'SYSTEM$' -and $id -notmatch 'Administrators$'
        })
        Check ($unexpected.Count -eq 0) 'Ngrok config ACL exposes no non-admin/non-SYSTEM principals'
    }

    if (-not $SkipRemoteTunnelCheck -and $tunnelPublicUrl) {
        try {
            $remote = Invoke-WebRequest ($tunnelPublicUrl.TrimEnd('/') + '/api/v1/health') -UseBasicParsing -TimeoutSec 10
            Check ($remote.StatusCode -eq 200) 'Ngrok public endpoint reaches LaundryMS health endpoint'
        } catch {
            Check $false "Ngrok public endpoint health check succeeds: $($_.Exception.Message)"
        }
    }
}

if ($failures.Count) {
    Write-Host "`n$($failures.Count) smoke-test failure(s)." -ForegroundColor Red
    exit 1
}
Write-Host "`nAll installer smoke checks passed." -ForegroundColor Green
