# Deployment & Installer Specification
## Laundry Shop Management System

> **Document ID:** SPEC-INSTALLER-001  
> **Version:** 8.0 (Ngrok Tunnel Integration)  
> **Date:** 2026-08-08  
> **Status:** Implementation complete; Windows compile/VM validation required before release sign-off

---

## 1. Architecture Summary

The Laundry Shop Management System installer uses a **Thin Bootstrapper + Detected Prerequisites** architecture built with Inno Setup. The application payload contains the Spring Boot JAR, WinSW, application resources, and a verified bundled Java 21 runtime. PostgreSQL is reused when a supported local instance is available; otherwise a pinned PostgreSQL prerequisite is downloaded on demand and verified before execution. Optional remote access uses a separately pinned Ngrok agent downloaded only when the administrator selects remote access.

### Architectural invariants

1. Existing PostgreSQL installations and data directories are never deleted, reset, or overwritten.
2. Installer mode (clean install, normal upgrade, retained-data/legacy service repair) is selected once and then frozen.
3. Upgrade paths preserve existing application DB and JWT secrets and never perform initial DB provisioning.
4. The runtime application connects only as `laundryms_app` to database `laundryms`.
5. PostgreSQL administrator credentials are temporary provisioning credentials only and are never persisted in registry/application configuration.
6. Java 21 is bundled under `{app}\runtime\`; no global Java dependency is required.
7. Production secrets are stored only in `C:\ProgramData\LaundryShopMS\config\application-prod.properties` under restricted ACLs.
8. Installer success metadata is written only after the Windows service reports `RUNNING` and the HTTP readiness endpoint returns `200`.
9. Uninstall preserves database/config/backups by default so a later reinstall can reattach without the discarded PostgreSQL superuser password.
10. Destructive database/backups removal requires an explicit unchecked uninstall checkbox.
11. Ngrok remote access is optional; local operation must remain functional if Ngrok download, authentication, DNS, or internet connectivity fails.
12. The Ngrok authtoken is stored only in the protected `C:\ProgramData\LaundryShopMS\tunnel\ngrok.yml` file and is never written to Registry, logs, command-line arguments, or application properties.
13. The Ngrok upstream is fixed to `http://127.0.0.1:8765`; no inbound LAN/firewall exposure is introduced.

---

## 2. Current Pinned Prerequisites

### PostgreSQL

- Major compatibility window for reuse: **16, 17, 18**
- Installer-managed major: **16**
- Pinned installer build: **16.14-1**
- URL: `https://get.enterprisedb.com/postgresql/postgresql-16.14-1-windows-x64.exe`
- Required SHA-256: `D389834DF279A9B7CE4B4A030B6545FD0BEFB05385FF66932AC37454AD9B9312`

The SHA-256 is mandatory in `DownloadTemporaryFile`; hash mismatch or download failure aborts Setup before the executable is launched.

### Java

- Vendor: Eclipse Temurin
- Major: Java 21 LTS
- Pinned build: **21.0.11+10**
- Windows x64 JRE asset: `OpenJDK21U-jre_x64_windows_hotspot_21.0.11_10.zip`

The build staging script resolves the official GitHub release asset metadata, verifies its SHA-256 digest, extracts the JRE, and stages it under `deploy-staging/runtime`.

### WinSW

- Version: **v2.12.0**
- Asset: `WinSW-x64.exe`

The build staging script obtains the GitHub release asset digest (or requires an explicit SHA-256 override if the API does not expose one), verifies the download, and stages it as `laundryms-service.exe`.

### Ngrok

- Agent major: **v3**
- Pinned build: **3.39.9**
- Windows x64 archive: `ngrok-v3-3.39.9-windows-amd64.zip`
- URL: `https://bin.ngrok.com/a/m9v4MphCUjA/ngrok-v3-3.39.9-windows-amd64.zip`
- Required SHA-256: `12F99DC3B2145AB1503602434E00FD38199A5545DC051DD86BA526C11AB97DB1`

Ngrok is downloaded only when **Enable Ngrok remote access** is selected. The verified archive is cached under `C:\ProgramData\LaundryShopMS\cache`, revalidated before reuse, extracted under `{app}\tunnel`, and the extracted Windows executable must pass Authenticode publisher validation for ngrok before it is used.

---

## 3. Application Deployment Modes

### 3.1 Clean installation

Allowed only when no Laundry Shop MS deployment evidence exists.

```text
IsUpgrade = False
IsRecoverableLegacyDeployment = False
```

Behavior:

1. Generate cryptographically secure application DB password.
2. Generate cryptographically secure JWT secret.
3. Detect PostgreSQL state.
4. If Setup must install PostgreSQL, prompt the administrator to choose and confirm the password for the built-in PostgreSQL superuser `postgres`.
5. Install/reuse PostgreSQL according to the detected state.
6. Provision the application database/role.
7. Write protected production configuration.
8. Offer **Local only** or **Enable Ngrok remote access**.
9. When Ngrok is selected, collect the device authtoken and reserved/static HTTPS domain, write the protected v3 Ngrok configuration, and obtain/verify the pinned Ngrok agent.
10. Copy binaries/runtime.
11. Install/start the LaundryShopMS service.
12. Verify local SCM + HTTP readiness.
13. If Ngrok is enabled, install/start the dedicated `LaundryShopMSTunnel` service and attempt the public health check. Tunnel failure is a warning, not a rollback of a healthy local installation.
14. Write non-secret registry metadata.

### 3.2 Normal upgrade

Requires a valid production config and a registered LaundryShopMS service.

```text
IsUpgrade = True
IsRecoverableLegacyDeployment = False
```

Behavior:

- preserve DB/JWT secrets and datasource URL
- preserve PostgreSQL metadata
- skip PostgreSQL install/provisioning
- stop and verify exact `STOPPED`
- replace files/runtime
- require service still registered and `STOPPED`
- WinSW `refresh` then `start`
- verify SCM `RUNNING` and HTTP `200`
- preserve protected Ngrok configuration/public endpoint metadata when remote access was enabled
- stop the optional `LaundryShopMSTunnel` before replacement, revalidate/reuse the pinned agent, then refresh/restart it after local readiness
- update successful-install metadata

### 3.3 Retained-data / legacy service repair

Allowed only when:

```text
production config exists
SCM explicitly returns SERVICE_NOT_INSTALLED
AND registry metadata or WinSW binary provides retained deployment evidence
```

This covers both a legacy missing-service deployment and the supported default-uninstall/reinstall workflow.

Behavior:

- preserve all existing DB/JWT secrets
- skip PostgreSQL install/provisioning
- replace application files
- WinSW `install` then `start`
- verify readiness
- preserve/reuse retained protected Ngrok configuration and reinstall the tunnel service when tunnel metadata says remote access was enabled
- repair/update registry metadata

### 3.4 Damaged/ambiguous deployment

Any inconsistent deployment evidence, or an `UNKNOWN` SCM result when deployment evidence exists, fails closed.

```text
ABORT
NO new secrets
NO initial DB provisioning
NO unsafe file replacement
```

---

## 4. Windows Service State Machine

`sc.exe query LaundryShopMS` is parsed by numeric service-state code rather than localized state text.

```text
1 -> STOPPED
2 -> START_PENDING
3 -> STOP_PENDING
4 -> RUNNING
5 -> OTHER_PENDING (CONTINUE_PENDING)
6 -> OTHER_PENDING (PAUSE_PENDING)
7 -> PAUSED
```

Additional internal states:

- `SERVICE_NOT_INSTALLED`: accepted only when SCM returns error 1060
- `SERVICE_UNKNOWN`: process/query/output could not be trusted

### Upgrade safety

- STOPPED -> safe for replacement
- RUNNING -> stop, then poll until exact STOPPED
- START_PENDING -> wait for transition, then stop if RUNNING
- STOP_PENDING -> poll until exact STOPPED
- PAUSED / OTHER_PENDING / UNKNOWN -> abort
- NOT_INSTALLED -> allowed only in retained-data/legacy repair mode

### Post-install readiness

All service-install/upgrade modes require both:

1. SCM exact `RUNNING`
2. `GET http://127.0.0.1:8765/api/v1/health` -> HTTP `200`

Registry success metadata is written only after both gates pass.

---

## 5. True 3-State PostgreSQL Detection

PostgreSQL discovery first enumerates `HKLM\SOFTWARE\PostgreSQL\Installations`, so EDB installations remain discoverable even when installed in non-default filesystem locations. Setup also scans active local TCP listeners owned by `postgres.exe`, resolves the executable path, and runs `postgres.exe --version`. This allows active manually/ZIP-installed PostgreSQL instances to be classified even when no EDB registry entry exists.

For EDB registry installations, Setup reads:

- `Version`
- `Base Directory`
- `Data Directory`
- configured port from `postgresql.conf` and `postgresql.auto.conf`
- reachability using that installation's `pg_isready.exe`

For active non-EDB/manual instances, Setup derives the listening port and binary directory from the owning `postgres.exe` process and validates the executable version. Stopped manual/ZIP installations with no EDB registry metadata cannot be fully rediscovered automatically; port binding checks still prevent Setup from overwriting an active listener.

### State 1 — Supported PostgreSQL 16/17/18

A supported active instance is reused. If multiple supported active instances exist, port 5432 is preferred.

Setup prompts for:

- host (defaults to `127.0.0.1`)
- port
- PostgreSQL administrator role name
- PostgreSQL administrator password

The administrator credentials are validated before installation proceeds. Validation also queries `server_version_num` from the actual server endpoint and refuses reuse unless the live server major is PostgreSQL 16, 17, or 18. Passwords are not logged or persisted.

If a supported installation exists but is not accepting connections, Setup aborts and asks the administrator to start it instead of silently installing a duplicate PostgreSQL instance.

### State 2 — Unsupported PostgreSQL on 5432

Any PostgreSQL major outside the supported 16-18 reuse window that is configured for port 5432 is left untouched.

Setup finds a free fallback port starting at 5433 and displays an explicit unchecked opt-in:

> Install a separate supported PostgreSQL instance for Laundry Shop MS on the selected fallback port.

Setup cannot continue until this option is explicitly selected or the user cancels.

### State 3 — No reusable PostgreSQL

Setup chooses the first safe free port beginning at 5432.

A port is considered unavailable if:

- another installed PostgreSQL instance is configured for it, even if stopped; or
- Windows cannot bind the local TCP port.

Before the unattended PostgreSQL installation starts, Setup displays a **PostgreSQL Superuser Password** page. The username is fixed to `postgres`; the administrator chooses and confirms the password. Setup requires 12-128 printable ASCII characters with at least one uppercase letter, one lowercase letter, and one digit. The page explicitly tells the administrator to retain this password for later pgAdmin/`psql` access.

Setup then downloads (or reuses the verified persistent cache of) the pinned PostgreSQL prerequisite with required SHA-256 verification and installs it unattended.

---

## 6. PostgreSQL Installation Security

Managed PostgreSQL installation uses a temporary unattended option file rather than putting the **user-selected** PostgreSQL superuser password directly on the process command line.

The option file is:

- created in a dedicated temporary provisioning directory
- restricted to SYSTEM and Administrators
- deleted after use

The managed PostgreSQL `postgres` superuser password is separate from the application DB password. It is chosen by the administrator, passed only through the restricted temporary EDB option file / temporary `PGPASSFILE`, and removed from Setup memory after provisioning. Laundry Shop MS does **not** persist it in application configuration or registry; the administrator is responsible for retaining it in a password manager for later pgAdmin/`psql` administration.

The Windows service account remains separate (`laundryms_pgsvc`) and uses an installer-generated random password that is not shown to the user. EDB debug traces are retained only on installation failure for diagnosis; after a successful installation they are deleted because EDB troubleshooting logs can contain sensitive installation values.

---

## 7. Secure, Idempotent Database Provisioning

Database provisioning runs only during a clean application installation.

Authentication to `psql` uses a temporary restricted `PGPASSFILE`; the PostgreSQL administrator password is not included in `psql` command-line arguments.

`psql` runs with:

```text
-X
-w
ON_ERROR_STOP=1
```

Any launch error, authentication error, or SQL failure aborts Setup before service installation.

### Provisioning target

```text
Database: laundryms
Runtime role: laundryms_app
```

### Role properties

`laundryms_app` is explicitly constrained to:

```text
LOGIN
NOSUPERUSER
NOCREATEDB
NOCREATEROLE
NOREPLICATION
```

The role is created only if missing, then its password is synchronized to the generated/preserved application password. This makes clean-install retries idempotent.

### Database ownership

- create `laundryms` only if missing
- database owner is `laundryms_app`
- existing `laundryms` ownership is reconciled to `laundryms_app`
- `public` schema ownership/CREATE/USAGE are granted to `laundryms_app`

This allows Spring/Flyway migrations without granting PostgreSQL superuser privileges.

After provisioning, Setup tests an actual `laundryms_app -> laundryms` connection before continuing.

---

## 8. Production Configuration

Path:

`C:\ProgramData\LaundryShopMS\config\application-prod.properties`

Generated clean-install blueprint:

```properties
spring.datasource.url=jdbc:postgresql://127.0.0.1:<PORT>/laundryms
spring.datasource.username=laundryms_app
spring.datasource.password=<secure generated value>
spring.flyway.enabled=true
security.jwt.secret-key=<secure generated value>
server.port=8765
server.address=127.0.0.1
```

The previous development-only `app.security.allowed-origin=http://localhost:3000` value is intentionally not written. The packaged frontend is served from the backend application and uses the same origin.

Upgrade/repair never rewrites a valid existing production configuration.

---

## 9. Secret Storage and ACL Policy

The following directories are created/secured:

```text
C:\ProgramData\LaundryShopMS\
C:\ProgramData\LaundryShopMS\config\
C:\ProgramData\LaundryShopMS\logs\
C:\ProgramData\LaundryShopMS\backups\
C:\ProgramData\LaundryShopMS\cache\
C:\ProgramData\LaundryShopMS\tunnel\
```

Inherited ACLs are removed and access is explicitly restricted to:

- `NT AUTHORITY\SYSTEM` — Full Control
- `BUILTIN\Administrators` — Full Control

The production config file and `tunnel\ngrok.yml` receive the same explicit restricted ACL. The Ngrok YAML contains the authtoken and therefore is treated as a secret-bearing file.

The WinSW service currently runs as LocalSystem, matching these ACLs and the existing installer lifecycle. Secrets are never written into Windows Registry.

---

## 10. Bundled Java Runtime and Service Configuration

The application payload includes:

```text
{app}\runtime\bin\java.exe
```

Before service registration/start, Setup verifies the bundled runtime by executing `java.exe -version` and requiring successful exit status.

WinSW launches:

```text
%BASE%\runtime\bin\java.exe
```

with the Spring Boot JAR and explicit external configuration:

```text
--spring.profiles.active=prod
--spring.config.additional-location=file:C:/ProgramData/LaundryShopMS/config/application-prod.properties
```

The service uses automatic delayed start, rolling logs in ProgramData, bounded stop timeout, and restart-on-failure actions.

### Optional Ngrok tunnel service

When remote access is enabled, Setup installs a second isolated WinSW service:

```text
Service: LaundryShopMSTunnel
Executable: {app}\tunnel\ngrok.exe
Arguments: start --all --config C:\ProgramData\LaundryShopMS\tunnel\ngrok.yml
```

The v3 configuration contains one endpoint named `laundryms`, the administrator-provided reserved/static HTTPS URL, and an upstream fixed to `http://127.0.0.1:8765`. `update_check`, `remote_management`, and the local inspector (`web_addr`) are disabled so the installer-controlled pinned agent remains deterministic and does not expose an additional local management surface.

The tunnel service is stopped before an upgrade, refreshed/reinstalled after files are replaced, and stopped/unregistered before uninstall. Default uninstall retains `ngrok.yml` and tunnel metadata for reattachment; destructive uninstall removes them with the rest of ProgramData.

---

## 11. Registry Metadata

Path:

`HKLM\Software\Himotech\LaundryShopMS`

Allowed non-secret values:

- `InstalledVersion`
- `DbHost`
- `DbPort`
- `PgMajor`
- `PgBinDir`
- `ManagedPostgres`
- `TunnelEnabled`
- `TunnelPublicUrl` (public endpoint, non-secret)

Forbidden:

- DB password
- PostgreSQL administrator password
- JWT secret
- Ngrok authtoken

Metadata is the final success marker and is written only after service/application readiness succeeds.

---

## 12. Build and Release Pipeline

### WSL/Linux staging

`build-deployment.sh <version>` performs:

1. frontend production build and static-export validation
2. copies `frontend/out` into Spring Boot static resources
3. `./mvnw clean verify` (tests are not skipped)
4. verified WinSW download
5. verified Temurin Java 21 JRE download
6. runtime extraction/staging
7. dynamic executable JAR discovery
8. deployment manifest with versions/SHA-256 values

### Windows compilation

`build-installer.ps1 -Version <version>`:

- validates required staged files
- validates bundled Java
- verifies the deployment manifest version matches the requested installer version
- re-hashes the staged application JAR, WinSW executable, and bundled `java.exe` and rejects any post-staging tampering
- locates `ISCC.exe`
- passes `/DAppVersion=<version>` to Inno Setup
- verifies expected installer output exists
- prints the final installer SHA-256

Optional Authenticode signing is supported with:

```powershell
-Sign -CertificateThumbprint <thumbprint>
```

and RFC3161 timestamping through `signtool.exe`.

`build-installer.sh` can run staging and invoke the Windows PowerShell compiler automatically when executed under WSL with `powershell.exe` available.

---

## 13. Uninstall and Data Retention

### Default (checkbox unchecked)

Uninstall:

- stops/unregisters `LaundryShopMSTunnel` when present
- stops/unregisters LaundryShopMS service
- removes application binaries/shortcuts
- retains protected production config, protected `tunnel\ngrok.yml`, DB/tunnel metadata, and backups
- may remove logs
- leaves PostgreSQL and the `laundryms` database untouched

This retained config/metadata is intentional: a later Setup run enters retained-data/service-repair mode and reuses the existing `laundryms_app` password without needing the discarded PostgreSQL superuser password.

### Explicit destructive option

The uninstall progress form contains an unchecked checkbox:

> Remove Laundry Shop MS database and local backups/customer data (irreversible)

If selected:

1. service is stopped
2. the existing `laundryms_app` credentials are read from protected config
3. `laundryms_app` connects to `postgres`
4. `DROP DATABASE IF EXISTS laundryms WITH (FORCE)` is executed
5. local ProgramData/config/backups are removed
6. Laundry Shop MS registry metadata is removed

The PostgreSQL server installation itself is intentionally not uninstalled automatically, even when originally installed by Laundry Shop MS, because it may subsequently contain other databases.

---

## 14. Failure-Safety Rules

- Ngrok is an optional remote-access dependency. A tunnel download/config/service/public-health failure must not invalidate an otherwise healthy local installation.
- Ngrok archive SHA-256 or Authenticode publisher validation failure prevents the tunnel agent from executing.
- The public endpoint must be an HTTPS origin without a path/query/fragment and may not resolve to localhost.
- The tunnel upstream remains `127.0.0.1:8765`; PostgreSQL is never tunneled.

Setup fails closed when any critical invariant is not met, including:

- ambiguous existing deployment state
- unknown SCM state
- supported PostgreSQL installed but unavailable
- no safe PostgreSQL port
- failed admin authentication
- prerequisite download/hash failure
- PostgreSQL installer failure
- missing `psql.exe`
- SQL provisioning failure
- application-role connection failure
- ACL hardening failure
- missing/broken bundled Java runtime
- service management failure
- service not reaching exact RUNNING
- HTTP readiness not returning 200

No successful-install registry marker is written after any of these failures.

---

## 15. Validation Matrix

The repository should use `installer-test-matrix.md` as the required Windows VM acceptance checklist and `installer-smoke-test.ps1` for installed-state verification.

Critical scenarios include:

- clean machine/no PostgreSQL
- PostgreSQL 16 on 5432
- PostgreSQL 17 custom directory/custom port
- PostgreSQL 18
- PostgreSQL 15 on 5432 with fallback opt-in
- opt-in declined
- occupied fallback ports
- supported PostgreSQL stopped
- incorrect admin password
- partial provisioning retry
- normal upgrade (running/stopped service)
- retained-data reinstall after uninstall
- explicit database removal
- corrupt prerequisite hash
- missing Java runtime
- service/readiness failure

---

## 16. Release Sign-Off Status

### Implemented in the accompanying files

- Task 1 upgrade/service lifecycle foundation
- true PostgreSQL 3-state detector and safe port planning
- secure admin credential use via `PGPASSFILE`
- idempotent scoped DB/role provisioning
- bundled verified Java 21 runtime pipeline
- ProgramData secret ACL hardening
- pinned PostgreSQL + SHA-256 verification
- verified WinSW/Temurin staging
- application version propagation
- build tests enabled
- Authenticode signing readiness
- explicit uninstall data-removal opt-in
- Windows smoke test and test matrix
- static installer regression checker integrated into deployment staging
- post-staging manifest/hash revalidation before Inno compilation
- optional Ngrok Remote Access wizard with authtoken + reserved/static HTTPS domain validation
- pinned/cached Ngrok archive verification plus Authenticode publisher validation
- ACL-protected Ngrok v3 configuration with fixed localhost upstream
- dedicated `LaundryShopMSTunnel` WinSW lifecycle for install, upgrade, retained-data repair, and uninstall
- tunnel-specific smoke/static checks and Windows acceptance scenarios

### Still required before calling a release production-validated

The current ChatGPT environment is Linux/WSL and cannot execute the Windows Inno Setup compiler or exercise Windows SCM/PostgreSQL installation behavior.

Before release, run on Windows:

```powershell
.\scripts\build-installer.ps1 -Version <version>
```

Then execute the full VM matrix in `installer-test-matrix.md`.

**Implementation is complete; production validation/sign-off is not complete until the installer compiles and the Windows VM acceptance matrix passes.**
