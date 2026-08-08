# LaundryMS Installer Patch — Merge Instructions

Merge these files into your repository's installer/scripts area, preserving the `resources/` subdirectory.

Expected layout:

```text
scripts/
├── installer.iss
├── installer-static-check.py
├── installer-smoke-test.ps1
├── build-deployment.sh
├── build-installer.sh
├── build-installer.ps1
└── resources/
    ├── laundryms-service.xml
    ├── laundryms-tunnel-service.xml
    ├── app.ico                 # keep your existing file
    └── LICENSE.txt             # keep your existing file
```

Documentation files in this package can replace/update the corresponding project docs:

- `installer-spec.md`
- `installer-test-matrix.md`
- `architecture.md`

## Build & Verification

1. Run automated installer safety check (WSL/Linux):

```bash
python3 scripts/installer-static-check.py
```

2. Stage production deployment payload (WSL/Linux):

```bash
./scripts/build-deployment.sh 1.0.0
```

3. Compile installer binary (Windows PowerShell):

```powershell
.\scripts\build-installer.ps1 -Version 1.0.0
```

4. Execute automated post-install smoke test (Windows PowerShell):

```powershell
.\scripts\installer-smoke-test.ps1
```

## Important

Do not overwrite `resources/app.ico` with single-layer icons; `resources/app.ico` is a multi-resolution 256x256 icon container required by Windows Explorer.

For a clean Ngrok-enabled acceptance test, prepare an Ngrok authtoken and the exact reserved/static HTTPS domain configured as the Vercel `UPSTREAM_API_URL`.

