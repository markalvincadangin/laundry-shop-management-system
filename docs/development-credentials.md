# Development Credentials
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** CRED-001  
> **Version:** 1.1  
> **Date:** 2026-05-05  
> **Status:** Living Document

---

## Document Control
- **Document Type:** Development Credentials
- **Related Documents:** [Implementation Status](06-implementation/implementation-status.md), [User Stories](02-requirements/user-stories.md)
- **Confidentiality:** **INTERNAL ONLY** — Development/Testing Only

---

## Overview

This document describes how to configure development seed credentials for **development and testing environments only**.

> ⚠️ **SECURITY WARNING**: Credentials should NEVER be hardcoded in source control. Provide values via environment variables only.

## Development Seed Accounts

When development seed users are enabled, the migration creates:
- Admin account (role `Admin`)
- Staff account (role `STAFF`)

Usernames and password hashes are sourced from environment variables.

## Environment Configuration

The seed users are created by Flyway migration `V2__seed_users.sql` only when all conditions are true:
1. `SPRING_PROFILES_ACTIVE=dev`
2. `SEED_ADMIN_USERNAME` and `SEED_ADMIN_PASSWORD_HASH` are set
3. `SEED_STAFF_USERNAME` and `SEED_STAFF_PASSWORD_HASH` are set

Example configuration in `backend/.env`:

```
SPRING_PROFILES_ACTIVE=dev
SEED_ADMIN_USERNAME=Admin
SEED_ADMIN_PASSWORD_HASH=$2a$10$replace_with_Admin_bcrypt_hash
SEED_STAFF_USERNAME=staff
SEED_STAFF_PASSWORD_HASH=$2a$10$replace_with_staff_bcrypt_hash
```

## Production Deployment

In production environments:
1. Do NOT set `SPRING_PROFILES_ACTIVE=dev`
2. Create admin/Admin accounts through the application's user management interface
3. Use strong, unique passwords for all accounts
4. Enable additional security measures (2FA, password policies, etc.)

## Generating BCrypt Password Hashes

If you need to create or rotate development passwords:

1. Generate new BCrypt password hashes using an online tool or:
   ```bash
   # Using htpasswd (if available) - cost factor 10 is used for faster development iterations
   htpasswd -bnBC 10 "" your_password | tr -d ':\n'
   
   # Or using Python
   python3 -c "import bcrypt; print(bcrypt.hashpw(b'your_password', bcrypt.gensalt(10)).decode())"
   ```

   > **Note**: We use BCrypt cost factor 10 for development to speed up test execution and development workflows. Production deployments should use higher cost factors (12-14) for better security.

2. Set generated hashes in `backend/.env` using `SEED_ADMIN_PASSWORD_HASH` and `SEED_STAFF_PASSWORD_HASH`
3. Keep plaintext passwords out of source control and documentation
