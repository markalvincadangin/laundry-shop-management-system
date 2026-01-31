-- USERS
CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       first_name VARCHAR(50),
                       last_name VARCHAR(50),
                       username VARCHAR(50) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       role VARCHAR(20) NOT NULL
);

-- CUSTOMERS
CREATE TABLE customers (
                           id BIGSERIAL PRIMARY KEY,
                           first_name VARCHAR(50) NOT NULL,
                           last_name VARCHAR(50) NOT NULL,
                           contact_number VARCHAR(20) NOT NULL
);

-- LAUNDRY ORDERS
CREATE TABLE laundry_orders (
                                id BIGSERIAL PRIMARY KEY,
                                customer_id BIGINT NOT NULL,
                                created_by BIGINT NOT NULL,
                                order_reference_number VARCHAR(30) NOT NULL UNIQUE,
                                service_type VARCHAR(20) NOT NULL,
                                weight NUMERIC(5,2) NOT NULL,
                                special_items VARCHAR(255),
                                total_amount NUMERIC(10,2) NOT NULL,
                                order_status VARCHAR(20) NOT NULL,
                                payment_status VARCHAR(20) NOT NULL,
                                date_received TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                date_released TIMESTAMP,

                                CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
                                CONSTRAINT fk_order_user FOREIGN KEY (created_by) REFERENCES users(id)
);

-- PAYMENTS (1 payment per order)
CREATE TABLE payments (
                          id BIGSERIAL PRIMARY KEY,
                          order_id BIGINT NOT NULL UNIQUE,
                          received_by BIGINT NOT NULL,
                          amount_paid NUMERIC(10,2) NOT NULL,
                          payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                          CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES laundry_orders(id),
                          CONSTRAINT fk_payment_user FOREIGN KEY (received_by) REFERENCES users(id)
);
