# Deployment Guide
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** DEP-001  
> **Version:** 2.1 (Standalone & Tunnel Standardization)  
> **Date:** 2026-07-24  
> **Purpose:** Detailed instructions for generating the Windows installer and setting up the shop hardware.  

---

## 1. Overview

The Faith Laundry Shop Management System is designed to operate on a strict **Offline-First, Zero-Cloud-Cost Architecture**.

The entire backend and staff-facing frontend are bundled into a single standalone `.msi` Windows installer. The database is a local PostgreSQL instance running as a silent Windows Service. 

To enable public customer tracking online, the local server is exposed to a Vercel-hosted frontend via a secure **Cloudflare Tunnel**.

---

## 2. Generating the Native Installer (.msi)

To package the Java/Spring Boot application and statically exported Next.js frontend into a native Windows installer, use the provided PowerShell script.

### Prerequisites (Developer Machine)
1. **Windows OS** (required to generate `.msi` via `jpackage` and WiX Toolset)
2. **Java JDK 21**
3. **Node.js 20+**
4. **WiX Toolset v3.14+** (Required by `jpackage` to build MSI files)

### Build Process
Open PowerShell and run the build script from the project root:

```powershell
.\scripts\build_standalone.ps1
```

**What the script does:**
1. Runs `npm run build` in the `frontend/` directory to generate the static HTML export in `out/`.
2. Copies the `out/` folder into the Spring Boot `backend/src/main/resources/static/` directory so the Java server can serve it.
3. Builds the Spring Boot backend using Maven `mvn clean package`.
4. Executes the `jpackage` command to bundle the Java Runtime Environment (JRE) and the `laundryms-backend.jar` into a native `.msi` installer.
5. Outputs the final installer: `backend/target/Laundry Shop Management System-1.0.0.msi`.

---

## 3. Installing on the Shop Counter Laptop

### 3.1 Initial Environment Setup
The target machine (shop laptop) needs PostgreSQL installed and configured as a background service.

1. Transfer `scripts/setup_windows.ps1` to the shop laptop.
2. Run PowerShell as Administrator.
3. Execute the script:
   ```powershell
   .\setup_windows.ps1
   ```
4. This script automatically:
   - Downloads and installs PostgreSQL 16 silently.
   - Creates the `postgres` user with a secure, generated password.
   - Sets Machine-level environment variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`).

### 3.2 Application Installation
1. Transfer the generated `Laundry Shop Management System-1.0.0.msi` to the shop laptop.
2. Double-click the `.msi` file and follow the standard Windows setup wizard.
3. Once installed, launch the application from the Start Menu or Desktop Shortcut.
4. The system will automatically run Flyway migrations on startup and launch the embedded Tomcat server on `http://localhost:8080`.

---

## 4. Setting up Cloudflare Tunnels & Zero Trust Remote Access

To expose the system to the public internet securely (for customer tracking and optional remote Admin/Staff management), configure two hostname routes in Cloudflare Zero Trust.

### 4.1 Cloudflare Dashboard Configuration
1. Log in to the free [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/).
2. Navigate to **Networks > Tunnels** and create a new tunnel named `faithlaundry-local`.
3. Configure Public Hostname Routes:
   - **Route 1 (Public Customer Tracking)**:  
     - Public Hostname: `track.faithlaundry.com`  
     - Destination: `HTTP` `localhost:8080`
   - **Route 2 (Protected Staff/Admin Dashboard)**:  
     - Public Hostname: `app.faithlaundry.com`  
     - Destination: `HTTP` `localhost:8080`
4. Copy the generated Tunnel Token.

### 4.2 Cloudflare Zero Trust Access Rule (Remote App Protection)
To ensure the remote Admin/Staff app (`app.faithlaundry.com`) cannot be accessed by unauthorized internet traffic:
1. In Cloudflare Zero Trust, go to **Access > Applications**.
2. Add an Application for `app.faithlaundry.com`.
3. Set Policy Rule: **Include > Emails > `owner@faithlaundry.com`, `staff@faithlaundry.com`**.
4. Whenever someone opens `app.faithlaundry.com` remotely, Cloudflare requires a **One-Time Passcode (OTP)** sent to their email before showing the login screen.

### 4.3 Automated Installation on Shop Laptop
Pass the token to the automated host setup script:
```powershell
.\scripts\setup_windows.ps1 -CloudflareToken "<YOUR_TUNNEL_TOKEN>"
```
The script will automatically install `cloudflared` as a silent Windows background service that starts on boot.

---

## 5. Security & Maintenance

### Firewall
- Windows Firewall requires outbound HTTPS access on Port 443 (used by `cloudflared`).
- **No inbound router ports need to be opened.**

### Automated Nightly Database Backup
A Windows Task Scheduler task is created to dump the database nightly:
```cmd
pg_dump -U postgres -d postgres -F c -b -v -f "C:\Backups\laundry_db_%date:~-4,4%%date:~-10,2%%date:~-7,2%.backup"
```

### Availability Tradeoff
- **CRITICAL:** The public tracking portal and remote admin URL rely on the shop laptop being powered on and connected to the internet. If the laptop is turned off or offline, remote portals will display a "Shop Offline" page. Local counter operations (creating orders, payments) are 100% unaffected.
