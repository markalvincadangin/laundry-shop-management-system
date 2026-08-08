# Laundry Shop Management System — Final Installer Implementation Audit

**Audit date:** 2026-08-08  
**Specification:** SPEC-INSTALLER-001 v7.1  
**Implementation status:** All planned installer code tasks implemented. Windows compilation and VM acceptance remain release gates.

## Executive result

The installer implementation now matches the intended thin-bootstrapper architecture at code/spec level. It is designed to fail closed on ambiguous application/service/database state, preserve production secrets and customer data during upgrades/default uninstall, use a scoped PostgreSQL runtime role, bundle Java 21, verify downloaded/staged prerequisites, and gate successful installation metadata on service/application readiness.

This audit does **not** label the package production-validated because this environment cannot run `ISCC.exe`, Windows SCM, the EDB PostgreSQL installer, or the real Spring Boot Windows service. Those checks are explicitly captured in `installer-test-matrix.md`.

## Task completion matrix

| Task | Status | Implemented result |
|---|---|---|
| Task 1 — Upgrade/lifecycle foundation | Complete | Immutable clean/upgrade/retained-data modes; secret preservation; fail-closed SCM lifecycle; readiness-gated success metadata |
| Task 2 — True PostgreSQL detection | Complete (code) | EDB registry enumeration, custom paths/ports, active `postgres.exe` listener scan, supported 16/17/18 reuse, unsupported 5432 fallback opt-in, safe free-port selection, live `server_version_num` validation |
| Task 3 — Secure/idempotent provisioning | Complete (code) | Temporary restricted `PGPASSFILE`, `ON_ERROR_STOP`, bounded `laundryms_app`, idempotent role/password/database/schema ownership reconciliation, application-role connection test |
| Task 4 — Bundled Java 21 | Complete | Temurin 21.0.11+10 staged into `{app}\runtime`, WinSW uses `%BASE%\runtime\bin\java.exe`, setup validates `java.exe -version` |
| Task 5 — Secret ACL hardening | Complete (code) | ProgramData/config/logs/backups inheritance removed; SYSTEM + Administrators Full Control; config file explicitly hardened |
| Task 6 — Download integrity | Complete | PostgreSQL 16.14-1 downloaded with required SHA-256; WinSW/Temurin release assets SHA-verified during staging; post-staging payload hashes revalidated before ISCC |
| Task 7 — Build/version/release pipeline | Complete (code) | Maven `clean verify`; dynamic JAR discovery; version propagation; deployment manifest; ISCC invocation; optional Authenticode + RFC3161 timestamping |
| Task 8 — Uninstall/data retention | Complete (code) | Default retains DB/config/backups/metadata; explicit unchecked destructive checkbox drops `laundryms` and removes retained ProgramData/metadata; PostgreSQL server itself is never auto-uninstalled |
| Task 9 — Acceptance testing | Complete (test assets) | Windows smoke-test script plus clean/upgrade/failure/security/uninstall/build matrix |
| Task 10 — Final audit | Complete | This audit plus integrated static safety checker |

## Security properties checked statically

- No PostgreSQL 16.2 prerequisite remains.
- Managed PostgreSQL is pinned to 16.14-1 with a required SHA-256.
- No `-DskipTests` remains in the production deployment build.
- No non-cryptographic Pascal `Random()` secret generator remains.
- PostgreSQL administrator password is not written to application config or Registry.
- Runtime DB identity is `laundryms_app`, not `postgres`.
- `laundryms_app` is explicitly `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE`, `NOREPLICATION`.
- Existing PostgreSQL credentials use a temporary restricted `.pgpass` file instead of password command-line arguments.
- Live existing-server validation checks `server_version_num`; registry metadata alone is not trusted as proof of the endpoint's major version.
- Production config does not include the old `http://localhost:3000` development CORS value.
- Bundled Java path is present in installer payload and WinSW configuration.
- Successful registry version metadata is written only after SCM reports RUNNING and `/api/v1/health` returns HTTP 200.
- Destructive uninstall is opt-in and unchecked by default.

## Static validation performed in this environment

- `bash -n build-deployment.sh` — PASS
- `bash -n build-installer.sh` — PASS
- WinSW XML parsed as valid XML — PASS
- `installer-static-check.py` — PASS
- Pascal string-literal balance heuristic — PASS
- Obsolete/development pattern scan — PASS

## Required Windows release gates

Before shipping a production installer:

1. Run `scripts/build-deployment.sh <version>` from WSL/Linux with network access.
2. Run `scripts/build-installer.ps1 -Version <version>` on Windows with Inno Setup 6 installed.
3. Require `ISCC.exe` exit code 0.
4. Execute the mandatory scenarios in `installer-test-matrix.md` from disposable Windows 10/11 x64 VM snapshots.
5. Run `installer-smoke-test.ps1 -ExpectedVersion <version>` after a clean install and after an upgrade.
6. For a signed production release, run the Windows build with `-Sign -CertificateThumbprint <thumbprint>` and verify the Authenticode signature is Valid.

## Known conservative limitation

EDB-installed PostgreSQL instances are discoverable even when stopped because they expose registry installation/data metadata. Active manually/ZIP-installed PostgreSQL instances are discoverable through their listening `postgres.exe` process. A **stopped** manual/ZIP PostgreSQL instance with no EDB registry metadata cannot be fully rediscovered automatically; the installer therefore cannot promise reuse of that invisible instance. The Windows acceptance matrix should verify this behavior does not lead to destructive modification. Existing active listeners are never overwritten because port binding checks and active PostgreSQL process detection are used before managed installation.

## Release decision

**Code/spec implementation:** READY FOR WINDOWS VALIDATION  
**Production release sign-off:** NOT YET — requires successful ISCC compilation and the mandatory Windows VM matrix.
