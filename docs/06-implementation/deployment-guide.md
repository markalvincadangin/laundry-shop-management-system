# Deployment Guide
## Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** Mark Alvin Cadangin  
> **Document ID:** DEP-001  
> **Version:** 3.0 (Production Inno Setup & WinSW Service Standardization)  
> **Date:** 2026-07-24  
> **Purpose:** Detailed instructions for generating the Windows executable installer and setting up the shop hardware.  

---

## 1. Overview

The Laundry Shop Management System is designed to operate on a strict **Offline-First, Zero-Cloud-Cost Architecture**.

The entire backend (Spring Boot 3.5) and staff-facing frontend (Next.js static export) are packaged into a **single standalone `.exe` Windows Installer wizard** generated via **Inno Setup** and managed via **WinSW (Windows Service Wrapper)**. The database is a local PostgreSQL instance running as a silent Windows Service.

To enable online access, the local server is exposed to the Vercel-hosted frontend via a secure **Ngrok reverse tunnel**. This supports public customer tracking and authenticated remote Admin/Staff access while the shop laptop is running and connected to the internet. Cloudflare Tunnel remains available as an optional installer alternative.

---

## 2. Generating the Native Installer (.exe)

To package the Java/Spring Boot application, statically exported Next.js frontend, custom app icon, and WinSW background service configuration into a single double-clickable `.exe` installer wizard, use the provided PowerShell script.

### Prerequisites (Developer Machine)
1. **Windows OS** (or WSL/Linux with PowerShell)
2. **Java JDK 21**
3. **Node.js 20+**
4. **Inno Setup 6+** (Script automatically downloads and installs Inno Setup if not present)

### Build Process
Open PowerShell and run the build script from the project root:

```powershell
.\scripts\build-installer.ps1
```

**What the script does:**
1. Runs `npm run build` in the `frontend/` directory to generate the static HTML export in `out/`.
2. Copies the `out/` folder into the Spring Boot `backend/src/main/resources/static/` directory so the Java server can serve it natively.
3. Builds the Spring Boot backend using Maven `mvn clean package`.
4. Stages the application JAR (`laundryms.jar`), WinSW service wrapper (`laundryms-service.exe`), service config (`laundryms-service.xml`), app icon (`app.ico`), and license file.
5. Compiles the package using Inno Setup (`ISCC.exe scripts/installer.iss`).
6. Outputs the final installer wizard: `backend/target/LaundryShopMS-Setup-1.0.0.exe`.

---

## 3. Installing on the Shop Counter Laptop

### 3.1 All-in-One Application & Environment Installation
1. Transfer `LaundryShopMS-Setup-1.0.0.exe` to the shop laptop.
2. Double-click `LaundryShopMS-Setup-1.0.0.exe` to open the setup wizard:
   - **Welcome Screen** → Displays system name and version.
   - **License Agreement** → Accept terms.
   - **Destination Folder** → Default: `C:\Program Files\Laundry Shop Management System`.
   - **Automated Setup** → The wizard automatically:
     - Installs PostgreSQL 16 silently as a Windows Service if not already installed.
     - Configures Machine-level environment variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`).
     - Extracts application files, WinSW service wrapper, Cloudflare, and Ngrok binaries.
     - Prompts for **Remote Access Provider** (Ngrok, Cloudflare, or Local Only) and configures the selected tunneling background service.
     - Registers and starts the `LaundryShopMS` Windows background service.
     - Creates Desktop & Start Menu shortcuts with the custom app icon.
     - Registers in Windows **Add/Remove Programs**.
   - **Finish** → Opens `http://localhost:8080` in the default browser automatically.
3. Default Admin Credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

---

## 4. Setting up Remote Tunnels (Ngrok or Cloudflare)

To expose the system to the public internet securely (for customer tracking and optional remote Admin/Staff management), the setup wizard allows you to pick a provider.

### Option A: Ngrok (Free Public URL)
Ngrok provides a fast, permanent static domain for zero cost.
1. Sign up at [ngrok.com](https://ngrok.com).
2. Go to **Domains** and claim your Free Static Domain (e.g., `fluent-hippo.ngrok-free.app`).
3. Go to **Your Authtoken** and copy the token.
4. Run the LaundryShopMS setup wizard, select **Ngrok**, and paste the Token and Domain. The wizard will automatically install and configure the Ngrok background service for you.

### Option B: Cloudflare Zero Trust (Custom Domain)
If you own a custom domain (e.g., `faithlaundry.com`) and want maximum protection, use Cloudflare.
1. Log in to the free [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/).
2. Navigate to **Networks > Tunnels** and create a new tunnel named `faithlaundry-local`.
3. Configure Public Hostname Routes (e.g., `track.faithlaundry.com` pointing to `HTTP localhost:8765`).
4. Copy the generated Tunnel Token.
5. Run the LaundryShopMS setup wizard, select **Cloudflare**, and paste the Token. The wizard will automatically install the cloudflared background service.

### Zero Trust Access Rule (Remote App Protection)
If using Cloudflare, to ensure the remote Admin/Staff app cannot be accessed by unauthorized internet traffic:
1. In Cloudflare Zero Trust, go to **Access > Applications**.
2. Add an Application for `app.faithlaundry.com`.
3. Set Policy Rule: **Include > Emails > `owner@faithlaundry.com`, `staff@faithlaundry.com`**.
4. Whenever someone opens `app.faithlaundry.com` remotely, Cloudflare requires a **One-Time Passcode (OTP)** sent to their email before showing the login screen.

---

## 5. Security & Maintenance

### Firewall
- Windows Firewall requires outbound HTTPS access for the selected tunnel provider (`ngrok` is the current provider).
- **No inbound router ports need to be opened.**

### Automated Nightly Database Backup
A Windows Task Scheduler task is created to dump the database nightly:
```cmd
pg_dump -U postgres -d postgres -F c -b -v -f "C:\Backups\laundry_db_%date:~-4,4%%date:~-10,2%%date:~-7,2%.backup"
```

### Uninstallation
To cleanly uninstall the application:
1. Go to **Windows Settings > Apps > Installed Apps**.
2. Search for **Laundry Shop Management System**.
3. Click **Uninstall** — the uninstaller will automatically stop the background service, unregister it, remove the application files, Desktop shortcut, and Start Menu folder.
