# Technical Design Document: Offline-First Standalone System Transition

**Feature Branch**: `[011-offline-first-standalone]`

**Created**: 2026-07-14

**Status**: Draft

**Input**: User description: "Translate the markdown documentations on /docs into a polished, enterprise-grade technical specification."

## 1. Executive Summary & Architectural Decisions

The objective of this phase is to enhance the existing Java, Next.js, and PostgreSQL application by transitioning it into a highly resilient, Offline-First Standalone System. This architecture addresses the need for uninterrupted operations during local network outages, shifting the system from a synchronous cloud application to a distributed, eventual-consistency model.

### Key Architectural Decisions Reached

- **Hardware Enforce ("Protect the Stack")**: The system mandates an x64 Windows Desktop OS (specifically Windows 10/11 on a laptop or Surface tablet) to operate. ARM64 is not officially supported. The bundled JRE will be capped at `-Xmx512m` and PostgreSQL `shared_buffers` at `128MB`, ensuring total memory overhead remains under 1GB to easily run on lower-end x64 tablets.
- **Database Migration Strategy ("Wipe and Replace")**: The system will destructively modify `V1__init.sql` to utilize UUIDs natively across all primary keys. Existing prototype data, including previous audit logs, will be intentionally discarded to start with a clean state. Seed data will be loaded via `V1.1__core_data.sql` during initial setup.
- **Database Distribution**: PostgreSQL will be managed via a PowerShell setup script (`setup_windows.ps1`). If installation fails, standard MSI rollback actions will uninstall the partial PostgreSQL files and remove the application directory. On runtime launch, if PostgreSQL is missing, the app will show a "Database Initialization Failed" prompt.
- **Sync Conflict Resolution ("Local Wins")**: The shop counter device acts as the absolute source of truth. The Cloud API will perform idempotent UPSERT operations, overwriting any cloud-side changes with local data regardless of timestamps, ensuring data integrity matches the physical reality of the shop.

## 2. System Design & Offline-First Topology

The system operates under a distributed topology designed for absolute local autonomy. 

- **Local Autonomy**: The system captures data instantly on the local machine. Network connectivity is not required for any core business operation. Local operations guarantee UI response within 100ms.
- **Eventual Consistency**: A background synchronization engine bridges local data to a remote cloud database. Operations are queued locally and pushed to the cloud asynchronously, fulfilling administrative requirements for remote customer tracking and digital notifications without blocking local workflows.
- **Network Partition Resilience**: During a network partition, the application continues to function normally. Queued events accumulate in the local Outbox. Upon connection restoration, the system automatically flushes the queue, achieving eventual consistency with the cloud without manual intervention.
- **Concurrent Modifications**: If multiple offline local tabs attempt to modify the same order, PostgreSQL row-level locks guarantee atomic writes. The last committed local state is what is appended to the Outbox.

## 3. Database Migration Strategy (UUID Implementation)

To support distributed data creation across potentially multiple offline nodes without sequence collisions, the system requires globally unique identifiers.

- **Primary Keys**: All entities will transition from sequential `BIGSERIAL`/`BIGINT` to `UUID DEFAULT gen_random_uuid()`.
- **Foreign Keys**: All foreign key relationships will be updated to reference `UUID` columns.
- **Application Layer**: JPA entities in `backend/src/main/java/com/himotech/laundryms/**/entity/*.java` will implement `@Id` fields of type `java.util.UUID`.
- **API Contracts**: DTOs will be updated to expect string-formatted UUIDs instead of numeric identifiers.
- **Execution**: The `V1__init.sql` Flyway migration script will be rewritten to natively define these UUID constraints, replacing the existing sequential ID strategy. `V1.1__core_data.sql` will seed initial service rates.

## 4. Synchronization Architecture (Transactional Outbox Pattern)

To guarantee that no local data changes are lost before being synchronized to the cloud, the system employs the Transactional Outbox Pattern.

- **Outbox Event Capture**: Core application services will be refactored to publish an `OutboxEvent` entity within the *same local database transaction* as the primary record save. This guarantees atomicity; if the HTTP push fails later, the data is not lost.
- **Outbox Entity Structure**: The `OutboxEvent.java` entity will capture: `id` (UUID), `aggregate_type` (String), `aggregate_id` (UUID), `payload` (JSONB), `sync_status` (PENDING, COMPLETED, FAILED), and `retry_count` (Integer). The disk capacity constraint is not an issue locally, as 10 million events consume less than 10GB.
- **Synchronization Worker**: A Spring `@Scheduled` service (`SyncWorker.java`) will periodically poll the local database for `PENDING` records. 
- **Cloud Delivery**: The worker will push JSON payloads to the defined `CLOUD_API_URL`.
- **Resilience**: Failed sync attempts will increment the `retry_count` and utilize an exponential backoff timeline (retry count * 5000ms: 5s, 10s, 15s). After 5 failed attempts, the status is set to `FAILED` and requires administrative attention.

## 5. Build, Bundling & Execution Strategy

The system will be packaged into a unified, installable artifact for the Windows target environment.

- **Static Asset Generation**: The Next.js frontend (`frontend/next.config.mjs`) will be configured with `output: 'export'`. Next.js dynamic routes (`/customers/[id]`, `/orders/[id]`) will utilize Server Component wrappers in their `page.tsx` that export `generateStaticParams()` returning `[]`, which dynamically load the client components.
- **Maven Integration**: The `frontend-maven-plugin` will be integrated into the Spring Boot backend's `pom.xml` to execute `npm run build` during the build lifecycle. The `maven-resources-plugin` will subsequently copy the `frontend/out/` directory into `backend/target/classes/public/`.
- **SPA Routing**: A `SpaRedirectFilter` in Spring Boot will ensure that all non-API requests fallback to serving `index.html`. API endpoints under `/api/**` remain protected by `SecurityConfig`.
- **Executable Packaging**: A custom PowerShell script (`scripts/build_standalone.ps1`) will automate the Maven build process and utilize the Java Packaging Tool (`jpackage`) to wrap the Spring Boot JAR and the bundled JRE into a native Windows Installer (`.msi`). The `.msi` will require Administrator Privileges during installation to configure the PostgreSQL Windows Service.

## 6. Infrastructure Security & Hardening

Securing the local installation and the cloud synchronization channel is critical.

- **Local Network Support**: The `application.yml` configuration will enforce `server.address: 0.0.0.0` (or default binding), allowing the Spring Boot server to accept requests from the local shop network (Wi-Fi). This enables staff to access the system via tablets or mobile phones (`http://<server-ip>:8080/`).
- **Static Asset Permissions**: `SecurityConfig.java` will be updated to explicitly permit unauthenticated public access to the embedded static frontend assets (`/`, `/**/*.html`, `/**/*.css`, `/**/*.js`, etc.) while securing API endpoints.
- **Synchronization Security**: Payloads pushed by the `SyncWorker` to the Cloud API will be secured using JWT tokens and HMAC signatures (using standard HS256 algorithm) to verify the authenticity and integrity of the data originating from the local node.

## 7. Quality Assurance & Verification Plan

Verification will involve both automated test suites and manual validation of the standalone topology.

### Automated Verification
- **UUID Migration**: Execute `mvn test` to ensure Flyway schema migrations succeed and JPA repositories correctly handle UUID entities.
- **Sync Logic**: Implement WireMock tests for `SyncWorker` to validate polling behavior, successful payload delivery, and error handling (retry logic) when the simulated Cloud API is unavailable.

### Manual Verification
- **Local Autonomy Test**: Disconnect the machine from the internet, create an order, verify local persistence, reconnect to the internet, and observe the `SyncWorker` successfully flushing the event to the cloud.
- **Standalone Serving Test**: Run the compiled Spring Boot application and navigate to `http://127.0.0.1:8080/` to verify that Next.js static assets and client-side routing function correctly.
- **Installer Test**: Execute `setup_windows.ps1` and the `jpackage`-generated `.msi` in a clean Windows Sandbox environment to verify silent PostgreSQL installation and application launch.
