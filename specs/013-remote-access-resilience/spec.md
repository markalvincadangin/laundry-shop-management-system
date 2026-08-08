# Feature Specification: Remote Access Resilience

**Feature Branch**: `[013-remote-access-resilience]`  
**Created**: 2026-08-07  
**Status**: Draft  
**Input**: User description: "Provide dependable remote access through the shop laptop host, with a clear offline experience and safe recovery from interrupted operations."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Know Whether the Shop System Is Available (Priority: P1)

As a remote customer, staff member, or administrator, I can always open the public web address and immediately see whether the shop system is currently available, rather than encountering a browser or server error when the shop laptop, its internet connection, or its public connection is unavailable.

**Why this priority**: A truthful availability state is the foundation for safe remote use and makes an outage understandable to every kind of user.

**Independent Test**: Make the shop host unavailable while leaving the public web application available; opening the public address shows an offline state. Restore the host and verify the application becomes usable again.

**Acceptance Scenarios**:

1. **Given** the shop host and public connection are available, **When** a remote user opens the public address, **Then** the normal application is available.
2. **Given** the shop host, its internet connection, or its public connection is unavailable, **When** a remote user opens the public address, **Then** the user sees a clear system-offline state with a retry path instead of an unhandled error.
3. **Given** the application is already open and the shop host becomes unavailable, **When** the application detects the loss of service, **Then** it clearly indicates that the displayed data may be stale and prevents new data-changing actions.

---

### User Story 2 - Use the Same System Remotely (Priority: P1)

As an authorized staff member or administrator away from the shop, I can sign in through the public address and use the functions allowed by my role; as a customer, I can use the public tracking experience. Remote access is available only while the shop host is operating and connected to the internet.

**Why this priority**: The business value of the feature is that customers, staff, and administrators can use the same live shop system beyond the local network.

**Independent Test**: With the shop host running, use the public address from a separate network to track an order and to sign in as Staff and Admin. Confirm each role has the same permitted and prohibited actions as when using the local system.

**Acceptance Scenarios**:

1. **Given** the shop host is available, **When** a customer accesses order tracking from the public address, **Then** the customer can use the existing public tracking workflow.
2. **Given** the shop host is available, **When** a Staff or Admin user signs in remotely, **Then** the system enforces the same authentication, authorization, and role boundaries as local access.
3. **Given** the shop host is unavailable, **When** a remote user attempts tracking or sign-in, **Then** no protected or stale data is exposed and the user receives the offline state.

---

### User Story 3 - Recover Safely From an Interrupted Change (Priority: P1)

As a remote staff member or administrator, when a connection failure occurs while I submit a business action, I can determine whether the action succeeded without accidentally creating the same order, payment, status change, or other record twice.

**Why this priority**: An outage can occur after the shop system saves a change but before the remote user receives the result. Preventing duplicate business actions protects operational data and customer trust.

**Independent Test**: Interrupt connectivity while a supported data-changing action is submitted, restore service, and retry the same action. Verify the action is recorded at most once and that the user can obtain its original outcome.

**Acceptance Scenarios**:

1. **Given** a remote data-changing action may have been interrupted, **When** its outcome cannot be confirmed, **Then** the system tells the user that the result is unconfirmed and does not silently repeat the action.
2. **Given** the original action was saved before the interruption, **When** the user retries that same action, **Then** the system returns the original outcome without creating another business change.
3. **Given** an operation identifier is reused for a different action, **When** the different action is submitted, **Then** the system rejects it and preserves the original action.

---

### User Story 4 - Continue Working Locally During an Internet Outage (Priority: P2)

As a shop operator, I can continue to use the system locally on the shop laptop or local network when the internet or public connection fails; only remote access is unavailable.

**Why this priority**: The laptop-hosted system remains the shop's source of truth and must not make daily in-shop work dependent on internet availability.

**Independent Test**: Disconnect the shop host from the internet, then use the local application to complete an existing permitted workflow. Confirm remote users receive the offline state while local work remains available.

**Acceptance Scenarios**:

1. **Given** the internet connection is unavailable but the shop host is running, **When** an authorized user accesses the local application, **Then** local workflows remain available.
2. **Given** the internet connection is unavailable, **When** a remote user visits the public address, **Then** the user sees the remote offline state without affecting local operations.

### Edge Cases

- A user's browser loses its own internet connection: it must present a clear offline/reconnecting state and not offer writes that cannot be sent safely.
- The shop host returns while a remote user is viewing stale data: the user must be able to reconnect and refresh current data before continuing data-changing work.
- A user refreshes or closes the browser after an unconfirmed action: a later recovery attempt must still avoid a duplicate business change.
- A preview or test deployment must not accidentally connect to the live shop host.
- The public connection address changes or is invalid: the deployed public application must fail safely as offline rather than expose an unrelated destination.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a stable public entry point that remains reachable enough to display an availability state when the shop host or its public connection is unavailable.
- **FR-002**: The system MUST make the currently hosted application available to remote customers for public order tracking and to authenticated Staff and Admin users for the actions allowed by their existing roles.
- **FR-003**: The system MUST enforce the same authentication, authorization, and role restrictions for local and remote access.
- **FR-004**: The system MUST determine and communicate whether the remote shop service is available before allowing a remote user to rely on it.
- **FR-005**: When the remote shop service is unavailable, the system MUST display a clear offline state, provide a way to retry, and avoid exposing protected or stale data as current.
- **FR-006**: When service becomes unavailable during an active remote session, the system MUST clearly mark already displayed data as potentially stale and disable all data-changing actions until service is restored and the state is refreshed.
- **FR-007**: The system MUST preserve the shop host's local operation when its internet or public connection is unavailable; an internet outage may remove remote access but must not itself prevent local use.
- **FR-008**: Each supported data-changing business operation MUST carry a client-generated operation identifier that remains the same while the user recovers from an unconfirmed submission.
- **FR-009**: The system MUST record the completed outcome for each operation identifier together with the identity and action it represents, so the same operation can be safely recovered after a connection interruption.
- **FR-010**: When the same operation identifier is submitted again for the same user and the same action, the system MUST return the original completed outcome without applying the business change a second time.
- **FR-011**: When an operation identifier is reused for a different user or different action, the system MUST reject the request without changing business data.
- **FR-012**: Following an unconfirmed data-changing submission, the client MUST not automatically submit a new business operation; it must guide the user to explicitly recover or retry the original operation.
- **FR-013**: The system MUST protect remote session data using the existing secure session and request-forgery protections without making the upstream shop address public to browser clients.
- **FR-014**: The system MUST prevent public or intermediary caching of authenticated, availability, and data-changing responses.
- **FR-015**: The system MUST keep configuration values for public access, the upstream shop connection, and local standalone operation clearly separated, validated, and free of secrets in browser-visible configuration.
- **FR-016**: The system MUST document the required shop-host startup, public connection, deployment, outage handling, and recovery procedures for the operator.
- **FR-017**: The Next.js API client proxy MUST implement a strict request timeout (e.g., 8 seconds) so that slow proxy responses or dropped tunnels result in a graceful offline state instead of a Vercel 504 Gateway Timeout.
- **FR-018**: The Windows installation scripts MUST automatically configure the host machine's power plan to prevent sleep or hibernation when plugged in, ensuring the reverse tunnel remains active.

### Key Entities *(include if feature involves data)*

- **Availability state**: The current known reachability of the remote shop service, including whether users may continue, retry, or only view potentially stale information.
- **Operation recovery record**: A durable record that associates one user and one data-changing action with its operation identifier, request identity, completed outcome, and expiry period.

### Database Migrations

- **Flyway Target**: A new next-sequential Flyway migration for durable operation recovery records.
- **Schema Changes**: Add persistent operation identifiers and completed outcomes needed to recover an interrupted data-changing action without duplicate business changes.

### API Contracts

- **Endpoints Needed**: A remote-service availability probe and recovery behavior for existing supported data-changing endpoints.
- **Security**: Public order tracking remains limited to its existing public contract. Remote Staff and Admin access requires the existing authenticated role checks. Operation recovery records are scoped to the authenticated actor and must not disclose another user's outcome.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When the shop host or public connection is unavailable, 100% of attempts to open the public address display the system-offline state within 5 seconds rather than an unhandled application error.
- **SC-002**: With the shop host available, a customer can complete public order tracking and authorized Staff and Admin users can sign in and use their permitted functions from a separate internet connection.
- **SC-003**: In an automated interrupted-submission test for every supported data-changing operation, restoring service and recovering the original operation produces no duplicate business change.
- **SC-004**: In an internet-outage test, authorized local users can complete an existing local workflow while remote users receive the offline state.
- **SC-005**: Remote authenticated requests, availability responses, and data-changing responses are verified not to be publicly cacheable.

## Assumptions

- The shop laptop remains the source of truth and hosts the application database; this feature does not introduce a cloud database replica or offline synchronization of remote writes.
- A reserved, fixed public connection address is available for the production shop host. The current provider is Ngrok.
- The public web application can remain reachable independently of the shop laptop in order to show the offline state.
- Remote users require an internet connection. The shop host must be running, connected to the internet, and have its public connection operating before remote workflows can succeed.
- No data-changing actions are queued locally in a remote browser for automatic replay after an outage; recovery always uses the original operation identifier and an explicit user decision.
- Preview and test deployments are isolated from the live shop host unless an explicitly configured non-production upstream is provided.
- The existing authentication hardening feature remains the security baseline for remote Staff and Admin sessions.

## Out of Scope

- Replicating the shop database to a cloud service or providing a second live backend.
- Allowing remote users to create, queue, or synchronize business changes while the shop host is offline.
- Automatic retry of an unconfirmed business operation with a new operation identifier.
