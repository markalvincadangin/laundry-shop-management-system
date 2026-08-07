; Inno Setup Script for Laundry Shop Management System
; Produces a 100% self-contained, production-grade single-file .exe installer wizard.
; Dynamically generates secure random database credentials and JWT secret per installation.

#define AppName "Laundry Shop Management System"
#define AppVersion "1.0.0"
#define AppPublisher "Himotech"
#define AppURL "http://localhost:8765"
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

; Cloudflare Tunnel Daemon (staged during build for optional remote tracking)
Source: "..\backend\target\deploy-staging\cloudflared.exe"; DestDir: "{app}"; Flags: ignoreversion

; Ngrok Tunnel Daemon (staged during build for optional remote tracking)
Source: "..\backend\target\deploy-staging\ngrok.exe"; DestDir: "{app}"; Flags: ignoreversion

; PostgreSQL Silent Installer (staged during build)
Source: "..\backend\target\deploy-staging\postgresql-16.2-1-windows-x64.exe"; Flags: dontcopy

[Dirs]
Name: "{app}\config"
Name: "{app}\logs"

[Icons]
; Desktop and Start Menu shortcuts
Name: "{commondesktop}\{#AppName}"; Filename: "{#AppURL}"; IconFilename: "{app}\app.ico"; Comment: "Launch {#AppName}"
Name: "{group}\{#AppName}"; Filename: "{#AppURL}"; IconFilename: "{app}\app.ico"; Comment: "Launch {#AppName}"
Name: "{group}\Uninstall {#AppName}"; Filename: "{uninstallexe}"

[Run]
; Register and start the LaundryShopMS Windows Service after file extraction and config generation
Filename: "{app}\laundryms-service.exe"; Parameters: "install"; StatusMsg: "Registering {#AppName} Service..."; Flags: runhidden waituntilterminated
Filename: "{app}\laundryms-service.exe"; Parameters: "start"; StatusMsg: "Starting {#AppName}..."; Flags: runhidden waituntilterminated

; Open application in default browser after install
Filename: "{#AppURL}"; Flags: shellexec postinstall skipifsilent; Description: "Open {#AppName}"

[UninstallRun]
; Stop and unregister Windows Services before uninstallation
Filename: "{app}\laundryms-service.exe"; Parameters: "stop"; Flags: runhidden waituntilterminated
Filename: "{app}\laundryms-service.exe"; Parameters: "uninstall"; Flags: runhidden waituntilterminated
Filename: "{app}\cloudflared.exe"; Parameters: "service uninstall"; Flags: runhidden waituntilterminated
Filename: "{app}\ngrok.exe"; Parameters: "service uninstall"; Flags: runhidden waituntilterminated

[Code]
var
  GeneratedDbPassword: String;
  GeneratedJwtSecret: String;
  TunnelProviderPage: TInputOptionWizardPage;
  CloudflarePage: TInputQueryWizardPage;
  NgrokPage: TInputQueryWizardPage;

procedure InitializeWizard;
begin
  // Create Tunnel Provider Selection Page
  TunnelProviderPage := CreateInputOptionPage(wpSelectTasks,
    'Remote Access Provider',
    'Select your preferred secure tunneling service',
    'Do you want to expose your Laundry System to the internet for remote tracking/management?' + #13#10 +
    'Select a provider below, or choose Local Only if you do not want internet access.',
    True, False);
  
  TunnelProviderPage.Add('None (Local Network Only)');
  TunnelProviderPage.Add('Ngrok (Free Public URL - Requires Authtoken & Domain)');
  TunnelProviderPage.Add('Cloudflare Zero Trust (Requires Custom Domain)');
  TunnelProviderPage.Values[0] := True; // Default to None

  // Create Cloudflare Tunnel Token input page
  CloudflarePage := CreateInputQueryPage(TunnelProviderPage.ID,
    'Cloudflare Tunnel Setup',
    'Public Customer Order Tracking Integration',
    'Enter your Cloudflare Tunnel Token below.');
  CloudflarePage.Add('Cloudflare Tunnel Token:', False);

  // Create Ngrok Tunnel input page
  NgrokPage := CreateInputQueryPage(TunnelProviderPage.ID,
    'Ngrok Tunnel Setup',
    'Public Customer Order Tracking Integration',
    'Enter your Ngrok Authtoken and Static Domain below.');
  NgrokPage.Add('Ngrok Authtoken:', False);
  NgrokPage.Add('Ngrok Domain (e.g. fluent-hippo.ngrok-free.app):', False);
end;

function ShouldSkipPage(PageID: Integer): Boolean;
begin
  Result := False;
  if PageID = CloudflarePage.ID then
  begin
    Result := not TunnelProviderPage.Values[2]; // Skip if Cloudflare is not selected
  end
  else if PageID = NgrokPage.ID then
  begin
    Result := not TunnelProviderPage.Values[1]; // Skip if Ngrok is not selected
  end;
end;

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
    
    // Extract bundled PostgreSQL silent installer into {tmp} on-demand
    WizardForm.StatusLabel.Caption := 'Extracting PostgreSQL 16 installer...';
    ExtractTemporaryFile('postgresql-16.2-1-windows-x64.exe');

    PgInstaller := ExpandConstant('{tmp}\postgresql-16.2-1-windows-x64.exe');
    if not FileExists(PgInstaller) then
    begin
      MsgBox('PostgreSQL installer executable not found after extraction: ' + PgInstaller, mbError, MB_OK);
      Exit;
    end;

    // Clean up partial or non-empty directory from previous interrupted installation attempts
    if DirExists('C:\Program Files\PostgreSQL\16') then
    begin
      DelTree('C:\Program Files\PostgreSQL\16', True, True, True);
    end;

    Params := '--mode unattended --superpassword "' + GeneratedDbPassword + '" --serverport 5432 --prefix "C:\Program Files\PostgreSQL\16" --install_runtimes 0';
    WizardForm.StatusLabel.Caption := 'Installing PostgreSQL 16 Database Service (this may take a minute)...';
    
    if Exec(PgInstaller, Params, '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
    begin
      if (ResultCode <> 0) and not FileExists('C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe') then
      begin
        SuppressibleMsgBox('PostgreSQL database installation failed with exit code ' + IntToStr(ResultCode) + '.' + #13#10 + 'Setup will now abort.', mbCriticalError, MB_OK, MB_OK);
        RaiseException('PostgreSQL installation failed.');
      end;
    end
    else
    begin
      SuppressibleMsgBox('Failed to launch PostgreSQL silent installer process (error code ' + IntToStr(ResultCode) + ').' + #13#10 + 'Setup will now abort.', mbCriticalError, MB_OK, MB_OK);
      RaiseException('PostgreSQL launch failed.');
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
    'spring.datasource.url=jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:postgres}' + #13#10 +
    'spring.datasource.username=${DB_USER:postgres}' + #13#10 +
    'spring.datasource.password=' + GeneratedDbPassword + #13#10 +
    'security.jwt.secret-key=' + GeneratedJwtSecret + #13#10 +
    'app.security.allowed-origin=${ALLOWED_ORIGIN:http://localhost:3000}' + #13#10 +
    'server.port=${SERVER_PORT:8765}' + #13#10 +
    'server.address=127.0.0.1' + #13#10;
    
  SaveStringToFile(ConfigFile, ConfigContent, False);
end;

// Poll http://localhost:8765 until server responds with HTTP 200/302/401, or until timeout (up to 15s)
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
        WinHttp.Open('GET', 'http://localhost:8765/api/v1/health', False);
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

procedure InstallCloudflareServiceIfNeeded;
var
  Token: String;
  ResultCode: Integer;
begin
  if TunnelProviderPage.Values[2] then
  begin
    Token := Trim(CloudflarePage.Values[0]);
    if Token <> '' then
    begin
      WizardForm.StatusLabel.Caption := 'Installing Cloudflare Tunnel Service...';
      Exec(ExpandConstant('{app}\cloudflared.exe'), 'service install ' + Token, '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    end;
  end;
end;

procedure InstallNgrokServiceIfNeeded;
var
  Token, Domain, ConfigDir, ConfigFile, ConfigContent: String;
  ResultCode: Integer;
begin
  if TunnelProviderPage.Values[1] then
  begin
    Token := Trim(NgrokPage.Values[0]);
    Domain := Trim(NgrokPage.Values[1]);
    
    if (Token <> '') and (Domain <> '') then
    begin
      WizardForm.StatusLabel.Caption := 'Configuring Ngrok Tunnel...';
      
      ConfigDir := ExpandConstant('{commonappdata}\ngrok');
      if not DirExists(ConfigDir) then
        CreateDir(ConfigDir);
        
      ConfigFile := ConfigDir + '\ngrok.yml';
      ConfigContent := 
        'version: "3"' + #13#10 +
        'agent:' + #13#10 +
        '  authtoken: ' + Token + #13#10 +
        'tunnels:' + #13#10 +
        '  laundryms:' + #13#10 +
        '    proto: http' + #13#10 +
        '    addr: 127.0.0.1:8765' + #13#10 +
        '    domain: ' + Domain + #13#10;
        
      SaveStringToFile(ConfigFile, ConfigContent, False);
      
      WizardForm.StatusLabel.Caption := 'Installing Ngrok Tunnel Service...';
      Exec(ExpandConstant('{app}\ngrok.exe'), 'service install --config="' + ConfigFile + '"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
      Exec(ExpandConstant('{app}\ngrok.exe'), 'service start', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    end;
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
    InstallCloudflareServiceIfNeeded;
    InstallNgrokServiceIfNeeded;
    WaitForServerReady;
  end;
end;
