; Inno Setup Script for Laundry Shop Management System
; Produces a 100% self-contained single-file .exe installer with wizard UI
; Bundles: Spring Boot JAR, WinSW Service Wrapper, PostgreSQL 16 silent installer, App Icon

#define AppName "Laundry Shop Management System"
#define AppVersion "1.0.0"
#define AppPublisher "Himotech"
#define AppURL "http://localhost:8080"
#define ServiceName "LaundryShopMS"

[Setup]
AppId={{4D9F8E21-0A56-4C7B-9E32-8F1D5E6A7B8C}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
AppSupportURL={#AppURL}
DefaultDirName=C:\{#ServiceName}
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
OutputDir=..\backend\target
OutputBaseFilename=LaundryShopMS-Setup-{#AppVersion}
SetupIconFile=resources\app.ico
UninstallDisplayIcon={app}\app.ico
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
LicenseFile=resources\LICENSE.txt
ChangesEnvironment=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
; Application JAR
Source: "..\backend\target\deploy-staging\laundryms.jar"; DestDir: "{app}"; Flags: ignoreversion

; WinSW Service Wrapper
Source: "..\backend\target\deploy-staging\laundryms-service.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "resources\laundryms-service.xml"; DestDir: "{app}"; Flags: ignoreversion

; Launcher, License, and Icon
Source: "resources\start.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "resources\app.ico"; DestDir: "{app}"; Flags: ignoreversion

; PostgreSQL Silent Installer (staged during build)
Source: "..\backend\target\deploy-staging\postgresql-16.2-1-windows-x64.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall ignoreversion; Check: NeedsPostgreSQL

[Dirs]
Name: "{app}\logs"

[Icons]
; Desktop shortcut
Name: "{commondesktop}\{#AppName}"; Filename: "{#AppURL}"; IconFilename: "{app}\app.ico"; Comment: "Open {#AppName}"

; Start Menu shortcuts
Name: "{group}\{#AppName}"; Filename: "{#AppURL}"; IconFilename: "{app}\app.ico"; Comment: "Open {#AppName}"
Name: "{group}\Start Server (Console)"; Filename: "{app}\start.bat"; IconFilename: "{app}\app.ico"; Comment: "Start {#AppName} with console output"
Name: "{group}\Uninstall {#AppName}"; Filename: "{uninstallexe}"

[Run]
; Install PostgreSQL silently if needed
Filename: "{tmp}\postgresql-16.2-1-windows-x64.exe"; Parameters: "--mode unattended --superpassword ""laundry_secure_pass_2026"" --serverport 5432 --prefix ""C:\Program Files\PostgreSQL\16"" --datadir ""C:\Program Files\PostgreSQL\16\data"""; StatusMsg: "Installing PostgreSQL 16 Database Service..."; Flags: runhidden waituntilterminated; Check: NeedsPostgreSQL

; Register and start the LaundryShopMS Windows Service
Filename: "{app}\laundryms-service.exe"; Parameters: "install"; StatusMsg: "Registering {#AppName} Service..."; Flags: runhidden waituntilterminated
Filename: "{app}\laundryms-service.exe"; Parameters: "start"; StatusMsg: "Starting {#AppName}..."; Flags: runhidden waituntilterminated

; Open browser after install
Filename: "{#AppURL}"; Flags: shellexec postinstall skipifsilent; Description: "Open {#AppName} in browser"

[UninstallRun]
; Stop and unregister the Windows Service before uninstallation
Filename: "{app}\laundryms-service.exe"; Parameters: "stop"; Flags: runhidden waituntilterminated
Filename: "{app}\laundryms-service.exe"; Parameters: "uninstall"; Flags: runhidden waituntilterminated

[Registry]
; Set Machine Environment Variables
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; ValueType: string; ValueName: "DB_HOST"; ValueData: "localhost"; Flags: preservestringtype
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; ValueType: string; ValueName: "DB_PORT"; ValueData: "5432"; Flags: preservestringtype
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; ValueType: string; ValueName: "DB_NAME"; ValueData: "postgres"; Flags: preservestringtype
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; ValueType: string; ValueName: "DB_USER"; ValueData: "postgres"; Flags: preservestringtype
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; ValueType: string; ValueName: "DB_PASSWORD"; ValueData: "laundry_secure_pass_2026"; Flags: preservestringtype
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; ValueType: string; ValueName: "JWT_SECRET"; ValueData: "4a9f8e210a564c7b9e328f1d5e6a7b8c4a9f8e210a564c7b9e328f1d5e6a7b8c"; Flags: preservestringtype

[Code]
// Helper to check if PostgreSQL 16 is already installed
function NeedsPostgreSQL(): Boolean;
begin
  Result := not FileExists('C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe');
end;
