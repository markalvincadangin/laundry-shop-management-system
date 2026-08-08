; Laundry Shop Management System - Production Installer
; Architecture: fail-closed upgrade lifecycle + true 3-state PostgreSQL + bundled Java 21

#define AppName "Laundry Shop Management System"
#ifndef AppVersion
  #define AppVersion "1.0.0"
#endif
#define AppPublisher "Himotech"
#define AppURL "http://localhost:8765"
#define ServiceName "LaundryShopMS"
#define TunnelServiceName "LaundryShopMSTunnel"

#define NgrokVersion "3.39.9"
#define NgrokInstallerFile "ngrok-v3-3.39.9-windows-amd64.zip"
#define NgrokInstallerUrl "https://bin.ngrok.com/a/m9v4MphCUjA/ngrok-v3-3.39.9-windows-amd64.zip"
#define NgrokInstallerSha256 "12F99DC3B2145AB1503602434E00FD38199A5545DC051DD86BA526C11AB97DB1"

#define PostgreSQLMajor "16"
#define PostgreSQLInstallerVersion "16.14-1"
#define PostgreSQLInstallerFile "postgresql-16.14-1-windows-x64.exe"
#define PostgreSQLInstallerUrl "https://get.enterprisedb.com/postgresql/postgresql-16.14-1-windows-x64.exe"
#define PostgreSQLInstallerSha256 "D389834DF279A9B7CE4B4A030B6545FD0BEFB05385FF66932AC37454AD9B9312"

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
ChangesEnvironment=no
CloseApplications=yes
RestartApplications=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "keepawake"; Description: "Keep PC awake while connected to AC power (Recommended for shop server)"; Flags: unchecked

[Files]
Source: "..\backend\target\deploy-staging\laundryms.jar"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\backend\target\deploy-staging\laundryms-service.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "resources\laundryms-service.xml"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\backend\target\deploy-staging\runtime\*"; DestDir: "{app}\runtime"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\backend\target\deploy-staging\deployment-manifest.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "resources\app.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\backend\target\deploy-staging\laundryms-service.exe"; DestDir: "{app}"; DestName: "laundryms-tunnel-service.exe"; Flags: ignoreversion; Check: ShouldInstallTunnelPayload
Source: "resources\laundryms-tunnel-service.xml"; DestDir: "{app}"; Flags: ignoreversion; Check: ShouldInstallTunnelPayload

[Dirs]
Name: "{commonappdata}\LaundryShopMS\config"
Name: "{commonappdata}\LaundryShopMS\logs"
Name: "{commonappdata}\LaundryShopMS\backups"

[Icons]
Name: "{commondesktop}\{#AppName}"; Filename: "{#AppURL}"; IconFilename: "{app}\app.ico"; Comment: "Launch {#AppName}"
Name: "{group}\{#AppName}"; Filename: "{#AppURL}"; IconFilename: "{app}\app.ico"; Comment: "Launch {#AppName}"
Name: "{group}\Uninstall {#AppName}"; Filename: "{uninstallexe}"

[Run]
Filename: "powercfg.exe"; Parameters: "-change -standby-timeout-ac 0"; Flags: runhidden; Tasks: keepawake

[Code]
const
  PG_STATE_COMPATIBLE = 1;
  PG_STATE_INCOMPATIBLE = 2;
  PG_STATE_NONE = 3;

  SERVICE_STATE_TIMEOUT_MS = 20000;
  HEALTH_CHECK_ATTEMPTS = 60;
  HEALTH_CHECK_INTERVAL_MS = 500;
  POSTGRES_READY_ATTEMPTS = 60;
  TUNNEL_HEALTH_ATTEMPTS = 12;
  TUNNEL_HEALTH_INTERVAL_MS = 1000;

  SERVICE_NOT_INSTALLED = 0;
  SERVICE_STOPPED = 1;
  SERVICE_RUNNING = 2;
  SERVICE_START_PENDING = 3;
  SERVICE_STOP_PENDING = 4;
  SERVICE_UNKNOWN = 5;
  SERVICE_OTHER_PENDING = 6;
  SERVICE_PAUSED = 7;

var
  GeneratedAppPassword: String;
  GeneratedJwtSecret: String;
  GeneratedPostgresAdminPassword: String;
  GeneratedPostgresServicePassword: String;
  ExistingSuperuserPassword: String;
  ExistingSuperuserName: String;
  AssignedDbPort: Integer;
  DbHost: String;
  IsUpgrade: Boolean;
  IsRecoverableLegacyDeployment: Boolean;
  ManagedPostgres: Boolean;
  CredentialsPrepared: Boolean;
  TunnelEnabled: Boolean;
  TunnelWasPreviouslyEnabled: Boolean;
  TunnelAuthtoken: String;
  TunnelPublicUrl: String;
  RemoteFrontendUrl: String;
  TunnelWarning: String;
  TunnelPayloadReady: Boolean;

  DetectedPgState: Integer;
  DetectedPgMajor: Integer;
  DetectedPgPort: Integer;
  DetectedPgBinDir: String;
  DetectedPgDataDir: String;
  DetectedPgReachable: Boolean;
  CompatiblePgUnavailable: Boolean;
  UnsupportedPgOn5432: Boolean;
  PostgresDetectionPerformed: Boolean;

  DbCredentialsPage: TInputQueryWizardPage;
  ManagedPgAdminPage: TInputQueryWizardPage;
  PgFallbackPage: TInputOptionWizardPage;
  TunnelModePage: TInputOptionWizardPage;
  TunnelConfigPage: TInputQueryWizardPage;
  RemoteFrontendPage: TInputQueryWizardPage;
  RemoveDataCheckBox: TNewCheckBox;
  ExistingPostgresValidationError: String;

function IsUnsafeShellValue(Value: String): Boolean;
begin
  Result := (Pos('"', Value) > 0) or (Pos('&', Value) > 0) or
            (Pos('|', Value) > 0) or (Pos('<', Value) > 0) or
            (Pos('>', Value) > 0) or (Pos('%', Value) > 0) or
            (Pos('^', Value) > 0) or (Pos('!', Value) > 0) or
            (Pos(#13, Value) > 0) or (Pos(#10, Value) > 0);
end;

function EscapePowerShellSingleQuoted(Value: String): String;
var
  i: Integer;
begin
  Result := '';
  for i := 1 to Length(Value) do
  begin
    if Value[i] = '''' then
      Result := Result + ''''''
    else
      Result := Result + Value[i];
  end;
end;

function GenerateSecureToken(ByteCount: Integer): String;
var
  TmpFile, PsCommand: String;
  ResultCode: Integer;
  Lines: TArrayOfString;
begin
  Result := '';
  TmpFile := ExpandConstant('{tmp}\laundryms-secure-token.txt');
  DeleteFile(TmpFile);

  PsCommand := '$b=New-Object byte[] ' + IntToStr(ByteCount) + ';' +
    '$r=[Security.Cryptography.RandomNumberGenerator]::Create();' +
    '$r.GetBytes($b);$r.Dispose();' +
    '$s=[Convert]::ToBase64String($b).TrimEnd(''='').Replace(''+'',''-'').Replace(''/'',''_'');' +
    '[IO.File]::WriteAllText(''' + EscapePowerShellSingleQuoted(TmpFile) + ''',$s,[Text.Encoding]::ASCII)';

  if not Exec('powershell.exe', '-NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "' + PsCommand + '"',
      '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    RaiseException('Secure random generation failed. Windows PowerShell and cryptographic RNG are required.');

  if not LoadStringsFromFile(TmpFile, Lines) or (GetArrayLength(Lines) = 0) then
    RaiseException('Secure random generation produced no output.');

  Result := Trim(Lines[0]);
  DeleteFile(TmpFile);
  if Length(Result) < 24 then
    RaiseException('Secure random generation returned an unexpectedly short token.');
end;

function RunIcacls(PathName, ExtraArgs: String): Boolean;
var
  ResultCode: Integer;
begin
  Result := Exec(ExpandConstant('{sys}\icacls.exe'), '"' + PathName + '" ' + ExtraArgs,
    '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
end;

function GetTargetAppDir(): String;
var
  RegDir: String;
begin
  if RegQueryStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'InstallDir', RegDir) and (RegDir <> '') then
    Result := RegDir
  else if (WizardForm <> nil) and (WizardForm.DirEdit <> nil) and (WizardForm.DirEdit.Text <> '') then
    Result := WizardForm.DirEdit.Text
  else
    Result := ExpandConstant('{autopf}\{#AppName}');
end;

procedure HardenDirectoryForSystemAndAdmins(PathName: String);
begin
  if not ForceDirectories(PathName) then
    RaiseException('Could not create secure directory: ' + PathName);
  if not RunIcacls(PathName, '/inheritance:r /grant:r "*S-1-5-18:(OI)(CI)F" "*S-1-5-32-544:(OI)(CI)F"') then
    RaiseException('Could not apply restricted ACLs to: ' + PathName);
end;

procedure HardenFileForSystemAndAdmins(PathName: String);
begin
  if not RunIcacls(PathName, '/inheritance:r /grant:r "*S-1-5-18:F" "*S-1-5-32-544:F"') then
    RaiseException('Could not apply restricted ACLs to file: ' + PathName);
end;

procedure EnsureProgramDataSecurity;
var
  RootDir, ConfigDir, LogsDir, BackupsDir, CacheDir: String;
begin
  RootDir := ExpandConstant('{commonappdata}\LaundryShopMS');
  ConfigDir := RootDir + '\config';
  LogsDir := RootDir + '\logs';
  BackupsDir := RootDir + '\backups';
  CacheDir := RootDir + '\cache';

  HardenDirectoryForSystemAndAdmins(RootDir);
  HardenDirectoryForSystemAndAdmins(ConfigDir);
  HardenDirectoryForSystemAndAdmins(LogsDir);
  HardenDirectoryForSystemAndAdmins(BackupsDir);
  HardenDirectoryForSystemAndAdmins(CacheDir);
end;

procedure EnsureTunnelDataSecurity;
var
  TunnelDir: String;
begin
  TunnelDir := ExpandConstant('{commonappdata}\LaundryShopMS\tunnel');
  HardenDirectoryForSystemAndAdmins(TunnelDir);
end;

function GetNamedWindowsServiceState(ServiceNameValue, TempTag: String): Integer;
var
  ResultCode, i, ColonPos, NumericCode: Integer;
  TmpFile, Line, ValueText, NumericToken: String;
  Lines: TArrayOfString;
begin
  Result := SERVICE_UNKNOWN;
  TmpFile := ExpandConstant('{tmp}\laundryms-' + TempTag + '-sc-status.txt');
  DeleteFile(TmpFile);

  if IsUnsafeShellValue(ServiceNameValue) then Exit;
  if not Exec('cmd.exe', '/c sc.exe query "' + ServiceNameValue + '" > "' + TmpFile + '" 2>&1',
      '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
    Exit;

  if not FileExists(TmpFile) or not LoadStringsFromFile(TmpFile, Lines) then
  begin
    DeleteFile(TmpFile);
    Exit;
  end;

  if ResultCode <> 0 then
  begin
    for i := 0 to GetArrayLength(Lines) - 1 do
      if Pos('1060', Lines[i]) > 0 then
      begin
        Result := SERVICE_NOT_INSTALLED;
        DeleteFile(TmpFile);
        Exit;
      end;
    DeleteFile(TmpFile);
    Exit;
  end;

  for i := 0 to GetArrayLength(Lines) - 1 do
  begin
    Line := Trim(Lines[i]);
    ColonPos := Pos(':', Line);
    if ColonPos > 0 then
    begin
      ValueText := Trim(Copy(Line, ColonPos + 1, Length(Line) - ColonPos));
      NumericToken := '';
      while (Length(ValueText) > 0) and (ValueText[1] >= '0') and (ValueText[1] <= '9') do
      begin
        NumericToken := NumericToken + ValueText[1];
        Delete(ValueText, 1, 1);
      end;
      NumericCode := StrToIntDef(NumericToken, -1);
      if (NumericCode >= 1) and (NumericCode <= 7) then
      begin
        case NumericCode of
          1: Result := SERVICE_STOPPED;
          2: Result := SERVICE_START_PENDING;
          3: Result := SERVICE_STOP_PENDING;
          4: Result := SERVICE_RUNNING;
          5, 6: Result := SERVICE_OTHER_PENDING;
          7: Result := SERVICE_PAUSED;
        end;
        DeleteFile(TmpFile);
        Exit;
      end;
    end;
  end;

  DeleteFile(TmpFile);
end;

function GetWindowsServiceState(): Integer;
begin
  Result := GetNamedWindowsServiceState('{#ServiceName}', 'app');
end;

function GetTunnelServiceState(): Integer;
begin
  Result := GetNamedWindowsServiceState('{#TunnelServiceName}', 'tunnel');
end;

function GetPropertyFromFile(FilePath, PropName: String): String;
var
  Lines: TArrayOfString;
  i, EqualPos: Integer;
  Line, Key: String;
begin
  Result := '';
  if not FileExists(FilePath) then Exit;
  if not LoadStringsFromFile(FilePath, Lines) then Exit;
  for i := 0 to GetArrayLength(Lines) - 1 do
  begin
    Line := Trim(Lines[i]);
    if (Line <> '') and (Pos('#', Line) <> 1) and (Pos('!', Line) <> 1) then
    begin
      EqualPos := Pos('=', Line);
      if EqualPos > 1 then
      begin
        Key := Trim(Copy(Line, 1, EqualPos - 1));
        if CompareText(Key, PropName) = 0 then
        begin
          Result := Trim(Copy(Line, EqualPos + 1, Length(Line) - EqualPos));
          Exit;
        end;
      end;
    end;
  end;
end;

function ExtractHostFromJdbcUrl(JdbcUrl: String): String;
var
  P, ColonPos, SlashPos: Integer;
  Remainder: String;
begin
  Result := '127.0.0.1';
  P := Pos('://', JdbcUrl);
  if P = 0 then Exit;
  Remainder := Copy(JdbcUrl, P + 3, Length(JdbcUrl));
  ColonPos := Pos(':', Remainder);
  SlashPos := Pos('/', Remainder);
  if (ColonPos > 1) and ((SlashPos = 0) or (ColonPos < SlashPos)) then
    Result := Copy(Remainder, 1, ColonPos - 1)
  else if SlashPos > 1 then
    Result := Copy(Remainder, 1, SlashPos - 1);
end;

function ExtractPortFromJdbcUrl(JdbcUrl: String): Integer;
var
  P, ColonPos, SlashPos: Integer;
  Remainder, PortStr: String;
begin
  Result := 5432;
  P := Pos('://', JdbcUrl);
  if P = 0 then Exit;
  Remainder := Copy(JdbcUrl, P + 3, Length(JdbcUrl));
  ColonPos := Pos(':', Remainder);
  SlashPos := Pos('/', Remainder);
  if (ColonPos > 0) and (SlashPos > ColonPos) then
  begin
    PortStr := Copy(Remainder, ColonPos + 1, SlashPos - ColonPos - 1);
    Result := StrToIntDef(PortStr, 5432);
  end;
end;

function IsExistingLaundryShopMSInstallation(): Boolean;
var
  ConfigFile, RegVersion: String;
  ConfigExists, RegExists, ServiceBinaryExists, RegisteredServiceExists, AnyEvidence: Boolean;
  SvcState: Integer;
begin
  ConfigFile := ExpandConstant('{commonappdata}\LaundryShopMS\config\application-prod.properties');
  ConfigExists := FileExists(ConfigFile);
  RegExists := RegQueryStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'InstalledVersion', RegVersion);
  ServiceBinaryExists := FileExists(GetTargetAppDir() + '\laundryms-service.exe');
  SvcState := GetWindowsServiceState();
  RegisteredServiceExists := (SvcState <> SERVICE_NOT_INSTALLED) and (SvcState <> SERVICE_UNKNOWN);
  AnyEvidence := ConfigExists or RegExists or ServiceBinaryExists or RegisteredServiceExists;
  IsRecoverableLegacyDeployment := False;

  if (SvcState = SERVICE_UNKNOWN) and AnyEvidence then
  begin
    SuppressibleMsgBox('An existing Laundry Shop Management System deployment was detected, but Windows service state cannot be determined.' + #13#10 +
      'Setup will abort rather than risk overwriting existing configuration or replacing files unsafely.', mbCriticalError, MB_OK, MB_OK);
    RaiseException('Unknown SCM state during deployment preflight.');
  end
  else if ConfigExists and (SvcState = SERVICE_NOT_INSTALLED) and (RegExists or ServiceBinaryExists) then
  begin
    IsRecoverableLegacyDeployment := True;
    Result := True;
  end
  else if ConfigExists and RegisteredServiceExists then
  begin
    Result := True;
  end
  else if AnyEvidence then
  begin
    SuppressibleMsgBox('Incomplete or inconsistent Laundry Shop Management System deployment evidence was found.' + #13#10 +
      'Setup cannot continue automatically because doing so could overwrite secrets or damage an existing deployment.', mbCriticalError, MB_OK, MB_OK);
    RaiseException('Damaged deployment state detected.');
  end
  else
  begin
    Result := False;
  end;
end;

procedure PrepareCredentials;
var
  ConfigFile, JdbcUrl, RegPort, ManagedStr, PgMajorStr, PgBinStr, HostStr, TunnelEnabledStr, SavedTunnelUrl, SavedRemoteFrontendUrl: String;
begin
  if CredentialsPrepared then Exit;

  ConfigFile := ExpandConstant('{commonappdata}\LaundryShopMS\config\application-prod.properties');
  if IsExistingLaundryShopMSInstallation() then
  begin
    IsUpgrade := True;
    GeneratedAppPassword := GetPropertyFromFile(ConfigFile, 'spring.datasource.password');
    GeneratedJwtSecret := GetPropertyFromFile(ConfigFile, 'security.jwt.secret-key');
    JdbcUrl := GetPropertyFromFile(ConfigFile, 'spring.datasource.url');
    if (GeneratedAppPassword = '') or (GeneratedJwtSecret = '') or (JdbcUrl = '') then
      RaiseException('Existing production configuration is missing required datasource/JWT values.');

    DbHost := ExtractHostFromJdbcUrl(JdbcUrl);
    if RegQueryStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'DbPort', RegPort) then
      AssignedDbPort := StrToIntDef(RegPort, ExtractPortFromJdbcUrl(JdbcUrl))
    else
      AssignedDbPort := ExtractPortFromJdbcUrl(JdbcUrl);

    if RegQueryStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'ManagedPostgres', ManagedStr) then
      ManagedPostgres := CompareText(ManagedStr, 'true') = 0
    else
      ManagedPostgres := False;

    if RegQueryStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'PgMajor', PgMajorStr) then
      DetectedPgMajor := StrToIntDef(PgMajorStr, 0);
    if RegQueryStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'PgBinDir', PgBinStr) then
      DetectedPgBinDir := PgBinStr;
    if RegQueryStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'DbHost', HostStr) and (HostStr <> '') then
      DbHost := HostStr;

    TunnelWasPreviouslyEnabled := False;
    TunnelEnabled := False;
    if RegQueryStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'TunnelEnabled', TunnelEnabledStr) then
      TunnelWasPreviouslyEnabled := CompareText(TunnelEnabledStr, 'true') = 0;
    if TunnelWasPreviouslyEnabled then
    begin
      if FileExists(ExpandConstant('{commonappdata}\LaundryShopMS\tunnel\ngrok.yml')) then
      begin
        TunnelEnabled := True;
        if RegQueryStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'TunnelPublicUrl', SavedTunnelUrl) then
          TunnelPublicUrl := SavedTunnelUrl;
        if RegQueryStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'RemoteFrontendUrl', SavedRemoteFrontendUrl) then
          RemoteFrontendUrl := SavedRemoteFrontendUrl;
      end
      else
      begin
        Log('Tunnel metadata says enabled, but protected ngrok.yml is missing. Upgrade will continue locally and will not recreate a secret configuration without an authtoken.');
        TunnelEnabled := False;
      end;
    end;

    if IsRecoverableLegacyDeployment then
      Log('Deployment mode: RETAINED-DATA / LEGACY SERVICE REPAIR')
    else
      Log('Deployment mode: NORMAL UPGRADE');
  end
  else
  begin
    IsUpgrade := False;
    IsRecoverableLegacyDeployment := False;
    ManagedPostgres := False;
    DbHost := '127.0.0.1';
    AssignedDbPort := 5432;
    GeneratedAppPassword := GenerateSecureToken(32);
    GeneratedJwtSecret := GenerateSecureToken(48);
    // The PostgreSQL database superuser password is chosen by the person running Setup,
    // matching the normal PostgreSQL Windows installation experience. It is never
    // persisted by Laundry Shop MS after provisioning.
    GeneratedPostgresAdminPassword := '';
    // The Windows service account password remains installer-generated and hidden.
    GeneratedPostgresServicePassword := 'Aa1' + GenerateSecureToken(32);
    TunnelEnabled := False;
    TunnelWasPreviouslyEnabled := False;
    TunnelAuthtoken := '';
    TunnelPublicUrl := '';
    RemoteFrontendUrl := '';
    TunnelWarning := '';
    TunnelPayloadReady := False;
    Log('Deployment mode: CLEAN INSTALL');
  end;

  CredentialsPrepared := True;
end;

function ParseLeadingInteger(Value: String): Integer;
var
  i: Integer;
  Token: String;
begin
  Token := '';
  for i := 1 to Length(Value) do
  begin
    if (Value[i] >= '0') and (Value[i] <= '9') then
      Token := Token + Value[i]
    else if Token <> '' then
      Break;
  end;
  Result := StrToIntDef(Token, 0);
end;

function ReadPortFromConfigFile(FilePath: String; CurrentPort: Integer): Integer;
var
  Lines: TArrayOfString;
  i, EqPos, CommentPos, SpacePos: Integer;
  Line, Key, Value: String;
begin
  Result := CurrentPort;
  if not FileExists(FilePath) then Exit;
  if not LoadStringsFromFile(FilePath, Lines) then Exit;

  for i := 0 to GetArrayLength(Lines) - 1 do
  begin
    Line := Trim(Lines[i]);
    if (Line <> '') and (Line[1] <> '#') then
    begin
      EqPos := Pos('=', Line);
      if EqPos > 1 then
      begin
        Key := Trim(Copy(Line, 1, EqPos - 1));
        if CompareText(Key, 'port') = 0 then
        begin
          Value := Trim(Copy(Line, EqPos + 1, Length(Line) - EqPos));
          CommentPos := Pos('#', Value);
          if CommentPos > 0 then Value := Trim(Copy(Value, 1, CommentPos - 1));
          if (Length(Value) >= 2) and (((Value[1] = '''') and (Value[Length(Value)] = '''')) or
             ((Value[1] = '"') and (Value[Length(Value)] = '"'))) then
            Value := Copy(Value, 2, Length(Value) - 2);
          SpacePos := Pos(' ', Value);
          if SpacePos > 0 then Value := Copy(Value, 1, SpacePos - 1);
          Result := StrToIntDef(Value, Result);
        end;
      end;
    end;
  end;
end;

function GetConfiguredPostgresPort(DataDir: String): Integer;
begin
  Result := 5432;
  if DataDir = '' then Exit;
  Result := ReadPortFromConfigFile(AddBackslash(DataDir) + 'postgresql.conf', Result);
  Result := ReadPortFromConfigFile(AddBackslash(DataDir) + 'postgresql.auto.conf', Result);
end;

function ExecToOutputFile(FileName, Params, OutputFile: String; var ResultCode: Integer): Boolean;
var
  Cmd: String;
begin
  DeleteFile(OutputFile);
  Cmd := '/c ""' + FileName + '" ' + Params + ' > "' + OutputFile + '" 2>&1"';
  Result := Exec('cmd.exe', Cmd, '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;

function IsPostgresReady(BinDir: String; Port: Integer): Boolean;
var
  PgIsReady, OutputFile: String;
  ResultCode: Integer;
begin
  Result := False;
  PgIsReady := AddBackslash(BinDir) + 'pg_isready.exe';
  if not FileExists(PgIsReady) then Exit;
  OutputFile := ExpandConstant('{tmp}\laundryms-pg-ready.txt');
  if ExecToOutputFile(PgIsReady, '-h 127.0.0.1 -p ' + IntToStr(Port) + ' -t 2', OutputFile, ResultCode) then
    Result := ResultCode = 0;
  DeleteFile(OutputFile);
end;

procedure ConsiderPostgresInstallation(Major, Port: Integer; BinDir, DataDir: String);
var
  Ready: Boolean;
begin
  if (Major <= 0) or (Port <= 0) or (Port > 65535) then Exit;
  Ready := IsPostgresReady(BinDir, Port);

  if (Major >= 16) and (Major <= 18) then
  begin
    if Ready then
    begin
      if (not DetectedPgReachable) or ((Port = 5432) and (DetectedPgPort <> 5432)) then
      begin
        DetectedPgReachable := True;
        DetectedPgMajor := Major;
        DetectedPgPort := Port;
        DetectedPgBinDir := BinDir;
        DetectedPgDataDir := DataDir;
      end;
    end
    else
    begin
      CompatiblePgUnavailable := True;
      if (DetectedPgMajor = 0) then
      begin
        DetectedPgMajor := Major;
        DetectedPgPort := Port;
        DetectedPgBinDir := BinDir;
        DetectedPgDataDir := DataDir;
      end;
    end;
  end
  else if Port = 5432 then
  begin
    UnsupportedPgOn5432 := True;
  end;
end;

procedure ScanPostgresRegistry;
var
  Names: TArrayOfString;
  i, Major, Port: Integer;
  KeyPath, VersionStr, BaseDir, DataDir, BinDir, PostgresExe: String;
begin
  if not RegGetSubkeyNames(HKLM, 'SOFTWARE\PostgreSQL\Installations', Names) then Exit;
  for i := 0 to GetArrayLength(Names) - 1 do
  begin
    KeyPath := 'SOFTWARE\PostgreSQL\Installations\' + Names[i];
    VersionStr := '';
    BaseDir := '';
    DataDir := '';
    RegQueryStringValue(HKLM, KeyPath, 'Version', VersionStr);
    RegQueryStringValue(HKLM, KeyPath, 'Base Directory', BaseDir);
    RegQueryStringValue(HKLM, KeyPath, 'Data Directory', DataDir);
    Major := ParseLeadingInteger(VersionStr);
    if BaseDir <> '' then
      BinDir := AddBackslash(BaseDir) + 'bin'
    else
      BinDir := '';
    PostgresExe := AddBackslash(BinDir) + 'postgres.exe';

    // EDB uninstallers can leave registry keys behind. Never let a stale key
    // reserve a port or force a PostgreSQL state unless the server binaries exist.
    if (Major <= 0) or (BinDir = '') or (not FileExists(PostgresExe)) then
    begin
      Log('Ignoring stale PostgreSQL registry entry: ' + KeyPath);
      Continue;
    end;

    Port := GetConfiguredPostgresPort(DataDir);
    ConsiderPostgresInstallation(Major, Port, BinDir, DataDir);
  end;
end;

procedure ScanActivePostgresListeners;
var
  OutputFile, PsCommand, Line, Rest, PortText, ExePath, VersionText, BinDir: String;
  Lines: TArrayOfString;
  ResultCode, i, Sep1, Sep2, Port, Major: Integer;
begin
  OutputFile := ExpandConstant('{tmp}\laundryms-postgres-listeners.txt');
  DeleteFile(OutputFile);

  PsCommand := '$f=''' + EscapePowerShellSingleQuoted(OutputFile) + ''';' +
    'Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue|ForEach-Object{' +
    '$c=$_;try{$p=Get-Process -Id $c.OwningProcess -ErrorAction Stop;' +
    'if($p.Path -and ([IO.Path]::GetFileName($p.Path) -ieq ''postgres.exe'')){' +
    '$v=& $p.Path --version 2>$null;' +
    '[IO.File]::AppendAllText($f,([string]$c.LocalPort+''|''+$p.Path+''|''+$v+[Environment]::NewLine),[Text.Encoding]::ASCII)' +
    '}}catch{}}';

  if not Exec('powershell.exe', '-NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "' + PsCommand + '"',
      '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
  begin
    DeleteFile(OutputFile);
    Log('Active PostgreSQL listener scan could not be completed; registry and port-safety detection remain active.');
    Exit;
  end;

  if FileExists(OutputFile) and LoadStringsFromFile(OutputFile, Lines) then
    for i := 0 to GetArrayLength(Lines) - 1 do
    begin
      Line := Trim(Lines[i]);
      Sep1 := Pos('|', Line);
      if Sep1 > 1 then
      begin
        PortText := Copy(Line, 1, Sep1 - 1);
        Rest := Copy(Line, Sep1 + 1, Length(Line) - Sep1);
        Sep2 := Pos('|', Rest);
        if Sep2 > 1 then
        begin
          ExePath := Copy(Rest, 1, Sep2 - 1);
          VersionText := Copy(Rest, Sep2 + 1, Length(Rest) - Sep2);
          Port := StrToIntDef(PortText, 0);
          Major := ParseLeadingInteger(VersionText);
          BinDir := ExtractFileDir(ExePath);
          if FileExists(AddBackslash(BinDir) + 'pg_isready.exe') then
            ConsiderPostgresInstallation(Major, Port, BinDir, '');
        end;
      end;
    end;
  DeleteFile(OutputFile);
end;

function IsPortDeclaredByInstalledPostgres(PortToCheck: Integer): Boolean;
var
  Names: TArrayOfString;
  i, Port: Integer;
  KeyPath, BaseDir, DataDir, BinDir: String;
begin
  Result := False;
  if not RegGetSubkeyNames(HKLM, 'SOFTWARE\PostgreSQL\Installations', Names) then Exit;
  for i := 0 to GetArrayLength(Names) - 1 do
  begin
    KeyPath := 'SOFTWARE\PostgreSQL\Installations\' + Names[i];
    BaseDir := '';
    DataDir := '';
    RegQueryStringValue(HKLM, KeyPath, 'Base Directory', BaseDir);
    RegQueryStringValue(HKLM, KeyPath, 'Data Directory', DataDir);
    BinDir := AddBackslash(BaseDir) + 'bin';

    // Ignore stale uninstall registry residue. A registry key by itself does not
    // prove that PostgreSQL is still installed or that its old port is reserved.
    if (BaseDir = '') or (not FileExists(AddBackslash(BinDir) + 'postgres.exe')) then
      Continue;

    Port := GetConfiguredPostgresPort(DataDir);
    if Port = PortToCheck then
    begin
      Result := True;
      Exit;
    end;
  end;
end;

function CanBindTcpPort(Port: Integer): Boolean;
var
  ResultCode: Integer;
  PsCommand: String;
begin
  PsCommand := 'if (Get-NetTCPConnection -LocalPort ' + IntToStr(Port) + ' -ErrorAction SilentlyContinue) { exit 1 }; ' +
    '$l=[System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any,' + IntToStr(Port) + '); ' +
    'try{$l.Start();$l.Stop();exit 0}catch{exit 1}';
  Result := Exec('powershell.exe', '-NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "' + PsCommand + '"',
    '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
end;

function IsPortAvailableForManagedPostgres(Port: Integer): Boolean;
begin
  Result := (not IsPortDeclaredByInstalledPostgres(Port)) and CanBindTcpPort(Port);
end;

function FindAvailablePostgresPort(StartPort: Integer): Integer;
var
  P: Integer;
begin
  Result := 0;
  for P := StartPort to 5499 do
    if IsPortAvailableForManagedPostgres(P) then
    begin
      Result := P;
      Exit;
    end;
end;

function DetectPostgreSQLState(): Integer;
begin
  if PostgresDetectionPerformed then
  begin
    Result := DetectedPgState;
    Exit;
  end;

  DetectedPgMajor := 0;
  DetectedPgPort := 0;
  DetectedPgBinDir := '';
  DetectedPgDataDir := '';
  DetectedPgReachable := False;
  CompatiblePgUnavailable := False;
  UnsupportedPgOn5432 := False;
  ScanPostgresRegistry;
  ScanActivePostgresListeners;

  if DetectedPgReachable or CompatiblePgUnavailable then
    DetectedPgState := PG_STATE_COMPATIBLE
  else if UnsupportedPgOn5432 then
    DetectedPgState := PG_STATE_INCOMPATIBLE
  else
    DetectedPgState := PG_STATE_NONE;

  PostgresDetectionPerformed := True;
  Result := DetectedPgState;
end;

function EscapePgPassValue(Value: String): String;
var
  i: Integer;
begin
  Result := '';
  for i := 1 to Length(Value) do
  begin
    if (Value[i] = '\') or (Value[i] = ':') then
      Result := Result + '\' + Value[i]
    else
      Result := Result + Value[i];
  end;
end;

function EscapeSqlLiteral(Value: String): String;
var
  i: Integer;
begin
  Result := '';
  for i := 1 to Length(Value) do
  begin
    if Value[i] = '''' then
      Result := Result + ''''''
    else
      Result := Result + Value[i];
  end;
end;

function GetSecureTempDir(): String;
begin
  Result := ExpandConstant('{tmp}\LaundryShopMS-Provisioning');
  HardenDirectoryForSystemAndAdmins(Result);
end;

function CreatePgPassFile(Host: String; Port: Integer; UserName, Password: String): String;
var
  Content: String;
begin
  Result := AddBackslash(GetSecureTempDir()) + 'pgpass.conf';
  Content := EscapePgPassValue(Host) + ':' + IntToStr(Port) + ':*:' +
    EscapePgPassValue(UserName) + ':' + EscapePgPassValue(Password) + #13#10;
  if not SaveStringToFile(Result, Content, False) then
    RaiseException('Could not create temporary PostgreSQL credential file.');
  HardenFileForSystemAndAdmins(Result);
end;

function RunPsqlWithPgPass(PsqlExe, Host: String; Port: Integer; UserName, Password, DatabaseName, ExtraParams: String): Boolean;
var
  PgPass, CmdFile, Content: String;
  ResultCode: Integer;
begin
  Result := False;
  if IsUnsafeShellValue(UserName) or IsUnsafeShellValue(Host) then Exit;
  PgPass := CreatePgPassFile(Host, Port, UserName, Password);
  CmdFile := AddBackslash(GetSecureTempDir()) + 'run-psql.cmd';
  Content := '@echo off' + #13#10 +
    'set "PGPASSFILE=' + PgPass + '"' + #13#10 +
    '"' + PsqlExe + '" -X -w -h "' + Host + '" -p ' + IntToStr(Port) +
    ' -U "' + UserName + '" -d "' + DatabaseName + '" ' + ExtraParams + #13#10 +
    'exit /b %ERRORLEVEL%' + #13#10;
  if not SaveStringToFile(CmdFile, Content, False) then
    RaiseException('Could not create temporary PostgreSQL command wrapper.');
  HardenFileForSystemAndAdmins(CmdFile);
  Result := Exec(CmdFile, '', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
  DeleteFile(CmdFile);
  DeleteFile(PgPass);
end;

function RunPsqlWithPgPassToOutput(PsqlExe, Host: String; Port: Integer; UserName, Password, DatabaseName, ExtraParams, OutputFile: String): Boolean;
var
  PgPass, CmdFile, Content: String;
  ResultCode: Integer;
begin
  Result := False;
  if IsUnsafeShellValue(UserName) or IsUnsafeShellValue(Host) then Exit;
  PgPass := CreatePgPassFile(Host, Port, UserName, Password);
  CmdFile := AddBackslash(GetSecureTempDir()) + 'run-psql-output.cmd';
  DeleteFile(OutputFile);
  Content := '@echo off' + #13#10 +
    'set "PGPASSFILE=' + PgPass + '"' + #13#10 +
    '"' + PsqlExe + '" -X -w -h "' + Host + '" -p ' + IntToStr(Port) +
    ' -U "' + UserName + '" -d "' + DatabaseName + '" ' + ExtraParams + ' > "' + OutputFile + '" 2>&1' + #13#10 +
    'exit /b %ERRORLEVEL%' + #13#10;
  if not SaveStringToFile(CmdFile, Content, False) then
    RaiseException('Could not create temporary PostgreSQL validation wrapper.');
  HardenFileForSystemAndAdmins(CmdFile);
  Result := Exec(CmdFile, '', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
  DeleteFile(CmdFile);
  DeleteFile(PgPass);
end;

function ValidateExistingPostgresAdmin: Boolean;
var
  PsqlExe, OutputFile, Line: String;
  Lines: TArrayOfString;
  i, ServerVersionNum, ActualMajor: Integer;
begin
  Result := False;
  ExistingPostgresValidationError := '';
  PsqlExe := AddBackslash(DetectedPgBinDir) + 'psql.exe';
  if not FileExists(PsqlExe) then
  begin
    ExistingPostgresValidationError := 'The detected PostgreSQL installation does not contain psql.exe.';
    Exit;
  end;

  OutputFile := AddBackslash(GetSecureTempDir()) + 'postgres-server-version.txt';
  if not RunPsqlWithPgPassToOutput(PsqlExe, DbHost, AssignedDbPort, ExistingSuperuserName,
      ExistingSuperuserPassword, 'postgres', '-tAc "SHOW server_version_num"', OutputFile) then
  begin
    DeleteFile(OutputFile);
    ExistingPostgresValidationError := 'Administrator authentication failed or the selected PostgreSQL server is not reachable.';
    Exit;
  end;

  ServerVersionNum := 0;
  if LoadStringsFromFile(OutputFile, Lines) then
    for i := 0 to GetArrayLength(Lines) - 1 do
    begin
      Line := Trim(Lines[i]);
      if Line <> '' then
      begin
        ServerVersionNum := ParseLeadingInteger(Line);
        if ServerVersionNum > 0 then Break;
      end;
    end;
  DeleteFile(OutputFile);

  if ServerVersionNum < 100000 then
  begin
    ExistingPostgresValidationError := 'Could not determine the PostgreSQL server version safely.';
    Exit;
  end;

  ActualMajor := ServerVersionNum div 10000;
  if (ActualMajor < 16) or (ActualMajor > 18) then
  begin
    ExistingPostgresValidationError := 'The server actually listening at ' + DbHost + ':' + IntToStr(AssignedDbPort) +
      ' is PostgreSQL ' + IntToStr(ActualMajor) + ', which is outside the supported 16-18 reuse window.';
    Exit;
  end;

  DetectedPgMajor := ActualMajor;
  Result := True;
end;

function IsAcceptableManagedPostgresPassword(Value: String): Boolean;
var
  i: Integer;
  HasUpper, HasLower, HasDigit: Boolean;
begin
  Result := False;
  if (Length(Value) < 12) or (Length(Value) > 128) then Exit;
  if Value <> Trim(Value) then Exit;

  HasUpper := False;
  HasLower := False;
  HasDigit := False;
  for i := 1 to Length(Value) do
  begin
    // Keep the unattended EDB option file predictable and portable.
    if (Value[i] < '!') or (Value[i] > '~') then Exit;
    if (Value[i] >= 'A') and (Value[i] <= 'Z') then HasUpper := True;
    if (Value[i] >= 'a') and (Value[i] <= 'z') then HasLower := True;
    if (Value[i] >= '0') and (Value[i] <= '9') then HasDigit := True;
  end;

  Result := HasUpper and HasLower and HasDigit;
end;

procedure CreateManagedPostgresAdminPage(AfterID: Integer);
begin
  ManagedPgAdminPage := CreateInputQueryPage(AfterID,
    'PostgreSQL Superuser Password',
    'Setup will install PostgreSQL ' + '{#PostgreSQLInstallerVersion}' + ' for Laundry Shop Management System.',
    'Choose the password for the built-in PostgreSQL superuser "postgres". Keep this password in your password manager; you can use it later with pgAdmin or psql. Laundry Shop MS does not store this superuser password after database provisioning.');
  ManagedPgAdminPage.Add('PostgreSQL Superuser:', False);
  ManagedPgAdminPage.Add('Password:', True);
  ManagedPgAdminPage.Add('Confirm Password:', True);
  ManagedPgAdminPage.Values[0] := 'postgres';
  ManagedPgAdminPage.Edits[0].ReadOnly := True;
end;

function IsAcceptableNgrokAuthtoken(Value: String): Boolean;
var
  i: Integer;
begin
  Result := False;
  if (Length(Value) < 20) or (Length(Value) > 256) then Exit;
  if Value <> Trim(Value) then Exit;
  for i := 1 to Length(Value) do
    if (Value[i] <= ' ') or (Value[i] > '~') then Exit;
  Result := True;
end;

function NormalizeTunnelPublicUrl(Value: String): String;
begin
  Result := Trim(Value);
  while (Length(Result) > 0) and (Result[Length(Result)] = '/') do
    Delete(Result, Length(Result), 1);
end;

function IsAcceptableTunnelPublicUrl(Value: String): Boolean;
var
  U, HostPart: String;
  P: Integer;
begin
  Result := False;
  U := NormalizeTunnelPublicUrl(Value);
  if CompareText(Copy(U, 1, 8), 'https://') <> 0 then Exit;
  HostPart := Copy(U, 9, Length(U) - 8);
  if HostPart = '' then Exit;
  if (Pos('/', HostPart) > 0) or (Pos('?', HostPart) > 0) or (Pos('#', HostPart) > 0) then Exit;
  if (CompareText(HostPart, 'localhost') = 0) or (HostPart = '127.0.0.1') then Exit;
  P := Pos(' ', HostPart);
  if P > 0 then Exit;
  Result := Pos('.', HostPart) > 1;
end;

function IsAcceptableRemoteFrontendUrl(Value: String): Boolean;
begin
  Result := IsAcceptableTunnelPublicUrl(Value);
end;

procedure CreateTunnelPages(AfterID: Integer);
begin
  TunnelModePage := CreateInputOptionPage(AfterID,
    'Remote Access',
    'Choose whether this shop computer should expose Laundry Shop MS through an Ngrok reverse tunnel.',
    'Local operation always remains available. Ngrok remote access is optional and can be retried later if the internet is unavailable.',
    True, False);
  TunnelModePage.Add('Local only (no public tunnel)');
  TunnelModePage.Add('Enable Ngrok remote access');
  TunnelModePage.Values[0] := True;

  TunnelConfigPage := CreateInputQueryPage(TunnelModePage.ID,
    'Ngrok Remote Access',
    'Configure the Ngrok agent for this Laundry Shop installation.',
    'Enter the device authtoken and the reserved/static HTTPS domain that the remote Vercel deployment is configured to use. The authtoken is stored only in the ACL-protected tunnel configuration.');
  TunnelConfigPage.Add('Ngrok Authtoken:', True);
  TunnelConfigPage.Add('Static HTTPS Domain:', False);
  TunnelConfigPage.Add('Remote Frontend URL:', False);
end;

function ShouldSkipPage(PageID: Integer): Boolean;
begin
  Result := False;
  if IsUpgrade then
  begin
    if ((TunnelModePage <> nil) and (PageID = TunnelModePage.ID)) or
       ((TunnelConfigPage <> nil) and (PageID = TunnelConfigPage.ID)) then
      Result := True;
    Exit;
  end;

  if (TunnelConfigPage <> nil) and (PageID = TunnelConfigPage.ID) then
  begin
    if (TunnelModePage = nil) or (not TunnelModePage.Values[1]) then
      Result := True;
  end;
end;

function ShouldInstallTunnelPayload(): Boolean;
begin
  Result := TunnelEnabled;
end;

procedure InitializeWizard;
var
  PgState, FallbackPort, TunnelAfterID: Integer;
begin
  PrepareCredentials;
  if IsUpgrade then
  begin
    if TunnelEnabled and (RemoteFrontendUrl = '') then
    begin
      RemoteFrontendPage := CreateInputQueryPage(wpSelectDir,
        'Remote Frontend Origin',
        'Remote access is already enabled, but this installation predates production CORS origin metadata.',
        'Enter the HTTPS origin of the deployed remote frontend (for example, the Vercel production URL). Setup will add it to the protected Spring Boot production configuration without changing existing database/JWT secrets.');
      RemoteFrontendPage.Add('Remote Frontend URL:', False);
    end;
    Exit;
  end;

  TunnelAfterID := wpSelectDir;
  PgState := DetectPostgreSQLState();
  if PgState = PG_STATE_COMPATIBLE then
  begin
    if not DetectedPgReachable then
    begin
      MsgBox('A supported PostgreSQL ' + IntToStr(DetectedPgMajor) + ' installation was detected, but it is not accepting connections on port ' +
        IntToStr(DetectedPgPort) + '.' + #13#10#13#10 +
        'Start the existing PostgreSQL service and run Setup again. Setup will not install another PostgreSQL instance over a stopped supported installation.', mbCriticalError, MB_OK);
      RaiseException('Supported PostgreSQL installation is unavailable.');
    end;

    DbHost := '127.0.0.1';
    AssignedDbPort := DetectedPgPort;
    ManagedPostgres := False;
    DbCredentialsPage := CreateInputQueryPage(wpSelectDir,
      'Existing PostgreSQL Administrator',
      'A supported PostgreSQL ' + IntToStr(DetectedPgMajor) + ' server is active on port ' + IntToStr(DetectedPgPort) + '.',
      'Enter a PostgreSQL administrator account used only to provision the Laundry Shop MS database. The password is never stored.');
    DbCredentialsPage.Add('Database Host:', False);
    DbCredentialsPage.Add('Database Port:', False);
    DbCredentialsPage.Add('Administrator User:', False);
    DbCredentialsPage.Add('Administrator Password:', True);
    DbCredentialsPage.Values[0] := '127.0.0.1';
    DbCredentialsPage.Values[1] := IntToStr(DetectedPgPort);
    DbCredentialsPage.Values[2] := 'postgres';
    TunnelAfterID := DbCredentialsPage.ID;
  end
  else if PgState = PG_STATE_INCOMPATIBLE then
  begin
    FallbackPort := FindAvailablePostgresPort(5433);
    if FallbackPort = 0 then
      RaiseException('No available PostgreSQL fallback port was found between 5433 and 5499.');
    AssignedDbPort := FallbackPort;
    PgFallbackPage := CreateInputOptionPage(wpSelectDir,
      'Unsupported PostgreSQL Detected',
      'An unsupported PostgreSQL version is already configured for port 5432 and will be left untouched.',
      'Explicitly opt in to install the supported PostgreSQL ' + '{#PostgreSQLInstallerVersion}' + ' prerequisite on port ' + IntToStr(FallbackPort) + '.',
      False, False);
    PgFallbackPage.Add('Install a separate PostgreSQL {#PostgreSQLInstallerVersion} instance for Laundry Shop MS on port ' + IntToStr(FallbackPort));
    PgFallbackPage.Values[0] := False;
    CreateManagedPostgresAdminPage(PgFallbackPage.ID);
    TunnelAfterID := ManagedPgAdminPage.ID;
  end
  else
  begin
    AssignedDbPort := FindAvailablePostgresPort(5432);
    if AssignedDbPort = 0 then
      RaiseException('No available PostgreSQL port was found between 5432 and 5499.');
    CreateManagedPostgresAdminPage(wpSelectDir);
    TunnelAfterID := ManagedPgAdminPage.ID;
  end;

  CreateTunnelPages(TunnelAfterID);
end;

function NextButtonClick(CurPageID: Integer): Boolean;
var
  PortValue: Integer;
begin
  Result := True;

  if (DbCredentialsPage <> nil) and (CurPageID = DbCredentialsPage.ID) then
  begin
    DbHost := Trim(DbCredentialsPage.Values[0]);
    PortValue := StrToIntDef(Trim(DbCredentialsPage.Values[1]), 0);
    ExistingSuperuserName := Trim(DbCredentialsPage.Values[2]);
    ExistingSuperuserPassword := DbCredentialsPage.Values[3];
    if (DbHost = '') or (PortValue <= 0) or (PortValue > 65535) or (ExistingSuperuserName = '') or (ExistingSuperuserPassword = '') then
    begin
      MsgBox('Enter a valid PostgreSQL host, port, administrator user, and administrator password.', mbError, MB_OK);
      Result := False;
      Exit;
    end;
    if IsUnsafeShellValue(DbHost) or IsUnsafeShellValue(ExistingSuperuserName) then
    begin
      MsgBox('The database host or administrator user contains characters that cannot be safely passed to PostgreSQL tooling.', mbError, MB_OK);
      Result := False;
      Exit;
    end;
    AssignedDbPort := PortValue;
    if not ValidateExistingPostgresAdmin then
    begin
      MsgBox(ExistingPostgresValidationError + #13#10#13#10 + 'Verify the connection details and try again.', mbError, MB_OK);
      Result := False;
    end;
  end;

  if (PgFallbackPage <> nil) and (CurPageID = PgFallbackPage.ID) and (not PgFallbackPage.Values[0]) then
  begin
    MsgBox('Setup will not modify the unsupported PostgreSQL installation. Select the separate PostgreSQL installation option to continue, or cancel Setup.', mbInformation, MB_OK);
    Result := False;
    Exit;
  end;

  if (ManagedPgAdminPage <> nil) and (CurPageID = ManagedPgAdminPage.ID) then
  begin
    if ManagedPgAdminPage.Values[0] <> 'postgres' then
    begin
      MsgBox('The installer-managed PostgreSQL superuser must remain "postgres".', mbError, MB_OK);
      Result := False;
      Exit;
    end;

    if ManagedPgAdminPage.Values[1] <> ManagedPgAdminPage.Values[2] then
    begin
      MsgBox('The PostgreSQL superuser passwords do not match.', mbError, MB_OK);
      Result := False;
      Exit;
    end;

    if not IsAcceptableManagedPostgresPassword(ManagedPgAdminPage.Values[1]) then
    begin
      MsgBox('Choose a PostgreSQL superuser password that is 12-128 characters long and contains at least one uppercase letter, one lowercase letter, and one number.' + #13#10#13#10 +
        'Use printable ASCII characters and do not begin or end the password with spaces.', mbError, MB_OK);
      Result := False;
      Exit;
    end;

    GeneratedPostgresAdminPassword := ManagedPgAdminPage.Values[1];
    ExistingSuperuserName := 'postgres';
  end;

  if (TunnelModePage <> nil) and (CurPageID = TunnelModePage.ID) then
  begin
    TunnelEnabled := TunnelModePage.Values[1];
    if not TunnelEnabled then
    begin
      TunnelAuthtoken := '';
      TunnelPublicUrl := '';
      RemoteFrontendUrl := '';
    end;
  end;

  if (TunnelConfigPage <> nil) and (CurPageID = TunnelConfigPage.ID) then
  begin
    TunnelAuthtoken := Trim(TunnelConfigPage.Values[0]);
    TunnelPublicUrl := NormalizeTunnelPublicUrl(TunnelConfigPage.Values[1]);
    RemoteFrontendUrl := NormalizeTunnelPublicUrl(TunnelConfigPage.Values[2]);
    if not IsAcceptableNgrokAuthtoken(TunnelAuthtoken) then
    begin
      MsgBox('Enter a valid Ngrok authtoken. The token must be 20-256 printable non-whitespace characters.', mbError, MB_OK);
      Result := False;
      Exit;
    end;
    if not IsAcceptableTunnelPublicUrl(TunnelPublicUrl) then
    begin
      MsgBox('Enter the reserved/static Ngrok endpoint as a bare HTTPS origin, for example:' + #13#10 +
        'https://faith-laundry.ngrok-free.app' + #13#10#13#10 +
        'Do not include a path, query string, localhost address, or trailing slash.', mbError, MB_OK);
      Result := False;
      Exit;
    end;
    if not IsAcceptableRemoteFrontendUrl(RemoteFrontendUrl) then
    begin
      MsgBox('Enter the remote frontend as a bare HTTPS origin, for example:' + #13#10 +
        'https://laundry-shop-management-system.vercel.app' + #13#10#13#10 +
        'Do not include a path, query string, localhost address, or trailing slash.', mbError, MB_OK);
      Result := False;
      Exit;
    end;
    TunnelEnabled := True;
  end;

  if (RemoteFrontendPage <> nil) and (CurPageID = RemoteFrontendPage.ID) then
  begin
    RemoteFrontendUrl := NormalizeTunnelPublicUrl(RemoteFrontendPage.Values[0]);
    if not IsAcceptableRemoteFrontendUrl(RemoteFrontendUrl) then
    begin
      MsgBox('Enter the deployed remote frontend as a bare HTTPS origin, for example:' + #13#10 +
        'https://laundry-shop-management-system.vercel.app', mbError, MB_OK);
      Result := False;
      Exit;
    end;
  end;
end;

procedure RevalidatePostgresPlan;
begin
  if IsUpgrade then Exit;
  if DetectedPgState = PG_STATE_COMPATIBLE then
  begin
    if not ValidateExistingPostgresAdmin then
      RaiseException('The selected existing PostgreSQL server could not be revalidated: ' + ExistingPostgresValidationError);
  end
  else if not IsPortAvailableForManagedPostgres(AssignedDbPort) then
  begin
    RaiseException('The selected PostgreSQL installation port is no longer available. Restart Setup to choose another port safely.');
  end;
end;

procedure WaitForManagedPostgres;
var
  i: Integer;
begin
  for i := 1 to POSTGRES_READY_ATTEMPTS do
  begin
    if IsPostgresReady(DetectedPgBinDir, AssignedDbPort) then Exit;
    Sleep(1000);
  end;
  RaiseException('The managed PostgreSQL service did not become ready after installation.');
end;

function GetPostgresCacheDir(): String;
begin
  Result := ExpandConstant('{commonappdata}\LaundryShopMS\cache');
end;

function GetPostgresCachedInstallerPath(): String;
begin
  Result := AddBackslash(GetPostgresCacheDir()) + '{#PostgreSQLInstallerFile}';
end;

function IsExpectedPostgresInstaller(FilePath: String): Boolean;
var
  ActualHash: String;
begin
  Result := False;
  if not FileExists(FilePath) then Exit;
  try
    ActualHash := GetSHA256OfFile(FilePath);
    Result := CompareText(ActualHash, '{#PostgreSQLInstallerSha256}') = 0;
  except
    Log('Could not calculate PostgreSQL prerequisite SHA-256: ' + GetExceptionMessage);
  end;
end;

function AcquireVerifiedPostgresInstaller(): String;
var
  CacheFile, TempFile: String;
begin
  EnsureProgramDataSecurity;
  CacheFile := GetPostgresCachedInstallerPath();

  if FileExists(CacheFile) then
  begin
    if IsExpectedPostgresInstaller(CacheFile) then
    begin
      Log('Using verified cached PostgreSQL prerequisite: ' + CacheFile);
      WizardForm.StatusLabel.Caption := 'Using cached verified PostgreSQL {#PostgreSQLInstallerVersion} prerequisite...';
      Result := CacheFile;
      Exit;
    end;

    Log('Deleting cached PostgreSQL prerequisite because its SHA-256 is invalid.');
    if not DeleteFile(CacheFile) then
      RaiseException('Cached PostgreSQL prerequisite is invalid and could not be removed: ' + CacheFile);
  end;

  WizardForm.StatusLabel.Caption := 'Downloading verified PostgreSQL {#PostgreSQLInstallerVersion} prerequisite...';
  try
    DownloadTemporaryFile('{#PostgreSQLInstallerUrl}', '{#PostgreSQLInstallerFile}', '{#PostgreSQLInstallerSha256}', nil);
  except
    SuppressibleMsgBox('The PostgreSQL prerequisite could not be downloaded or failed SHA-256 verification.' + #13#10 + GetExceptionMessage,
      mbCriticalError, MB_OK, MB_OK);
    RaiseException('Verified PostgreSQL prerequisite download failed.');
  end;

  TempFile := ExpandConstant('{tmp}\{#PostgreSQLInstallerFile}');
  if not IsExpectedPostgresInstaller(TempFile) then
    RaiseException('Downloaded PostgreSQL prerequisite failed the post-download SHA-256 check.');

  if not FileCopy(TempFile, CacheFile, False) then
    RaiseException('Verified PostgreSQL prerequisite could not be copied to persistent cache: ' + CacheFile);
  HardenFileForSystemAndAdmins(CacheFile);

  if not IsExpectedPostgresInstaller(CacheFile) then
  begin
    DeleteFile(CacheFile);
    RaiseException('Persistent PostgreSQL prerequisite cache failed SHA-256 verification after copy.');
  end;

  Log('Cached verified PostgreSQL prerequisite for safe retry: ' + CacheFile);
  Result := CacheFile;
end;

function WindowsServiceExistsByName(ServiceName: String): Boolean;
var
  ResultCode: Integer;
begin
  Result := Exec(ExpandConstant('{sys}\sc.exe'), 'query "' + ServiceName + '"', '', SW_HIDE,
    ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
end;

function LocalWindowsUserExists(UserName: String): Boolean;
var
  ResultCode: Integer;
begin
  Result := Exec(ExpandConstant('{sys}\net.exe'), 'user "' + UserName + '"', '', SW_HIDE,
    ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
end;

procedure ValidateManagedPostgresInstallPreconditions;
var
  DefaultPgDir: String;
begin
  // These names are dedicated to Laundry Shop MS. Their presence before a new
  // managed install indicates an interrupted/retained prerequisite installation.
  if WindowsServiceExistsByName('postgresql-laundryms-16') then
    RaiseException('A previous Laundry Shop MS PostgreSQL service (postgresql-laundryms-16) already exists. ' +
      'Setup will not overwrite it automatically. Remove or repair that partial managed PostgreSQL installation, then retry.');

  if LocalWindowsUserExists('laundryms_pgsvc') then
    RaiseException('A previous Laundry Shop MS PostgreSQL Windows service account (laundryms_pgsvc) already exists. ' +
      'Setup will not guess or replace its password. Remove the partial managed PostgreSQL installation/account, then retry.');

  DefaultPgDir := ExpandConstant('{autopf}\PostgreSQL\16');
  if DirExists(DefaultPgDir) then
    RaiseException('An existing or partial PostgreSQL 16 directory exists at ' + DefaultPgDir + ', but Setup did not classify it as a reusable server. ' +
      'Setup will not install over that directory. Start/repair the existing server, or remove the directory after confirming it contains no needed data, then retry.');
end;

procedure InstallPostgreSQLIfNeeded;
var
  PgInstaller, OptionFile, Options, DebugTrace: String;
  ResultCode: Integer;
begin
  if IsUpgrade or (DetectedPgState = PG_STATE_COMPATIBLE) then Exit;

  if (DetectedPgState = PG_STATE_INCOMPATIBLE) and ((PgFallbackPage = nil) or (not PgFallbackPage.Values[0])) then
    RaiseException('Separate PostgreSQL installation was not explicitly approved.');

  if GeneratedPostgresAdminPassword = '' then
    RaiseException('The PostgreSQL superuser password was not configured. Return to the PostgreSQL Superuser Password page and choose a password.');

  // Re-check immediately before touching the machine. This catches partial
  // leftovers from a previous EDB attempt before another long download/install.
  ValidateManagedPostgresInstallPreconditions;
  PgInstaller := AcquireVerifiedPostgresInstaller();

  OptionFile := AddBackslash(GetSecureTempDir()) + 'postgresql-options.txt';
  DebugTrace := ExpandConstant('{commonappdata}\LaundryShopMS\logs\postgresql-installer-debug.log');
  DeleteFile(DebugTrace);
  Options := 'mode=unattended' + #13#10 +
    'unattendedmodeui=none' + #13#10 +
    'create_shortcuts=0' + #13#10 +
    'disable-components=pgAdmin,stackbuilder' + #13#10 +
    'superaccount=postgres' + #13#10 +
    'superpassword=' + GeneratedPostgresAdminPassword + #13#10 +
    'serviceaccount=laundryms_pgsvc' + #13#10 +
    'servicepassword=' + GeneratedPostgresServicePassword + #13#10 +
    'servicename=postgresql-laundryms-16' + #13#10 +
    'enable_acledit=1' + #13#10 +
    'serverport=' + IntToStr(AssignedDbPort) + #13#10;
  if not SaveStringToFile(OptionFile, Options, False) then
    RaiseException('Could not create PostgreSQL unattended installation option file.');
  HardenFileForSystemAndAdmins(OptionFile);

  WizardForm.StatusLabel.Caption := 'Installing PostgreSQL {#PostgreSQLInstallerVersion} on port ' + IntToStr(AssignedDbPort) + '...';
  if not Exec(PgInstaller, '--optionfile "' + OptionFile + '" --debuglevel 4 --debugtrace "' + DebugTrace + '"',
      '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    DeleteFile(OptionFile);
    RaiseException('Failed to launch PostgreSQL prerequisite installer. Cached prerequisite: ' + PgInstaller);
  end;
  DeleteFile(OptionFile);
  if ResultCode <> 0 then
  begin
    if FileExists(DebugTrace) then HardenFileForSystemAndAdmins(DebugTrace);
    SuppressibleMsgBox('PostgreSQL prerequisite installation failed with exit code ' + IntToStr(ResultCode) + '.' + #13#10#13#10 +
      'Diagnostic log:' + #13#10 + DebugTrace + #13#10#13#10 +
      'Important: the PostgreSQL installer log can contain sensitive installation values. Do not share it without redacting passwords.' + #13#10#13#10 +
      'The verified PostgreSQL installer remains cached and will be reused on the next retry:' + #13#10 + PgInstaller,
      mbCriticalError, MB_OK, MB_OK);
    RaiseException('PostgreSQL prerequisite installation failed. See: ' + DebugTrace);
  end
  else if FileExists(DebugTrace) then
  begin
    // EDB troubleshooting logs may contain the superuser password. Do not retain
    // the trace after a successful installation.
    if not DeleteFile(DebugTrace) then
    begin
      HardenFileForSystemAndAdmins(DebugTrace);
      Log('Warning: PostgreSQL debug trace could not be deleted after successful installation; ACLs were restricted.');
    end;
  end;

  ManagedPostgres := True;
  DbHost := '127.0.0.1';
  ExistingSuperuserName := 'postgres';
  ExistingSuperuserPassword := GeneratedPostgresAdminPassword;

  // Rediscover the EDB installation from its registry metadata instead of assuming
  // a fixed C:\Program Files path. The service may still be starting at this point.
  PostgresDetectionPerformed := False;
  DetectPostgreSQLState();
  if (DetectedPgMajor <> 16) or (DetectedPgBinDir = '') or (DetectedPgPort <> AssignedDbPort) then
    RaiseException('PostgreSQL installed successfully, but its registry metadata could not be reconciled with the requested managed instance.');
  WaitForManagedPostgres;
end;

procedure ProvisionDatabaseAndUser;
var
  PsqlExe, ScriptFile, SqlText: String;
begin
  if IsUpgrade then Exit;

  PsqlExe := AddBackslash(DetectedPgBinDir) + 'psql.exe';
  if not FileExists(PsqlExe) then
    RaiseException('PostgreSQL command line client was not found: ' + PsqlExe);

  if DetectedPgState = PG_STATE_COMPATIBLE then
  begin
    if ExistingSuperuserName = '' then ExistingSuperuserName := 'postgres';
    if ExistingSuperuserPassword = '' then
      RaiseException('Existing PostgreSQL administrator password was not provided.');
  end;

  ScriptFile := AddBackslash(GetSecureTempDir()) + 'provision.sql';
  SqlText := '\set ON_ERROR_STOP on' + #13#10 +
    'DO $$ BEGIN' + #13#10 +
    '  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = ''laundryms_app'') THEN' + #13#10 +
    '    CREATE ROLE laundryms_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;' + #13#10 +
    '  END IF;' + #13#10 +
    'END $$;' + #13#10 +
    'ALTER ROLE laundryms_app WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD ''' + EscapeSqlLiteral(GeneratedAppPassword) + ''';' + #13#10 +
    'SELECT ''CREATE DATABASE laundryms OWNER laundryms_app'' WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = ''laundryms'')\gexec' + #13#10 +
    'ALTER DATABASE laundryms OWNER TO laundryms_app;' + #13#10 +
    '\connect laundryms' + #13#10 +
    'ALTER SCHEMA public OWNER TO laundryms_app;' + #13#10 +
    'GRANT USAGE, CREATE ON SCHEMA public TO laundryms_app;' + #13#10;

  if not SaveStringToFile(ScriptFile, SqlText, False) then
    RaiseException('Could not write PostgreSQL provisioning script.');
  HardenFileForSystemAndAdmins(ScriptFile);

  WizardForm.StatusLabel.Caption := 'Provisioning scoped PostgreSQL database and role...';
  if not RunPsqlWithPgPass(PsqlExe, DbHost, AssignedDbPort, ExistingSuperuserName,
      ExistingSuperuserPassword, 'postgres', '-v ON_ERROR_STOP=1 -f "' + ScriptFile + '"') then
  begin
    DeleteFile(ScriptFile);
    RaiseException('PostgreSQL provisioning failed. No application service will be installed.');
  end;
  DeleteFile(ScriptFile);

  if not RunPsqlWithPgPass(PsqlExe, DbHost, AssignedDbPort, 'laundryms_app',
      GeneratedAppPassword, 'laundryms', '-tAc "SELECT 1"') then
    RaiseException('Provisioned laundryms_app credentials could not connect to the laundryms database.');

  ExistingSuperuserPassword := '';
  GeneratedPostgresAdminPassword := '';
  GeneratedPostgresServicePassword := '';
end;

function EscapeYamlDoubleQuoted(Value: String): String;
var
  i: Integer;
begin
  Result := '';
  for i := 1 to Length(Value) do
  begin
    if Value[i] = '\' then
      Result := Result + '\\'
    else if Value[i] = '"' then
      Result := Result + '\"'
    else
      Result := Result + Value[i];
  end;
end;

function GetTunnelConfigPath(): String;
begin
  Result := ExpandConstant('{commonappdata}\LaundryShopMS\tunnel\ngrok.yml');
end;

function GetNgrokCachedArchivePath(): String;
begin
  Result := ExpandConstant('{commonappdata}\LaundryShopMS\cache\{#NgrokInstallerFile}');
end;

function VerifyNgrokArchive(FileName: String): Boolean;
begin
  Result := FileExists(FileName) and
    (CompareText(GetSHA256OfFile(FileName), '{#NgrokInstallerSha256}') = 0);
end;

function VerifyNgrokAuthenticode(NgrokExe: String): Boolean;
var
  PsCommand: String;
  ResultCode: Integer;
begin
  PsCommand := '$s=Get-AuthenticodeSignature -LiteralPath ''' + EscapePowerShellSingleQuoted(NgrokExe) + ''';' +
    'if(($s.Status -eq ''Valid'') -and ($s.SignerCertificate) -and ($s.SignerCertificate.Subject -match ''ngrok'')){exit 0}else{exit 1}';
  Result := Exec('powershell.exe', '-NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "' + PsCommand + '"',
    '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
end;

function EnsureNgrokPayload(): Boolean;
var
  CacheFile, TempFile, NgrokDir, NgrokExe, PsCommand: String;
  ResultCode: Integer;
begin
  Result := False;
  if not TunnelEnabled then Exit;

  HardenDirectoryForSystemAndAdmins(ExpandConstant('{commonappdata}\LaundryShopMS\cache'));
  CacheFile := GetNgrokCachedArchivePath();
  NgrokDir := GetTargetAppDir() + '\tunnel';
  NgrokExe := NgrokDir + '\ngrok.exe';

  if not ForceDirectories(NgrokDir) then
  begin
    TunnelWarning := 'Remote access was selected, but Setup could not create the Ngrok program directory. Local installation will continue.';
    Exit;
  end;

  if not VerifyNgrokArchive(CacheFile) then
  begin
    if FileExists(CacheFile) then DeleteFile(CacheFile);
    WizardForm.StatusLabel.Caption := 'Downloading verified Ngrok {#NgrokVersion} tunnel agent...';
    try
      DownloadTemporaryFile('{#NgrokInstallerUrl}', '{#NgrokInstallerFile}', '{#NgrokInstallerSha256}', nil);
    except
      TunnelWarning := 'Laundry Shop MS will be installed locally, but the Ngrok tunnel agent could not be downloaded or failed SHA-256 verification. Run Setup again when internet access is available to retry remote access.';
      Exit;
    end;
    TempFile := ExpandConstant('{tmp}\{#NgrokInstallerFile}');
    if not FileCopy(TempFile, CacheFile, False) or not VerifyNgrokArchive(CacheFile) then
    begin
      DeleteFile(CacheFile);
      TunnelWarning := 'Laundry Shop MS will be installed locally, but the verified Ngrok tunnel package could not be persisted safely. Remote access was not started.';
      Exit;
    end;
  end;

  // Re-apply the restrictive ACL even to an already-cached valid archive.
  HardenFileForSystemAndAdmins(CacheFile);

  DeleteFile(NgrokExe);
  PsCommand := 'Expand-Archive -LiteralPath ''' + EscapePowerShellSingleQuoted(CacheFile) + ''' -DestinationPath ''' +
    EscapePowerShellSingleQuoted(NgrokDir) + ''' -Force';
  if not Exec('powershell.exe', '-NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "' + PsCommand + '"',
      '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) or not FileExists(NgrokExe) then
  begin
    TunnelWarning := 'Laundry Shop MS will be installed locally, but the verified Ngrok archive could not be extracted. Remote access was not started.';
    Exit;
  end;

  if not VerifyNgrokAuthenticode(NgrokExe) then
  begin
    DeleteFile(NgrokExe);
    TunnelWarning := 'The Ngrok executable did not pass Windows Authenticode publisher validation. Remote access was disabled; local operation is unaffected.';
    Exit;
  end;

  TunnelPayloadReady := True;
  Result := True;
end;

procedure WriteTunnelConfiguration;
var
  ConfigFile, ConfigText: String;
begin
  if not TunnelEnabled then Exit;
  if IsUpgrade then
  begin
    if not FileExists(GetTunnelConfigPath()) then
    begin
      TunnelWarning := 'Remote access was previously enabled, but the protected Ngrok configuration is missing. Local installation will continue; reconfigure Ngrok after Setup.';
      TunnelEnabled := False;
    end;
    Exit;
  end;

  if (TunnelAuthtoken = '') or (TunnelPublicUrl = '') then
    RaiseException('Ngrok remote access was selected but its authtoken/static domain was not configured.');

  EnsureTunnelDataSecurity;
  ConfigFile := GetTunnelConfigPath();
  ConfigText := 'version: "3"' + #13#10 +
    'agent:' + #13#10 +
    '  authtoken: "' + EscapeYamlDoubleQuoted(TunnelAuthtoken) + '"' + #13#10 +
    '  update_check: false' + #13#10 +
    '  remote_management: false' + #13#10 +
    '  web_addr: false' + #13#10 +
    'endpoints:' + #13#10 +
    '  - name: laundryms' + #13#10 +
    '    url: "' + EscapeYamlDoubleQuoted(TunnelPublicUrl) + '"' + #13#10 +
    '    upstream:' + #13#10 +
    '      url: "http://127.0.0.1:8765"' + #13#10;

  if not SaveStringToFile(ConfigFile, ConfigText, False) then
    RaiseException('Could not write protected Ngrok tunnel configuration.');
  HardenFileForSystemAndAdmins(ConfigFile);
  TunnelAuthtoken := '';
  if TunnelConfigPage <> nil then
    TunnelConfigPage.Values[0] := '';
end;

function ManageTunnelServiceCommand(Command: String; RequireSuccess: Boolean): Boolean;
var
  ResultCode: Integer;
  ServiceExe, ErrorMsg: String;
begin
  Result := False;
  ServiceExe := GetTargetAppDir() + '\laundryms-tunnel-service.exe';
  if not FileExists(ServiceExe) then
  begin
    ErrorMsg := 'Tunnel service executable is missing: ' + ServiceExe;
    Log(ErrorMsg);
    if RequireSuccess then RaiseException(ErrorMsg);
    Exit;
  end;

  if not Exec(ServiceExe, Command, '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    ErrorMsg := 'LaundryShopMSTunnel service command could not be launched: ' + Command + '.';
    Log(ErrorMsg);
    if RequireSuccess then RaiseException(ErrorMsg);
    Exit;
  end;

  if ResultCode <> 0 then
  begin
    ErrorMsg := 'LaundryShopMSTunnel service command failed: ' + Command + ' (exit code ' + IntToStr(ResultCode) + ').';
    Log(ErrorMsg);
    if RequireSuccess then RaiseException(ErrorMsg);
    Exit;
  end;

  Log('LaundryShopMSTunnel service command succeeded: ' + Command + '.');
  Result := True;
end;

procedure StopTunnelServiceSafelyForUpgrade;
var
  State, i: Integer;
begin
  if not TunnelEnabled then Exit;
  State := GetTunnelServiceState();
  if State = SERVICE_NOT_INSTALLED then Exit;
  if State = SERVICE_STOPPED then Exit;
  if (State = SERVICE_RUNNING) or (State = SERVICE_START_PENDING) or
     (State = SERVICE_OTHER_PENDING) or (State = SERVICE_PAUSED) then
    ManageTunnelServiceCommand('stop', False);
  for i := 1 to (SERVICE_STATE_TIMEOUT_MS div 500) do
  begin
    State := GetTunnelServiceState();
    if (State = SERVICE_STOPPED) or (State = SERVICE_NOT_INSTALLED) then Exit;
    Sleep(500);
  end;
  TunnelWarning := 'The existing Ngrok tunnel service did not stop cleanly. Local application upgrade will continue, but remote access may need manual restart.';
end;

function RefreshOrRepairTunnelServiceRegistration(): Boolean;
var
  State, i, MaxPolls: Integer;
begin
  Result := False;
  State := GetTunnelServiceState();
  MaxPolls := SERVICE_STATE_TIMEOUT_MS div 500;

  if State = SERVICE_NOT_INSTALLED then
  begin
    Result := ManageTunnelServiceCommand('install', False);
    Exit;
  end;

  if State <> SERVICE_STOPPED then
  begin
    Log('Tunnel upgrade repair skipped because LaundryShopMSTunnel is not STOPPED.');
    Exit;
  end;

  if ManageTunnelServiceCommand('refresh', False) then
  begin
    Result := True;
    Exit;
  end;

  Log('Tunnel upgrade: WinSW refresh failed; attempting safe tunnel service re-registration.');
  ManageTunnelServiceCommand('uninstall', False);
  for i := 1 to MaxPolls do
  begin
    State := GetTunnelServiceState();
    if State = SERVICE_NOT_INSTALLED then Break;
    Sleep(500);
  end;
  if GetTunnelServiceState() <> SERVICE_NOT_INSTALLED then Exit;

  if not ManageTunnelServiceCommand('install', False) then Exit;
  for i := 1 to MaxPolls do
  begin
    State := GetTunnelServiceState();
    if (State = SERVICE_STOPPED) or (State = SERVICE_RUNNING) then
    begin
      Result := True;
      Exit;
    end;
    Sleep(500);
  end;
end;

function ValidateNgrokConfiguration(): Boolean;
var
  NgrokExe, ConfigFile: String;
  ResultCode: Integer;
begin
  Result := False;
  NgrokExe := GetTargetAppDir() + '\tunnel\ngrok.exe';
  ConfigFile := GetTunnelConfigPath();
  if not FileExists(NgrokExe) or not FileExists(ConfigFile) then Exit;
  Result := Exec(NgrokExe, 'config check --config "' + ConfigFile + '"', '', SW_HIDE,
    ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
end;

function VerifyTunnelRemoteHealth(): Boolean;
var
  WinHttp: Variant;
  i: Integer;
  HealthUrl: String;
begin
  Result := False;
  if TunnelPublicUrl = '' then
  begin
    RegQueryStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'TunnelPublicUrl', TunnelPublicUrl);
  end;
  if TunnelPublicUrl = '' then Exit;
  HealthUrl := NormalizeTunnelPublicUrl(TunnelPublicUrl) + '/api/v1/health';

  try
    WinHttp := CreateOleObject('WinHttp.WinHttpRequest.5.1');
    WinHttp.SetTimeouts(2000, 3000, 3000, 3000);
    for i := 1 to TUNNEL_HEALTH_ATTEMPTS do
    begin
      try
        WinHttp.Open('GET', HealthUrl, False);
        WinHttp.Send('');
        if WinHttp.Status = 200 then
        begin
          Result := True;
          Exit;
        end;
      except
      end;
      Sleep(TUNNEL_HEALTH_INTERVAL_MS);
    end;
  except
  end;
end;

procedure ConfigureAndStartTunnel;
var
  State: Integer;
begin
  if not TunnelEnabled then Exit;
  if not FileExists(GetTargetAppDir() + '\tunnel\ngrok.exe') then
  begin
    if TunnelWarning = '' then
      TunnelWarning := 'Ngrok remote access was configured, but the tunnel agent is not installed. Local operation is unaffected; rerun Setup with internet access to retry.';
    Exit;
  end;

  if not ValidateNgrokConfiguration() then
  begin
    TunnelWarning := 'Ngrok configuration validation failed. Laundry Shop MS is installed and healthy locally, but remote access was not started. Check C:\ProgramData\LaundryShopMS\tunnel\ngrok.yml.';
    Exit;
  end;

  if (not IsUpgrade) or IsRecoverableLegacyDeployment then
  begin
    if not ManageTunnelServiceCommand('install', False) then
    begin
      TunnelWarning := 'Laundry Shop MS installed successfully, but the Ngrok tunnel Windows service could not be installed. Local operation is unaffected.';
      Exit;
    end;
    if not ManageTunnelServiceCommand('start', False) then
    begin
      TunnelWarning := 'Laundry Shop MS installed successfully, but the Ngrok tunnel Windows service could not be started. Local operation is unaffected.';
      Exit;
    end;
  end
  else
  begin
    if not RefreshOrRepairTunnelServiceRegistration() then
    begin
      TunnelWarning := 'Ngrok tunnel service could not be refreshed or safely re-registered after upgrade. Local operation is unaffected.';
      Exit;
    end;
    State := GetTunnelServiceState();
    if State = SERVICE_STOPPED then
    begin
      if not ManageTunnelServiceCommand('start', False) then
      begin
        TunnelWarning := 'Ngrok tunnel service could not be started after upgrade. Local operation is unaffected.';
        Exit;
      end;
    end
    else if State <> SERVICE_RUNNING then
    begin
      TunnelWarning := 'Ngrok tunnel service registration did not stabilize after upgrade. Local operation is unaffected.';
      Exit;
    end;
  end;

  if not VerifyTunnelRemoteHealth() then
    TunnelWarning := 'Laundry Shop MS is healthy locally, but the configured Ngrok public endpoint did not pass the remote health check. Check internet connectivity, the Ngrok authtoken/static domain, and the Vercel UPSTREAM_API_URL. You can retry remote access later without reinstalling the local application.';
end;

procedure ConfigureOptionalTunnelAfterLocalHealth;
begin
  if not TunnelEnabled then Exit;
  try
    WriteTunnelConfiguration;
    if not TunnelEnabled then Exit;
    if not EnsureNgrokPayload() then Exit;
    ConfigureAndStartTunnel;
  except
    TunnelWarning := 'Laundry Shop MS is installed and healthy locally, but optional Ngrok remote-access setup failed: ' + GetExceptionMessage;
    TunnelAuthtoken := '';
    if TunnelConfigPage <> nil then
      TunnelConfigPage.Values[0] := '';
  end;
end;

function UpsertPropertyInFile(FilePath, PropName, PropValue: String): Boolean;
var
  Lines: TArrayOfString;
  i, EqualPos: Integer;
  Line, Key, Text: String;
  Found: Boolean;
begin
  Result := False;
  Text := '';
  Found := False;
  if FileExists(FilePath) then
  begin
    if not LoadStringsFromFile(FilePath, Lines) then Exit;
    for i := 0 to GetArrayLength(Lines) - 1 do
    begin
      Line := Lines[i];
      EqualPos := Pos('=', Trim(Line));
      if (EqualPos > 1) and (Pos('#', Trim(Line)) <> 1) and (Pos('!', Trim(Line)) <> 1) then
      begin
        Key := Trim(Copy(Trim(Line), 1, EqualPos - 1));
        if CompareText(Key, PropName) = 0 then
        begin
          Line := PropName + '=' + PropValue;
          Found := True;
        end;
      end;
      Text := Text + Line + #13#10;
    end;
  end;
  if not Found then
    Text := Text + PropName + '=' + PropValue + #13#10;
  Result := SaveStringToFile(FilePath, Text, False);
end;

function BuildProductionAllowedOrigins(): String;
begin
  Result := 'http://localhost:8765,http://127.0.0.1:8765';
  if TunnelEnabled then
  begin
    if TunnelPublicUrl <> '' then Result := Result + ',' + NormalizeTunnelPublicUrl(TunnelPublicUrl);
    if RemoteFrontendUrl <> '' then Result := Result + ',' + NormalizeTunnelPublicUrl(RemoteFrontendUrl);
  end;
end;

procedure ConfigureProductionProperties;
var
  ConfigDir, ConfigFile, ConfigText, AllowedOrigins: String;
begin
  EnsureProgramDataSecurity;
  ConfigDir := ExpandConstant('{commonappdata}\LaundryShopMS\config');
  ConfigFile := ConfigDir + '\application-prod.properties';
  AllowedOrigins := BuildProductionAllowedOrigins();

  if IsUpgrade then
  begin
    if not FileExists(ConfigFile) then
      RaiseException('Upgrade configuration disappeared before file replacement.');
    if TunnelEnabled and ((TunnelPublicUrl = '') or (RemoteFrontendUrl = '')) then
      RaiseException('Remote-access upgrade is missing the Ngrok or remote frontend HTTPS origin required for production CORS.');
    if not UpsertPropertyInFile(ConfigFile, 'server.forward-headers-strategy', 'framework') then
      RaiseException('Could not update forwarded-header handling in production configuration.');
    if not UpsertPropertyInFile(ConfigFile, 'app.security.allowed-origin', AllowedOrigins) then
      RaiseException('Could not update production CORS origins.');
    HardenFileForSystemAndAdmins(ConfigFile);
    Exit;
  end;

  if TunnelEnabled and ((TunnelPublicUrl = '') or (RemoteFrontendUrl = '')) then
    RaiseException('Ngrok remote access requires both the static Ngrok HTTPS domain and the deployed remote frontend HTTPS origin.');

  ConfigText := '# Laundry Shop Management System - Secure Production Configuration' + #13#10 +
    'spring.datasource.url=jdbc:postgresql://' + DbHost + ':' + IntToStr(AssignedDbPort) + '/laundryms' + #13#10 +
    'spring.datasource.username=laundryms_app' + #13#10 +
    'spring.datasource.password=' + GeneratedAppPassword + #13#10 +
    'spring.flyway.enabled=true' + #13#10 +
    'security.jwt.secret-key=' + GeneratedJwtSecret + #13#10 +
    'server.port=8765' + #13#10 +
    'server.address=127.0.0.1' + #13#10 +
    'server.forward-headers-strategy=framework' + #13#10 +
    'app.security.allowed-origin=' + AllowedOrigins + #13#10;

  if not SaveStringToFile(ConfigFile, ConfigText, False) then
    RaiseException('Could not write production configuration.');
  HardenFileForSystemAndAdmins(ConfigFile);
end;

function ManageServiceCommand(Command: String; RequireSuccess: Boolean): Boolean;
var
  ResultCode: Integer;
  ServiceExe, ErrorMsg: String;
begin
  Result := False;
  ServiceExe := GetTargetAppDir() + '\laundryms-service.exe';
  if not FileExists(ServiceExe) then
  begin
    ErrorMsg := 'Service executable is missing: ' + ServiceExe;
    Log(ErrorMsg);
    if RequireSuccess then RaiseException(ErrorMsg);
    Exit;
  end;

  if not Exec(ServiceExe, Command, '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    ErrorMsg := 'LaundryShopMS service command could not be launched: ' + Command + '.';
    Log(ErrorMsg);
    if RequireSuccess then RaiseException(ErrorMsg);
    Exit;
  end;

  if ResultCode <> 0 then
  begin
    ErrorMsg := 'LaundryShopMS service command failed: ' + Command + ' (exit code ' + IntToStr(ResultCode) + ').';
    Log(ErrorMsg);
    if RequireSuccess then RaiseException(ErrorMsg);
    Exit;
  end;

  Log('LaundryShopMS service command succeeded: ' + Command + '.');
  Result := True;
end;

procedure StopServiceSafelyForUpgrade;
var
  SvcState, i, MaxPolls: Integer;
begin
  SvcState := GetWindowsServiceState();
  if IsRecoverableLegacyDeployment and (SvcState = SERVICE_NOT_INSTALLED) then Exit;
  if SvcState = SERVICE_STOPPED then Exit;
  if (SvcState = SERVICE_UNKNOWN) or (SvcState = SERVICE_OTHER_PENDING) or (SvcState = SERVICE_PAUSED) or
     (SvcState = SERVICE_NOT_INSTALLED) then
    RaiseException('Windows service is not in a safe state for upgrade.');

  MaxPolls := SERVICE_STATE_TIMEOUT_MS div 500;
  if SvcState = SERVICE_START_PENDING then
  begin
    for i := 1 to MaxPolls do
    begin
      Sleep(500);
      SvcState := GetWindowsServiceState();
      if (SvcState = SERVICE_RUNNING) or (SvcState = SERVICE_STOPPED) then Break;
      if (SvcState = SERVICE_UNKNOWN) or (SvcState = SERVICE_OTHER_PENDING) or (SvcState = SERVICE_PAUSED) then
        RaiseException('Service entered an unsafe state while preparing upgrade.');
    end;
  end;

  if SvcState = SERVICE_RUNNING then
    ManageServiceCommand('stop', True);

  for i := 1 to MaxPolls do
  begin
    if GetWindowsServiceState() = SERVICE_STOPPED then Exit;
    Sleep(500);
  end;
  RaiseException('LaundryShopMS service did not reach STOPPED state before upgrade.');
end;

procedure RefreshOrRepairApplicationServiceRegistration;
var
  SvcState, i, MaxPolls: Integer;
begin
  SvcState := GetWindowsServiceState();
  if SvcState <> SERVICE_STOPPED then
    RaiseException('Application service must be STOPPED before refresh/repair.');

  if ManageServiceCommand('refresh', False) then
  begin
    Log('Upgrade: WinSW service refresh succeeded.');
    Exit;
  end;

  Log('Upgrade: WinSW refresh failed; attempting safe service re-registration without touching application data or PostgreSQL.');
  MaxPolls := SERVICE_STATE_TIMEOUT_MS div 500;

  // The service is already stopped. Removing only the SCM registration is safe;
  // ProgramData, PostgreSQL, backups, secrets, and Ngrok configuration are untouched.
  // WinSW can occasionally return a non-zero uninstall result while SCM is still
  // completing service removal. Poll SCM instead of trusting only the wrapper exit code.
  ManageServiceCommand('uninstall', False);
  for i := 1 to MaxPolls do
  begin
    SvcState := GetWindowsServiceState();
    if SvcState = SERVICE_NOT_INSTALLED then Break;
    Sleep(500);
  end;
  if GetWindowsServiceState() <> SERVICE_NOT_INSTALLED then
    RaiseException('Timed out waiting for the old LaundryShopMS service registration to be removed.');

  // As above, the authoritative outcome is the SCM state after the command.
  ManageServiceCommand('install', False);
  for i := 1 to MaxPolls do
  begin
    SvcState := GetWindowsServiceState();
    if (SvcState = SERVICE_STOPPED) or (SvcState = SERVICE_RUNNING) then
    begin
      Log('Upgrade: LaundryShopMS service registration repaired successfully.');
      Exit;
    end;
    Sleep(500);
  end;

  RaiseException('LaundryShopMS service re-registration did not stabilize after WinSW refresh failure.');
end;

procedure StartApplicationServiceAfterUpgrade;
var
  SvcState: Integer;
begin
  SvcState := GetWindowsServiceState();
  if SvcState = SERVICE_STOPPED then
    ManageServiceCommand('start', True)
  else if SvcState <> SERVICE_RUNNING then
    RaiseException('LaundryShopMS service is not in a startable state after upgrade service registration refresh/repair.');
end;

procedure VerifyBundledRuntime;
var
  JavaExe: String;
  ResultCode: Integer;
begin
  JavaExe := GetTargetAppDir() + '\runtime\bin\java.exe';
  if not FileExists(JavaExe) then
    RaiseException('Bundled Java runtime is missing: ' + JavaExe);
  if not Exec(JavaExe, '-version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    RaiseException('Bundled Java runtime failed validation.');
end;

procedure VerifyServiceHealth;
var
  WinHttp: Variant;
  i, SvcState: Integer;
  IsRunning, IsHealthy: Boolean;
begin
  IsRunning := False;
  for i := 1 to (SERVICE_STATE_TIMEOUT_MS div 500) do
  begin
    SvcState := GetWindowsServiceState();
    if SvcState = SERVICE_RUNNING then
    begin
      IsRunning := True;
      Break;
    end;
    if (SvcState = SERVICE_NOT_INSTALLED) or (SvcState = SERVICE_UNKNOWN) or (SvcState = SERVICE_PAUSED) then Break;
    Sleep(500);
  end;
  if not IsRunning then RaiseException('Windows SCM did not report LaundryShopMS as RUNNING.');

  IsHealthy := False;
  try
    WinHttp := CreateOleObject('WinHttp.WinHttpRequest.5.1');
    WinHttp.SetTimeouts(1000, 1000, 1000, 1000);
    for i := 1 to HEALTH_CHECK_ATTEMPTS do
    begin
      try
        WinHttp.Open('GET', 'http://127.0.0.1:8765/api/v1/health', False);
        WinHttp.Send('');
        if WinHttp.Status = 200 then
        begin
          IsHealthy := True;
          Break;
        end;
      except
      end;
      Sleep(HEALTH_CHECK_INTERVAL_MS);
    end;
  except
  end;
  if not IsHealthy then
    RaiseException('LaundryShopMS application readiness endpoint did not return HTTP 200. Check service logs in C:\ProgramData\LaundryShopMS\logs.');
end;

procedure WriteInstallerRegistryMetadata;
var
  ManagedStr: String;
begin
  RegWriteStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'InstalledVersion', '{#AppVersion}');
  RegWriteStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'InstallDir', ExpandConstant('{app}'));
  RegWriteStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'DbHost', DbHost);
  RegWriteStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'DbPort', IntToStr(AssignedDbPort));
  if DetectedPgMajor > 0 then
    RegWriteStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'PgMajor', IntToStr(DetectedPgMajor));
  if DetectedPgBinDir <> '' then
    RegWriteStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'PgBinDir', DetectedPgBinDir);
  if ManagedPostgres then ManagedStr := 'true' else ManagedStr := 'false';
  RegWriteStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'ManagedPostgres', ManagedStr);
  if TunnelEnabled then
  begin
    RegWriteStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'TunnelEnabled', 'true');
    if TunnelPublicUrl <> '' then
      RegWriteStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'TunnelPublicUrl', TunnelPublicUrl);
    if RemoteFrontendUrl <> '' then
      RegWriteStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'RemoteFrontendUrl', RemoteFrontendUrl);
  end
  else
  begin
    RegWriteStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'TunnelEnabled', 'false');
    RegDeleteValue(HKLM, 'Software\Himotech\LaundryShopMS', 'TunnelPublicUrl');
    RegDeleteValue(HKLM, 'Software\Himotech\LaundryShopMS', 'RemoteFrontendUrl');
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ConfigFile: String;
  SvcState: Integer;
begin
  if CurStep = ssInstall then
  begin
    PrepareCredentials;
    ConfigFile := ExpandConstant('{commonappdata}\LaundryShopMS\config\application-prod.properties');
    if (not IsUpgrade) and FileExists(ConfigFile) then
      RaiseException('Safety invariant failed: clean install cannot overwrite an existing production configuration.');
    if IsUpgrade and ((GeneratedAppPassword = '') or (GeneratedJwtSecret = '')) then
      RaiseException('Safety invariant failed: upgrade secrets are missing.');

    if IsUpgrade then
    begin
      StopTunnelServiceSafelyForUpgrade;
      StopServiceSafelyForUpgrade;
    end
    else
    begin
      RevalidatePostgresPlan;
      InstallPostgreSQLIfNeeded;
      ProvisionDatabaseAndUser;
    end;
    ConfigureProductionProperties;
  end;

  if CurStep = ssPostInstall then
  begin
    EnsureProgramDataSecurity;
    VerifyBundledRuntime;

    if (not IsUpgrade) or IsRecoverableLegacyDeployment then
    begin
      ManageServiceCommand('install', True);
      ManageServiceCommand('start', True);
    end
    else
    begin
      SvcState := GetWindowsServiceState();
      if SvcState <> SERVICE_STOPPED then
        RaiseException('Normal upgrade expected the registered service to remain STOPPED before refresh/repair.');
      RefreshOrRepairApplicationServiceRegistration;
      StartApplicationServiceAfterUpgrade;
    end;

    VerifyServiceHealth;
    ConfigureOptionalTunnelAfterLocalHealth;
    WriteInstallerRegistryMetadata;
    if TunnelWarning <> '' then
      SuppressibleMsgBox(TunnelWarning, mbInformation, MB_OK, MB_OK);
  end;
end;

procedure InitializeUninstallProgressForm;
begin
  RemoveDataCheckBox := TNewCheckBox.Create(UninstallProgressForm);
  RemoveDataCheckBox.Parent := UninstallProgressForm.InnerPage;
  RemoveDataCheckBox.Left := ScaleX(0);
  RemoveDataCheckBox.Top := ScaleY(130);
  RemoveDataCheckBox.Width := UninstallProgressForm.InnerPage.ClientWidth;
  RemoveDataCheckBox.Caption := 'Remove Laundry Shop MS database and local backups/customer data (irreversible)';
  RemoveDataCheckBox.Checked := False;
end;

procedure StopAndUnregisterTunnelForUninstall;
var
  ServiceExe: String;
  ResultCode, i, State: Integer;
begin
  ServiceExe := GetTargetAppDir() + '\laundryms-tunnel-service.exe';
  State := GetTunnelServiceState();
  if (State = SERVICE_RUNNING) or (State = SERVICE_START_PENDING) then
  begin
    if FileExists(ServiceExe) then
      Exec(ServiceExe, 'stop', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    for i := 1 to (SERVICE_STATE_TIMEOUT_MS div 500) do
    begin
      State := GetTunnelServiceState();
      if (State = SERVICE_STOPPED) or (State = SERVICE_NOT_INSTALLED) then Break;
      Sleep(500);
    end;
  end;
  if FileExists(ServiceExe) and (GetTunnelServiceState() <> SERVICE_NOT_INSTALLED) then
    Exec(ServiceExe, 'uninstall', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;

procedure StopAndUnregisterServiceForUninstall;
var
  ServiceExe: String;
  ResultCode, i: Integer;
  State: Integer;
begin
  ServiceExe := GetTargetAppDir() + '\laundryms-service.exe';
  State := GetWindowsServiceState();
  if (State = SERVICE_RUNNING) or (State = SERVICE_START_PENDING) then
  begin
    if FileExists(ServiceExe) then
      Exec(ServiceExe, 'stop', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    for i := 1 to (SERVICE_STATE_TIMEOUT_MS div 500) do
    begin
      if GetWindowsServiceState() = SERVICE_STOPPED then Break;
      Sleep(500);
    end;
  end;
  if FileExists(ServiceExe) and (GetWindowsServiceState() <> SERVICE_NOT_INSTALLED) then
    Exec(ServiceExe, 'uninstall', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;

function FindPsqlForUninstall: String;
var
  BinDir: String;
begin
  Result := '';
  if RegQueryStringValue(HKLM, 'Software\Himotech\LaundryShopMS', 'PgBinDir', BinDir) then
  begin
    if FileExists(AddBackslash(BinDir) + 'psql.exe') then
      Result := AddBackslash(BinDir) + 'psql.exe';
  end;
end;

procedure RemoveDatabaseForUninstall;
var
  ConfigFile, JdbcUrl, Password, Host, PsqlExe: String;
  Port: Integer;
begin
  ConfigFile := ExpandConstant('{commonappdata}\LaundryShopMS\config\application-prod.properties');
  if not FileExists(ConfigFile) then
    RaiseException('Cannot remove database data because the production configuration file is missing.');
  Password := GetPropertyFromFile(ConfigFile, 'spring.datasource.password');
  JdbcUrl := GetPropertyFromFile(ConfigFile, 'spring.datasource.url');
  Host := ExtractHostFromJdbcUrl(JdbcUrl);
  Port := ExtractPortFromJdbcUrl(JdbcUrl);
  PsqlExe := FindPsqlForUninstall;
  if (Password = '') or (PsqlExe = '') then
    RaiseException('Cannot remove database data because PostgreSQL connection metadata is incomplete.');

  if not RunPsqlWithPgPass(PsqlExe, Host, Port, 'laundryms_app', Password, 'postgres',
      '-v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS laundryms WITH (FORCE);"') then
    RaiseException('Database removal failed. The application database was retained.');
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  RemoveData: Boolean;
  RootDir: String;
begin
  if CurUninstallStep = usUninstall then
  begin
    RemoveData := (RemoveDataCheckBox <> nil) and RemoveDataCheckBox.Checked;
    StopAndUnregisterTunnelForUninstall;
    StopAndUnregisterServiceForUninstall;
    if RemoveData then
      RemoveDatabaseForUninstall;
  end;

  if CurUninstallStep = usPostUninstall then
  begin
    RemoveData := (RemoveDataCheckBox <> nil) and RemoveDataCheckBox.Checked;
    RootDir := ExpandConstant('{commonappdata}\LaundryShopMS');
    // ngrok.exe is downloaded/extracted at Setup runtime rather than declared in [Files],
    // so remove that application payload explicitly on every uninstall. Protected
    // ProgramData tunnel configuration/cache remains governed by the data-retention choice.
    DelTree(GetTargetAppDir() + '\tunnel', True, True, True);
    if RemoveData then
    begin
      DelTree(RootDir, True, True, True);
      RegDeleteKeyIncludingSubkeys(HKLM, 'Software\Himotech\LaundryShopMS');
    end
    else
    begin
      // Retain protected config, backups, and non-secret metadata so a reinstall can
      // reattach to the retained database without needing the discarded PostgreSQL
      // superuser password. Logs may be cleaned safely.
      DelTree(RootDir + '\logs', True, True, True);
    end;
  end;
end;
