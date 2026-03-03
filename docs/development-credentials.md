# Development Credentials
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** CRED-001  
> **Version:** 1.0  
> **Date:** 2026-02-13  
> **Status:** Living Document

---

## Document Control
- **Document Type:** Development Credentials
- **Related Documents:** [Implementation Status](06-implementation/implementation-status.md), [User Stories](02-requirements/user-stories.md)
- **Confidentiality:** **INTERNAL ONLY** — Development/Testing Only

---

## Overview

This document lists the default credentials created for **development and testing environments only**.

> ⚠️ **SECURITY WARNING**: These credentials should NEVER be used in production environments. The database migration will only create these accounts when `SPRING_PROFILES_ACTIVE=dev`.

## Default User Accounts

### Owner Account
- **Username**: `owner`
- **Password**: `owner123`
- **Role**: Owner
- **Name**: System Owner

### Staff Account
- **Username**: `staff`
- **Password**: `staff123`
- **Role**: Staff
- **Name**: System Staff

## Environment Configuration

The seed users are created by the Flyway migration `V2__seed_users.sql` only when the application is running with the `dev` profile.

To enable seed users in development:
```bash
export SPRING_PROFILES_ACTIVE=dev
```

Or in your `.env` file:
```
SPRING_PROFILES_ACTIVE=dev
```

## Production Deployment

In production environments:
1. Do NOT set `SPRING_PROFILES_ACTIVE=dev`
2. Create admin/owner accounts through the application's user management interface
3. Use strong, unique passwords for all accounts
4. Enable additional security measures (2FA, password policies, etc.)

## Changing Default Passwords

If you need to change the default development passwords:

1. Generate new BCrypt password hashes using an online tool or:
   ```bash
   # Using htpasswd (if available) - cost factor 10 is used for faster development iterations
   htpasswd -bnBC 10 "" your_password | tr -d ':\n'
   
   # Or using Python
   python3 -c "import bcrypt; print(bcrypt.hashpw(b'your_password', bcrypt.gensalt(10)).decode())"
   ```

   > **Note**: We use BCrypt cost factor 10 for development to speed up test execution and development workflows. Production deployments should use higher cost factors (12-14) for better security.

2. Update the password hashes in `backend/src/main/resources/db/migration/V2__seed_users.sql`
3. Update this documentation with the new passwords
