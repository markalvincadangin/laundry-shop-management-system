package com.himotech.laundryms.payments.api;

import com.himotech.laundryms.api.dto.request.CreatePaymentRequest;
import com.himotech.laundryms.api.dto.response.PageResponse;
import com.himotech.laundryms.api.dto.response.PaymentResponse;
import com.himotech.laundryms.api.mapper.PaymentMapper;
import com.himotech.laundryms.payments.entity.Payment;
import com.himotech.laundryms.payments.service.PaymentService;
import com.himotech.laundryms.payments.service.RecordPaymentCommand;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;

    @GetMapping
    public ResponseEntity<PageResponse<PaymentResponse>> list(
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(Math.max(size, 1), 100));
        Page<Payment> paymentsPage = paymentService.findAll(orderId, from, to, pageable);
        List<PaymentResponse> content = paymentsPage.getContent().stream()
                .map(paymentMapper::toResponse)
                .toList();
        return ResponseEntity.ok(PageResponse.<PaymentResponse>builder()
                .content(content)
                .page(paymentsPage.getNumber())
                .size(paymentsPage.getSize())
                .totalElements(paymentsPage.getTotalElements())
                .totalPages(paymentsPage.getTotalPages())
                .first(paymentsPage.isFirst())
                .last(paymentsPage.isLast())
                .build());
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> create(@Valid @RequestBody CreatePaymentRequest request) {
        RecordPaymentCommand cmd = new RecordPaymentCommand(
                request.getOrderId(),
                request.getAmountPaid(),
                request.getPaymentMethod(),
                request.getReceivedByUserId(),
                null
        );
        Payment payment = paymentService.create(cmd);
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentMapper.toResponse(payment));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> getById(@PathVariable Long paymentId) {
        Payment payment = paymentService.findById(paymentId);
        return ResponseEntity.ok(paymentMapper.toResponse(payment));
    }
}