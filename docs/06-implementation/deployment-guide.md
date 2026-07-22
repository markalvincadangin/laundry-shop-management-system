# Deployment Guide
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** DEP-001  
> **Version:** 2.0 (Standalone & Tunnel)  
> **Date:** 2026-07-21  
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

## 4. Setting up the Cloudflare Tunnel

To expose the local API to the public Vercel tracking site without port-forwarding, configure a Cloudflare Tunnel on the shop laptop.

### 4.1 Cloudflare Dashboard Configuration
1. Log in to the Cloudflare Zero Trust Dashboard.
2. Navigate to **Networks > Tunnels** and create a new tunnel named `faithlaundry-local`.
3. Add a Public Hostname (e.g., `api.faithlaundry.com`).
4. Set the Service Type to `HTTP` and URL to `localhost:8080`.
5. Under Additional Application Settings > TLS, disable TLS Verify if needed (since it's localhost).

### 4.2 Installing `cloudflared` on the Shop Laptop
1. Download the `cloudflared.exe` Windows daemon from the Cloudflare Zero Trust dashboard.
2. Open Command Prompt as Administrator on the shop laptop.
3. Run the installation command provided by Cloudflare:
   ```cmd
   cloudflared.exe service install <YOUR_TUNNEL_TOKEN>
   ```
4. The tunnel will now run silently as a Windows Service, automatically reconnecting whenever the laptop powers on and connects to the internet.

---

## 5. Security & Maintenance

### Firewall
- Ensure the Windows Firewall allows outbound connections on Port 443 (required for Cloudflare Tunnel).
- No inbound ports need to be opened.

### Backup
- A nightly scheduled task should be created in Windows Task Scheduler to run `pg_dump` and backup the database to an external drive or secure cloud storage.

### Availability Tradeoff
- **CRITICAL:** The customer tracking portal hosted on Vercel relies entirely on the Cloudflare Tunnel reaching the shop laptop. If the laptop is powered off, goes to sleep, or loses internet connection, the tracking portal will display an error to customers. Local operations (creating orders, payments) are unaffected.
