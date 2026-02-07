-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums (Idempotent Creation)
DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
            CREATE TYPE user_role AS ENUM ('OWNER', 'STAFF');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
            CREATE TYPE order_status AS ENUM ('RECEIVED', 'WASHING', 'DRYING', 'FOLDING', 'READY_FOR_PICKUP', 'RELEASED', 'CANCELLED');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
            CREATE TYPE payment_status AS ENUM ('UNPAID', 'PAID', 'PARTIAL');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
            CREATE TYPE payment_method AS ENUM ('CASH', 'GCASH', 'BANK_TRANSFER');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN
            CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'FAILED');
        END IF;
    END$$;

-- Tables

-- 1. Configuration: Service Rates
CREATE TABLE service_rates (
                               id SERIAL PRIMARY KEY,
                               service_name VARCHAR NOT NULL,
                               base_price_per_load DECIMAL(10,2) NOT NULL,
                               kg_limit_per_load DECIMAL(5,2) NOT NULL,
                               price_per_extra_minute DECIMAL(10,2) NOT NULL,
                               is_active BOOLEAN NOT NULL DEFAULT TRUE,
                               CONSTRAINT uq_service_rates_service_name UNIQUE (service_name)
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
                                     id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     username      VARCHAR NOT NULL UNIQUE,
                                     password_hash VARCHAR NOT NULL,
                                     role          user_role NOT NULL DEFAULT 'STAFF',
                                     first_name    VARCHAR NOT NULL,
                                     last_name     VARCHAR NOT NULL,
                                     is_active     BOOLEAN NOT NULL DEFAULT TRUE,
                                     created_at    TIMESTAMP NOT NULL DEFAULT now(),
                                     updated_at    TIMESTAMP NOT NULL DEFAULT now()
);

-- 3. Customers
CREATE TABLE IF NOT EXISTS customers (
                                         id             BIGSERIAL PRIMARY KEY,
                                         first_name     VARCHAR NOT NULL,
                                         last_name      VARCHAR NOT NULL,
                                         contact_number VARCHAR NOT NULL,
                                         created_at     TIMESTAMP NOT NULL DEFAULT now(),
                                         updated_at     TIMESTAMP NOT NULL DEFAULT now(),
                                         CONSTRAINT uq_customers_identity UNIQUE (last_name, first_name, contact_number)
);

-- 4. Orders (The Core Transaction Table)
CREATE TABLE IF NOT EXISTS orders (
                                      id                 BIGSERIAL PRIMARY KEY,
                                      reference_number   VARCHAR NOT NULL UNIQUE,
                                      customer_id        BIGINT NOT NULL REFERENCES customers(id),
                                      created_by_user_id UUID NOT NULL REFERENCES users(id),

    -- Service Link & Weight
                                      service_rate_id    INT NOT NULL REFERENCES service_rates(id),
                                      weight_kg          DECIMAL(10,2) NOT NULL,
                                      total_loads        INT NOT NULL,

    -- PRICING SNAPSHOTS (Critical for History)
                                      base_price_per_load    DECIMAL(10,2) NOT NULL,
                                      kg_limit_per_load      DECIMAL(5,2)  NOT NULL,
                                      price_per_extra_minute DECIMAL(10,2) NOT NULL,

    -- Extras & Computations
                                      extra_minutes         INT NOT NULL DEFAULT 0,
                                      base_amount           DECIMAL(10,2) NOT NULL,
                                      extra_minutes_amount  DECIMAL(10,2) NOT NULL,
                                      addons_total_amount   DECIMAL(10,2) NOT NULL DEFAULT 0,
                                      grand_total           DECIMAL(10,2) NOT NULL,

    -- Status & Workflow
                                      current_status     order_status NOT NULL DEFAULT 'RECEIVED',
                                      payment_status     payment_status NOT NULL DEFAULT 'UNPAID',

                                      created_at         TIMESTAMP NOT NULL DEFAULT now(),
                                      updated_at         TIMESTAMP NOT NULL DEFAULT now()
);

-- 5. Order Add-ons
CREATE TABLE IF NOT EXISTS order_add_ons (
                                             id       BIGSERIAL PRIMARY KEY,
                                             order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                                             name     VARCHAR NOT NULL,
                                             price    DECIMAL(10,2) NOT NULL,
                                             quantity INT NOT NULL DEFAULT 1
);

-- 6. Order Status History (Audit Trail)
CREATE TABLE IF NOT EXISTS order_status_logs (
                                                 id                 BIGSERIAL PRIMARY KEY,
                                                 order_id           BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                                                 previous_status    order_status,
                                                 new_status         order_status NOT NULL,
                                                 changed_by_user_id UUID NOT NULL REFERENCES users(id),
                                                 changed_at         TIMESTAMP NOT NULL DEFAULT now(),
                                                 notes              TEXT
);

-- 7. Payments
CREATE TABLE IF NOT EXISTS payments (
                                        id                  BIGSERIAL PRIMARY KEY,
                                        order_id            BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
                                        amount_paid         DECIMAL(10,2) NOT NULL,
                                        payment_method      payment_method NOT NULL DEFAULT 'CASH',
                                        received_by_user_id UUID NOT NULL REFERENCES users(id),
                                        payment_date        TIMESTAMP NOT NULL DEFAULT now(),
                                        remarks             TEXT
);

-- 8. Notifications (Optional MVP Feature)
CREATE TABLE IF NOT EXISTS notifications (
                                             id          BIGSERIAL PRIMARY KEY,
                                             order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                                             customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
                                             message     TEXT NOT NULL,
                                             created_at  TIMESTAMP NOT NULL DEFAULT now(),
                                             sent_at     TIMESTAMP,
                                             status      notification_status NOT NULL DEFAULT 'PENDING'
);

-- Seed Data: Default Active Service Rate
INSERT INTO service_rates (
    service_name,
    base_price_per_load,
    kg_limit_per_load,
    price_per_extra_minute,
    is_active
) VALUES (
             'Standard Wash',
             120.00,
             8.00,
             1.00,
             TRUE
         )
ON CONFLICT (service_name) DO NOTHING;