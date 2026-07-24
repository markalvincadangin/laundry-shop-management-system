; Inno Setup Script for Laundry Shop Management System
; Produces a professional single-file .exe installer with wizard UI
; Requires: Inno Setup 6+ (https://jrsoftware.org/isinfo.php)

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

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
; Application JAR
Source: "..\backend\target\deploy-staging\laundryms.jar"; DestDir: "{app}"; Flags: ignoreversion

; WinSW Service Wrapper
Source: "..\backend\target\deploy-staging\laundryms-service.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "resources\laundryms-service.xml"; DestDir: "{app}"; Flags: ignoreversion

; Launcher and Icon
Source: "resources\start.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "resources\app.ico"; DestDir: "{app}"; Flags: ignoreversion

[Dirs]
Name: "{app}\logs"

[Icons]
; Desktop shortcut - opens browser to the app
Name: "{commondesktop}\{#AppName}"; Filename: "{#AppURL}"; IconFilename: "{app}\app.ico"; Comment: "Open {#AppName}"

; Start Menu shortcuts
Name: "{group}\{#AppName}"; Filename: "{#AppURL}"; IconFilename: "{app}\app.ico"; Comment: "Open {#AppName}"
Name: "{group}\Start Server (Console)"; Filename: "{app}\start.bat"; IconFilename: "{app}\app.ico"; Comment: "Start {#AppName} with console output"
Name: "{group}\Uninstall {#AppName}"; Filename: "{uninstallexe}"

[Run]
; Register and start the Windows Service after installation
Filename: "{app}\laundryms-service.exe"; Parameters: "install"; StatusMsg: "Registering Windows Service..."; Flags: runhidden waituntilterminated
Filename: "{app}\laundryms-service.exe"; Parameters: "start"; StatusMsg: "Starting {#AppName}..."; Flags: runhidden waituntilterminated
; Open browser after install
Filename: "{#AppURL}"; Flags: shellexec postinstall skipifsilent; Description: "Open {#AppName} in browser"

[UninstallRun]
; Stop and unregister the Windows Service before uninstallation
Filename: "{app}\laundryms-service.exe"; Parameters: "stop"; Flags: runhidden waituntilterminated
Filename: "{app}\laundryms-service.exe"; Parameters: "uninstall"; Flags: runhidden waituntilterminated

[Code]
// Check if Java is installed before proceeding
function InitializeSetup(): Boolean;
var
  JavaPath: String;
begin
  Result := True;
  if not RegQueryStringValue(HKLM, 'SOFTWARE\JavaSoft\JDK', 'CurrentVersion', JavaPath) then
  begin
    if not FileExists(ExpandConstant('{pf}\Java\jdk-21\bin\java.exe')) then
    begin
      if MsgBox('Java 21 was not detected on this system.' + #13#10 +
                'The application requires Java 21 or later to run.' + #13#10#13#10 +
                'Do you want to continue installation anyway?',
                mbConfirmation, MB_YESNO) = IDNO then
      begin
        Result := False;
      end;
    end;
  end;
end;
