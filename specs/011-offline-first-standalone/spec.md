# Technical Design Document: Offline-First Standalone System Transition

**Feature Branch**: `[011-offline-first-standalone]`

**Created**: 2026-07-14

**Status**: Draft

**Input**: User description: "Translate the markdown documentations on /docs into a polished, enterprise-grade technical specification."

## 1. Executive Summary & Architectural Decisions

The objective of this phase is to enhance the existing Java, Next.js, and PostgreSQL application by transitioning it into a highly resilient, Offline-First Standalone System. This architecture addresses the need for uninterrupted operations during local network outages, shifting the system from a synchronous cloud application to a distributed, eventual-consistency model.

### Key Architectural Decisions Reached

- **Hardware Enforce ("Protect the Stack")**: The system mandates a Desktop OS (specifically Windows on a laptop or Surface tablet) to operate. This maintains the integrity of the native Java and PostgreSQL stack, avoiding complex containerization or emulation layers on mobile devices.
- **Database Migration Strategy ("Wipe and Replace")**: Instead of executing complex sequential data migrations for the prototype phase, the system will destructively modify `V1__init.sql` to utilize UUIDs natively across all primary keys. Existing prototype data will be discarded.
- **Database Distribution**: PostgreSQL will be installed and managed via a PowerShell setup script (`setup_windows.ps1`). This script will silently download, install, and register PostgreSQL as a background Windows service, requiring zero manual configuration by the end user.
- **Sync Conflict Resolution ("Local Wins")**: The shop counter device acts as the absolute source of truth. The Cloud API will perform idempotent UPSERT operations, overwriting any cloud-side changes with local data, ensuring data integrity matches the physical reality of the shop.

## 2. System Design & Offline-First Topology

The system operates under a distributed topology designed for absolute local autonomy. 

- **Local Autonomy**: The system captures data instantly on the local machine. Network connectivity is not required for any core business operation (order creation, payment processing, customer management).
- **Eventual Consistency**: A background synchronization engine bridges local data to a remote cloud database. Operations are queued locally and pushed to the cloud asynchronously, fulfilling administrative requirements for remote customer tracking and digital notifications without blocking local workflows.
- **Network Partition Resilience**: During a network partition, the application continues to function normally. Queued events accumulate in the local Outbox. Upon connection restoration, the system automatically flushes the queue, achieving eventual consistency with the cloud without manual intervention.

## 3. Database Migration Strategy (UUID Implementation)

To support distributed data creation across potentially multiple offline nodes without sequence collisions, the system requires globally unique identifiers.

- **Primary Keys**: All entities (`service_rates`, `customers`, `orders`, `payments`, etc.) will transition from sequential `BIGSERIAL`/`BIGINT` to `UUID DEFAULT gen_random_uuid()`.
- **Foreign Keys**: All foreign key relationships will be updated to reference `UUID` columns.
- **Application Layer**: JPA entities in `backend/src/main/java/com/himotech/laundryms/**/entity/*.java` will implement `@Id` fields of type `java.util.UUID` with `@GeneratedValue(strategy = GenerationType.UUID)`.
- **API Contracts**: DTOs will be updated to expect string-formatted UUIDs instead of numeric identifiers.
- **Execution**: The `V1__init.sql` Flyway migration script will be rewritten to natively define these UUID constraints, replacing the existing sequential ID strategy.

## 4. Synchronization Architecture (Transactional Outbox Pattern)

To guarantee that no local data changes are lost before being synchronized to the cloud, the system employs the Transactional Outbox Pattern.

- **Outbox Event Capture**: Core application services will be refactored to publish an `OutboxEvent` entity within the *same local database transaction* as the primary record save. This guarantees atomicity; if the business transaction commits, the sync event is durably stored.
- **Outbox Entity Structure**: The `OutboxEvent.java` entity will capture: `id` (UUID), `aggregate_type` (String), `aggregate_id` (UUID), `payload` (JSONB), `sync_status` (PENDING, COMPLETED, FAILED), and `retry_count` (Integer).
- **Synchronization Worker**: A Spring `@Scheduled` service (`SyncWorker.java`) will periodically poll the local database for `PENDING` records. 
- **Cloud Delivery**: The worker will push JSON payloads to the defined `CLOUD_API_URL`. The Cloud API will execute idempotent UPSERTs based on the UUIDs, enforcing the "Local Wins" conflict resolution strategy.
- **Resilience**: Failed sync attempts will increment the `retry_count` and remain in the queue for future processing, utilizing exponential backoff if necessary.

## 5. Build, Bundling & Execution Strategy

The system will be packaged into a unified, installable artifact for the Windows target environment.

- **Static Asset Generation**: The Next.js frontend (`frontend/next.config.mjs`) will be configured with `output: 'export'`, generating static HTML/CSS/JS assets. Next.js dynamic routes must implement `generateStaticParams()` to support this mode.
- **Maven Integration**: The `frontend-maven-plugin` will be integrated into the Spring Boot backend's `pom.xml` to execute `npm run build` during the build lifecycle. The `maven-resources-plugin` will subsequently copy the `frontend/out/` directory into `backend/target/classes/public/`.
- **SPA Routing**: A `SpaRedirectFilter` in Spring Boot will ensure that all non-API requests fallback to serving `index.html`, supporting Next.js client-side routing.
- **Executable Packaging**: A custom PowerShell script (`scripts/build_standalone.ps1`) will automate the Maven build process and utilize the Java Packaging Tool (`jpackage`) to wrap the Spring Boot JAR and the bundled JRE into a native Windows Installer (`.msi`).

## 6. Infrastructure Security & Hardening

Securing the local installation and the cloud synchronization channel is critical.

- **Local Network Isolation**: The `application.yml` configuration will enforce `server.address: 127.0.0.1`, restricting the Spring Boot server to bind exclusively to the localhost interface. This prevents external access to the application from other devices on the local network.
- **Static Asset Permissions**: `SecurityConfig.java` will be updated to explicitly permit unauthenticated public access to the embedded static frontend assets (`/`, `/**/*.html`, `/**/*.css`, `/**/*.js`, etc.) while securing API endpoints.
- **Synchronization Security**: Payloads pushed by the `SyncWorker` to the Cloud API will be secured using JWT tokens and HMAC signatures to verify the authenticity and integrity of the data originating from the local node.

## 7. Quality Assurance & Verification Plan

Verification will involve both automated test suites and manual validation of the standalone topology.

### Automated Verification
- **UUID Migration**: Execute `mvn test` to ensure Flyway schema migrations succeed and JPA repositories correctly handle UUID entities.
- **Sync Logic**: Implement WireMock tests for `SyncWorker` to validate polling behavior, successful payload delivery, and error handling (retry logic) when the simulated Cloud API is unavailable.

### Manual Verification
- **Local Autonomy Test**: Disconnect the machine from the internet, create an order, verify local persistence, reconnect to the internet, and observe the `SyncWorker` successfully flushing the event to the cloud.
- **Standalone Serving Test**: Run the compiled Spring Boot application and navigate to `http://127.0.0.1:8080/` to verify that Next.js static assets and client-side routing function correctly.
- **Installer Test**: Execute `setup_windows.ps1` and the `jpackage`-generated `.msi` in a clean Windows Sandbox environment to verify silent PostgreSQL installation and application launch.
