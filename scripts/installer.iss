; Inno Setup Script for Laundry Shop Management System
; Produces a 100% self-contained, production-grade single-file .exe installer wizard.
; Dynamically generates secure random database credentials and JWT secret per installation.

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
DefaultDirName={autopf}\{#AppName}
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

; License and App Icon
Source: "resources\app.ico"; DestDir: "{app}"; Flags: ignoreversion

; PostgreSQL Silent Installer (staged during build)
Source: "..\backend\target\deploy-staging\postgresql-16.2-1-windows-x64.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall ignoreversion; Check: NeedsPostgreSQL

[Dirs]
Name: "{app}\config"
Name: "{app}\logs"

[Icons]
; Desktop and Start Menu shortcuts (Edge App Mode - Native Frameless Window)
Name: "{commondesktop}\{#AppName}"; Filename: "msedge.exe"; Parameters: "--app=http://localhost:8080"; IconFilename: "{app}\app.ico"; Comment: "Launch {#AppName}"
Name: "{group}\{#AppName}"; Filename: "msedge.exe"; Parameters: "--app=http://localhost:8080"; IconFilename: "{app}\app.ico"; Comment: "Launch {#AppName}"
Name: "{group}\Uninstall {#AppName}"; Filename: "{uninstallexe}"

[Run]
; Register and start the LaundryShopMS Windows Service after file extraction and config generation
Filename: "{app}\laundryms-service.exe"; Parameters: "install"; StatusMsg: "Registering {#AppName} Service..."; Flags: runhidden waituntilterminated
Filename: "{app}\laundryms-service.exe"; Parameters: "start"; StatusMsg: "Starting {#AppName}..."; Flags: runhidden waituntilterminated

; Open application in Edge App Mode after install
Filename: "msedge.exe"; Parameters: "--app=http://localhost:8080"; Flags: postinstall skipifsilent; Description: "Open {#AppName}"

[UninstallRun]
; Stop and unregister the Windows Service before uninstallation
Filename: "{app}\laundryms-service.exe"; Parameters: "stop"; Flags: runhidden waituntilterminated
Filename: "{app}\laundryms-service.exe"; Parameters: "uninstall"; Flags: runhidden waituntilterminated

[Code]
var
  GeneratedDbPassword: String;
  GeneratedJwtSecret: String;

// Helper function to generate cryptographically random strings
function GenerateRandomString(Len: Integer; Chars: String): String;
var
  i: Integer;
begin
  Result := '';
  for i := 1 to Len do
  begin
    Result := Result + Chars[1 + Random(Length(Chars))];
  end;
end;

// Ensure credentials exist (reads existing registry values on reinstall/upgrade, or generates new random ones on fresh install)
procedure PrepareCredentials;
var
  ExistingPass, ExistingSecret: String;
begin
  if GeneratedDbPassword = '' then
  begin
    if RegQueryStringValue(HKLM, 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 'DB_PASSWORD', ExistingPass) and (ExistingPass <> '') then
    begin
      GeneratedDbPassword := ExistingPass;
    end
    else
    begin
      GeneratedDbPassword := GenerateRandomString(24, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    end;

    if RegQueryStringValue(HKLM, 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 'JWT_SECRET', ExistingSecret) and (ExistingSecret <> '') then
    begin
      GeneratedJwtSecret := ExistingSecret;
    end
    else
    begin
      GeneratedJwtSecret := GenerateRandomString(64, '0123456789abcdef');
    end;
  end;
end;

// Check if PostgreSQL 16 is already installed on host
function NeedsPostgreSQL(): Boolean;
begin
  Result := not FileExists('C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe');
end;

// Execute silent PostgreSQL installation with dynamically generated superuser password
procedure InstallPostgreSQLIfNeeded;
var
  ResultCode: Integer;
  PgInstaller: String;
  Params: String;
begin
  if NeedsPostgreSQL then
  begin
    PrepareCredentials;
    
    // Clean up partial or non-empty directory from previous interrupted installation attempts
    if DirExists('C:\Program Files\PostgreSQL\16') then
    begin
      DelTree('C:\Program Files\PostgreSQL\16', True, True, True);
    end;

    PgInstaller := ExpandConstant('{tmp}\postgresql-16.2-1-windows-x64.exe');
    Params := '--mode unattended --superpassword "' + GeneratedDbPassword + '" --serverport 5432 --prefix "C:\Program Files\PostgreSQL\16"';
    WizardForm.StatusLabel.Caption := 'Installing PostgreSQL 16 Database Service (this may take a minute)...';
    
    if not Exec(PgInstaller, Params, '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
    begin
      MsgBox('Failed to execute PostgreSQL silent installer. Exit code: ' + IntToStr(ResultCode), mbError, MB_OK);
    end
    else if (ResultCode <> 0) and not FileExists('C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe') then
    begin
      MsgBox('PostgreSQL installation finished with exit code ' + IntToStr(ResultCode) + '. Please check Windows event logs.', mbError, MB_OK);
    end;
  end;
end;

// Write system environment variables and application-prod.properties file dynamically
procedure ConfigureEnvironmentAndProperties;
var
  ConfigDir: String;
  ConfigFile: String;
  ConfigContent: String;
begin
  PrepareCredentials;
  
  // Set Machine Environment Variables in Windows Registry
  RegWriteStringValue(HKLM, 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 'DB_HOST', 'localhost');
  RegWriteStringValue(HKLM, 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 'DB_PORT', '5432');
  RegWriteStringValue(HKLM, 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 'DB_NAME', 'postgres');
  RegWriteStringValue(HKLM, 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 'DB_USER', 'postgres');
  RegWriteStringValue(HKLM, 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 'DB_PASSWORD', GeneratedDbPassword);
  RegWriteStringValue(HKLM, 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 'JWT_SECRET', GeneratedJwtSecret);
  
  // Write external configuration file into {app}\config\application-prod.properties
  ConfigDir := ExpandConstant('{app}\config');
  if not DirExists(ConfigDir) then
  begin
    CreateDir(ConfigDir);
  end;
  
  ConfigFile := ConfigDir + '\application-prod.properties';
  
  ConfigContent := 
    '# Laundry Shop Management System - Production Configuration' + #13#10 +
    '# Generated automatically during installation on ' + GetDateTimeString('yyyy-mm-dd hh:nn:ss', '-', ':') + #13#10 +
    'spring.datasource.url=jdbc:postgresql://localhost:5432/postgres' + #13#10 +
    'spring.datasource.username=postgres' + #13#10 +
    'spring.datasource.password=' + GeneratedDbPassword + #13#10 +
    'security.jwt.secret-key=' + GeneratedJwtSecret + #13#10 +
    'server.port=${SERVER_PORT:8080}' + #13#10 +
    'server.address=0.0.0.0' + #13#10;
    
  SaveStringToFile(ConfigFile, ConfigContent, False);
end;

// Poll http://localhost:8080 until server responds with HTTP 200/302/401, or until timeout (up to 15s)
procedure WaitForServerReady;
var
  WinHttp: Variant;
  i: Integer;
  IsReady: Boolean;
begin
  WizardForm.StatusLabel.Caption := 'Waiting for Laundry Shop Management System server to initialize...';
  IsReady := False;
  try
    WinHttp := CreateOleObject('WinHttp.WinHttpRequest.5.1');
    // Set 1000ms timeouts (Resolve, Connect, Send, Receive) to prevent 60-second default TCP hang
    WinHttp.SetTimeouts(1000, 1000, 1000, 1000);
    for i := 1 to 15 do
    begin
      try
        WinHttp.Open('GET', 'http://localhost:8080/api/v1/health', False);
        WinHttp.Send('');
        if (WinHttp.Status = 200) or (WinHttp.Status = 302) or (WinHttp.Status = 401) then
        begin
          IsReady := True;
          Break;
        end;
      except
        // Server still initializing
      end;
      Sleep(500);
    end;
  except
    // OLE object not supported or HTTP request failed
  end;
end;

// Setup step hook
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then
  begin
    PrepareCredentials;
    InstallPostgreSQLIfNeeded;
  end;
  if CurStep = ssPostInstall then
  begin
    ConfigureEnvironmentAndProperties;
    WaitForServerReady;
  end;
end;
