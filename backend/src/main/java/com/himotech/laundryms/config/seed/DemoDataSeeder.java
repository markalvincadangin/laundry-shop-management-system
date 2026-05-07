package com.himotech.laundryms.config.seed;

import com.himotech.laundryms.common.enums.OrderStatus;
import com.himotech.laundryms.common.enums.PaymentMethod;
import com.himotech.laundryms.common.enums.PaymentStatus;
import com.himotech.laundryms.common.enums.UserRole;
import com.himotech.laundryms.customers.entity.Customer;
import com.himotech.laundryms.customers.repository.CustomerRepository;
import com.himotech.laundryms.orders.entity.Order;
import com.himotech.laundryms.orders.repository.OrderRepository;
import com.himotech.laundryms.payments.entity.Payment;
import com.himotech.laundryms.payments.repository.PaymentRepository;
import com.himotech.laundryms.rates.entity.ServiceRate;
import com.himotech.laundryms.rates.repository.ServiceRateRepository;
import com.himotech.laundryms.users.entity.User;
import com.himotech.laundryms.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * DemoDataSeeder — Seeds realistic demo data for the Faith Laundry Shop
 * Management System.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DemoDataSeeder implements CommandLineRunner {

    private static final String ADDON_DETERGENT = "Detergent (Ariel)";
    private static final String ADDON_FABCON = "Fabric Conditioner (Downy)";
    private static final DateTimeFormatter REF_DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final ServiceRateRepository serviceRateRepository;
    private final PaymentRepository paymentRepository;
    private final Random random = new Random(42);

    @Value("${flyway.placeholders.seed_admin_username:admin}")
    private String seedAdminUsername;

    @Value("${flyway.placeholders.seed_staff_username:staff}")
    private String seedStaffUsername;

    @Override
    @Transactional
    public void run(String... args) {
        if (customerRepository.count() > 0) {
            log.info("[DemoDataSeeder] Data already present — skipping.");
            return;
        }

        log.info("[DemoDataSeeder] Starting demo data seeding...");

        ServiceRate rate = resolveServiceRate();
        User admin = fetchUser(seedAdminUsername);
        User staff = fetchUser(seedStaffUsername);
        List<Customer> customers = seedCustomers();
        seedOrdersAndPayments(customers, rate, admin, staff);

        log.info("[DemoDataSeeder] Done. Seeded {} customers and 40 orders linked to users '{}' and '{}'.", 
                customers.size(), seedAdminUsername, seedStaffUsername);
    }

    private User fetchUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException(
                        "[DemoDataSeeder] Required seed user '" + username + "' not found. " +
                        "Ensure V2__seed_users.sql has run and credentials are set in .env."));
    }

    private ServiceRate resolveServiceRate() {
        return serviceRateRepository.findByServiceName("Standard Wash")
                .orElseGet(() -> {
                    log.warn("[DemoDataSeeder] 'Standard Wash' rate not found — creating fallback.");
                    return serviceRateRepository.save(ServiceRate.builder()
                            .serviceName("Standard Wash")
                            .basePricePerLoad(new BigDecimal("120.00"))
                            .kgLimitPerLoad(new BigDecimal("8.00"))
                            .pricePerExtraMinute(new BigDecimal("1.00"))
                            .isActive(true)
                            .build());
                });
    }

    private List<Customer> seedCustomers() {
        String[] lastNames = { "Santos", "Reyes", "Cruz", "Garcia", "Mendoza", "Ramos", "Rivera", "Castro", "Flores",
                "Lopez" };
        String[] firstNames = { "Juan", "Maria", "Jose", "Ana", "Miguel", "Elena", "Rafael", "Sofia", "Angelo",
                "Isabella" };

        List<Customer> saved = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            String fn = firstNames[i];
            String ln = lastNames[random.nextInt(lastNames.length)];
            String contact = String.format("09%09d", 100000000 + random.nextInt(800000000));
            saved.add(customerRepository.save(Customer.builder()
                    .firstName(fn)
                    .lastName(ln)
                    .contactNumber(contact)
                    .isActive(true)
                    .build()));
        }
        return saved;
    }

    private void seedOrdersAndPayments(List<Customer> customers, ServiceRate rate, User admin, User staff) {
        record Scenario(OrderStatus targetStatus, boolean isPaid) {
        }
        List<Scenario> scenarios = List.of(
                new Scenario(OrderStatus.RECEIVED, false),
                new Scenario(OrderStatus.READY_FOR_PICKUP, true),
                new Scenario(OrderStatus.RELEASED, true));

        int orderCounter = 1000;
        for (Scenario scenario : scenarios) {
            LocalDate baseDate = LocalDate.now().minusDays(random.nextInt(5));
            Instant createdAt = baseDate.atStartOfDay(ZoneOffset.UTC).toInstant();
            User createdBy = (random.nextInt(10) < 8) ? staff : admin;

            BigDecimal weightKg = BigDecimal.valueOf(5.0 + random.nextDouble() * 5.0).setScale(2, RoundingMode.HALF_UP);
            int totalLoads = (int) Math.ceil(weightKg.doubleValue() / rate.getKgLimitPerLoad().doubleValue());
            BigDecimal baseAmount = rate.getBasePricePerLoad().multiply(BigDecimal.valueOf(totalLoads));
            BigDecimal grandTotal = baseAmount;

            String refNumber = String.format("LDR-%s-%04d", baseDate.format(REF_DATE_FMT), orderCounter++);

            Order order = Order.builder()
                    .referenceNumber(refNumber)
                    .customer(customers.get(random.nextInt(customers.size())))
                    .createdBy(createdBy)
                    .serviceRate(rate)
                    .weightKg(weightKg)
                    .totalLoads(totalLoads)
                    .basePricePerLoad(rate.getBasePricePerLoad())
                    .kgLimitPerLoad(rate.getKgLimitPerLoad())
                    .pricePerExtraMinute(rate.getPricePerExtraMinute())
                    .extraMinutes(0)
                    .baseAmount(baseAmount)
                    .extraMinutesAmount(BigDecimal.ZERO)
                    .addonsTotalAmount(BigDecimal.ZERO)
                    .grandTotal(grandTotal)
                    .currentStatus(scenario.targetStatus())
                    .paymentStatus(scenario.isPaid() ? PaymentStatus.PAID : PaymentStatus.UNPAID)
                    .createdAt(createdAt)
                    .updatedAt(createdAt)
                    .build();

            orderRepository.save(order);

            if (scenario.isPaid()) {
                paymentRepository.save(Payment.builder()
                        .order(order)
                        .amountPaid(grandTotal)
                        .paymentMethod(PaymentMethod.CASH)
                        .receivedBy(createdBy)
                        .paymentDate(createdAt.plusSeconds(3600))
                        .remarks("Demo payment")
                        .build());
            }
        }
    }
}