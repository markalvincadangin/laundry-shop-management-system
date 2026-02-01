# Laundry Shop Management System

A centralized, full-stack information system designed to automate laundry order recording, status tracking, payment management, and sales reporting for small-scale laundry businesses.

## 🚀 Project Overview

This project aims to replace manual logbook processes with a digital solution to address issues such as:
- Difficulty in tracking laundry status
- Unclear payment records
- Limited management visibility

The system provides a streamlined workflow from order intake through delivery, with integrated payment verification and comprehensive reporting capabilities.

## ✨ Key Features

- **Order Management:** Create and track laundry orders with unique reference numbers and customer details.
- **Status Tracking:** Real-time monitoring of laundry stages (Received → Processing → Ready → Released).
- **Payment Verification:** Link payments to orders and prevent releasing unpaid laundry.
- **Reporting:** Automated generation of daily sales and monthly income reports.
- **Customer Management:** Maintain customer information and order history.
- **Sales Analytics:** Visibility into business performance and transaction trends.

## 🛠️ Technology Stack

| Component          | Technology                                   |
|--------------------|----------------------------------------------|
| **Backend**        | Java 21 (LTS), Spring Boot 3.3+, Maven       |
| **Frontend**       | Next.js 14+, React, TypeScript, Tailwind CSS |
| **Database**       | PostgreSQL 16                                |
| **Migrations**     | Flyway                                       |
| **Infrastructure** | Docker & Docker Compose                      |

## 📂 Repository Structure

```
laundry-shop-management-system/
├── backend/                     # Spring Boot REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/           # Java source code
│   │   │   └── resources/
│   │   │       ├── db/migration/  # Flyway SQL migrations
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml
│   ├── mvnw.cmd                # Maven wrapper (Windows)
│   └── mvnw                    # Maven wrapper (Unix)
├── frontend/                    # Next.js client application
├── docker/
│   └── docker-compose.yml      # PostgreSQL container setup
├── docs/                        # Project documentation and diagrams
│   ├── 1. Problem Statement.pdf
│   ├── 2. Stakeholder Analysis.pdf
│   ├── 3. Project Roles & Responsibilities.pdf
│   ├── 4. Project Schedule.pdf
│   ├── 5. Project Charter.pdf
│   ├── 6. Process Matrix.pdf
│   ├── 7. Functional Requirements.pdf
│   ├── 8. Non-Functional Requirements.pdf
│   ├── 9. FDD.pdf
│   ├── 10. DFD.pdf
│   ├── 11. ERD.pdf
│   ├── 12. Forms and Report Design.pdf
│   └── diagrams/
│       ├── Laundry Shop Management System-DFD-Level 0.pdf
│       ├── Laundry Shop Management System-DFD-Level 1.pdf
│       ├── Laundry Shop Management System-ERD.pdf
│       └── Laundry Shop Management System-FDD.pdf
└── README.md                    # This file
```

## 📋 Prerequisites

Ensure the following is installed on your machine:

- **Docker Desktop** (for running PostgreSQL)
- **Java JDK 21** or higher
- **Maven** (or use the included Maven wrapper: `mvnw.cmd`)
- **Node.js 18 LTS** or higher
- **Git** (for version control)

## 🚀 Getting Started

### 1. Database Setup (Docker)

We use Docker to run a consistent PostgreSQL instance without requiring local installation.

```powershell
# From the repository root
Copy-Item docker\.env.example docker\.env

# Start the PostgreSQL container
docker compose -f docker/docker-compose.yml up -d

# Verify the container is running
docker compose -f docker/docker-compose.yml ps
```

**Database Configuration:**
- **Port:** 5433 (mapped to 5432 internally)
- **Database:** laundry_db
- **Username:** `${DB_USER}` (from `.env` in the repository root)
- **Password:** `${DB_PASSWORD}` (from `.env` in the repository root)

To stop the database:
```powershell
docker compose -f docker/docker-compose.yml down
```

To reset the database (delete all data and start fresh):
```powershell
docker compose -f docker/docker-compose.yml down -v
```

### 2. Backend Setup (Spring Boot)

The backend handles all business logic, API endpoints, and database interactions.

1. Open the `backend/` folder in your IDE (IntelliJ IDEA recommended).
2. Ensure the Docker container is running (run `docker compose -f docker/docker-compose.yml up -d` from the repository root).
3. Run the application via `LaundrySystemApplication.java` or use Maven:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

**Verification:**
- The application should start on `http://localhost:8080`
- Flyway will automatically create and migrate all database tables
- Check the console logs for migration details

### 3. Frontend Setup (Next.js)

The frontend provides the user interface for managing orders, customers, and reports.

```powershell
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

**Access the application:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api`

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the root directory based on `.env.example`:

```powershell
Copy-Item .env.example .env
```

Then update the values as needed:

```env
# Database Configuration
DB_USER=laundry_user
DB_PASSWORD=<your_secure_password>
DB_HOST=localhost
DB_PORT=5433
DB_NAME=laundry_db

# Backend Configuration
SPRING_PORT=8080

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**Important:**
- Never commit the `.env` file to version control. It is already excluded in `.gitignore`.
- Commit `.env.example` so new developers can bootstrap quickly.
- Each developer should maintain their own local `.env` file with appropriate credentials.

### Backend Configuration
- **File:** `backend/src/main/resources/application.properties`
- **Default settings:**
  - Server port: 8080
  - Database URL: jdbc:postgresql://\${DB_HOST}:\${DB_PORT}/\${DB_NAME}
  - Flyway auto-migration: enabled
- Environment variables are injected at runtime from the `.env` file

### Database Migrations
All database schema changes are version-controlled using Flyway:
- **Location:** `backend/src/main/resources/db/migration/`
- **Format:** V{version}__{description}.sql
- Migrations execute automatically on application startup

For detailed data model and relationships, see `docs/11. ERD.pdf`.

## 👨‍💼 Development Workflow

### Local Development Setup
1. Clone the repository
2. Create `.env` file from `.env.example`
3. Start Docker containers: `docker compose -f docker/docker-compose.yml up -d`
4. Start backend: `cd backend && .\mvnw.cmd spring-boot:run`
5. Start frontend: `cd frontend && npm run dev`
6. Access the application at `http://localhost:3000`

### Git Workflow
- Create feature branches: `git checkout -b feature/your-feature-name`
- Keep commits atomic and descriptive
- Push to the feature branch and create Pull Request
- Never commit `.env` or sensitive configuration files
- Follow conventional commit messages: `feat:`, `fix:`, `docs:`, `refactor:`, etc.

### Code Quality
- Backend: Follow Java coding standards and Spring Boot best practices
- Frontend: Use TypeScript for type safety
- Test your changes before pushing
- Ensure no sensitive data in commit messages or code

## 🔧 Troubleshooting

### Database Connection Issues
- **Verify Docker is running:** `docker compose -f docker/docker-compose.yml ps`
- **Check credentials:** Ensure `.env` in the repository root has correct `DB_USER` and `DB_PASSWORD`
- **Verify port availability:** Ensure PostgreSQL port 5433 is not in use
- **Restart container:** `docker compose -f docker/docker-compose.yml down && docker compose -f docker/docker-compose.yml up -d`

### Flyway Migrations Fail
- **Check migration format:** Files should follow `V{version}__{description}.sql` (e.g., `V1__init.sql`)
- **Verify file encoding:** Ensure all migration files are in UTF-8 format
- **Review logs:** Check application console output for detailed migration error messages
- **Reset database:** `docker compose -f docker/docker-compose.yml down -v && docker compose -f docker/docker-compose.yml up -d`

### Backend Startup Issues
- **Check Java version:** `java -version` (should be 21 or higher)
- **Verify Maven:** `.\mvnw.cmd --version`
- **Clean and rebuild:** `.\mvnw.cmd clean install`
- **Check port 8080:** Ensure port 8080 is not in use by another application

### Frontend Build Issues
- **Clear node_modules (Windows PowerShell):**
  ```powershell
  Remove-Item -Recurse -Force node_modules
  npm install
  ```
- **Clear Next.js cache:**
  ```powershell
  Remove-Item -Recurse -Force .next
  npm run dev
  ```
- **Port 3000 in use:** 
  ```powershell
  npm run dev -- -p 3001
  ```

## 📞 Support & Governance

For project governance details, team roles, and responsibilities:
- **Project Charter:** `docs/5. Project Charter.pdf`
- **Team Structure:** `docs/3. Project Roles & Responsibilities.pdf`

## 📝 License

[Add your license here if applicable]
