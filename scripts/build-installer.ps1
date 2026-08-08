[CmdletBinding()]
param(
    [Parameter()][ValidatePattern('^[0-9]+\.[0-9]+\.[0-9]+([.-][A-Za-z0-9.-]+)?$')]
    [string]$Version = '1.0.0',
    [string]$InnoSetupCompiler,
    [switch]$Sign,
    [string]$CertificateThumbprint,
    [string]$TimestampUrl = 'http://timestamp.digicert.com'
)
$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$Staging = Join-Path $ProjectRoot 'backend\target\deploy-staging'
$Iss = Join-Path $ScriptDir 'installer.iss'

$required = @(
    (Join-Path $Staging 'laundryms.jar'),
    (Join-Path $Staging 'laundryms-service.exe'),
    (Join-Path $Staging 'runtime\bin\java.exe'),
    (Join-Path $Staging 'deployment-manifest.txt'),
    (Join-Path $ScriptDir 'resources\laundryms-service.xml'),
    (Join-Path $ScriptDir 'resources\laundryms-tunnel-service.xml'),
    (Join-Path $ScriptDir 'resources\app.ico'),
    (Join-Path $ScriptDir 'resources\LICENSE.txt'),
    $Iss
)
foreach ($path in $required) {
    if (-not (Test-Path $path)) { throw "Required installer input missing: $path" }
}

$manifestPath = Join-Path $Staging 'deployment-manifest.txt'
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-StringData
if ($manifest.ApplicationVersion -ne $Version) {
    throw "Deployment manifest version '$($manifest.ApplicationVersion)' does not match requested installer version '$Version'."
}
function Assert-Sha256([string]$Path, [string]$Expected, [string]$Label) {
    if (-not $Expected) { throw "Deployment manifest is missing SHA-256 for $Label." }
    $actual = (Get-FileHash $Path -Algorithm SHA256).Hash
    if ($actual -ne $Expected.ToUpperInvariant()) {
        throw "$Label SHA-256 mismatch. Expected $Expected, got $actual. Re-run build-deployment.sh."
    }
}
Assert-Sha256 (Join-Path $Staging 'laundryms.jar') $manifest.ApplicationJarSHA256 'Application JAR'
Assert-Sha256 (Join-Path $Staging 'laundryms-service.exe') $manifest.WinSWSHA256 'WinSW executable'
Assert-Sha256 (Join-Path $Staging 'runtime\bin\java.exe') $manifest.JavaExeSHA256 'Bundled Java executable'

& (Join-Path $Staging 'runtime\bin\java.exe') -version
if ($LASTEXITCODE -ne 0) { throw 'Bundled Java runtime validation failed.' }

if (-not $InnoSetupCompiler) {
    $candidates = @(
        "${env:ProgramFiles(x86)}\Inno Setup 7\ISCC.exe",
        "$env:ProgramFiles\Inno Setup 7\ISCC.exe",
        "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
        "$env:ProgramFiles\Inno Setup 6\ISCC.exe"
    )
    $InnoSetupCompiler = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}
if (-not $InnoSetupCompiler -or -not (Test-Path $InnoSetupCompiler)) {
    throw 'Inno Setup compiler not found. Install Inno Setup 7/6 or pass -InnoSetupCompiler.'
}

Write-Host "Compiling Laundry Shop MS installer v$Version..."
& $InnoSetupCompiler "/DAppVersion=$Version" $Iss
if ($LASTEXITCODE -ne 0) { throw "ISCC failed with exit code $LASTEXITCODE" }

$SetupExe = Join-Path $ProjectRoot "backend\target\LaundryShopMS-Setup-$Version.exe"
if (-not (Test-Path $SetupExe)) { throw "Expected setup executable was not produced: $SetupExe" }

if ($Sign) {
    if (-not $CertificateThumbprint) { throw '-Sign requires -CertificateThumbprint.' }
    $signtool = Get-ChildItem "${env:ProgramFiles(x86)}\Windows Kits\10\bin" -Filter signtool.exe -Recurse -ErrorAction SilentlyContinue |
        Sort-Object FullName -Descending | Select-Object -First 1 -ExpandProperty FullName
    if (-not $signtool) { throw 'signtool.exe was not found in the Windows SDK.' }
    & $signtool sign /sha1 $CertificateThumbprint /fd SHA256 /tr $TimestampUrl /td SHA256 $SetupExe
    if ($LASTEXITCODE -ne 0) { throw 'Authenticode signing failed.' }
    $sig = Get-AuthenticodeSignature $SetupExe
    if ($sig.Status -ne 'Valid') { throw "Authenticode signature validation failed: $($sig.Status)" }
}

$hash = (Get-FileHash $SetupExe -Algorithm SHA256).Hash
Write-Host "Installer ready: $SetupExe"
Write-Host "SHA256: $hash"
