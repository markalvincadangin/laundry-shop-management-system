package com.himotech.laundryms.payments.api;

import com.himotech.laundryms.api.dto.request.CreatePaymentRequest;
import com.himotech.laundryms.api.dto.response.PaymentResponse;
import com.himotech.laundryms.api.mapper.PaymentMapper;
import com.himotech.laundryms.common.enums.PaymentMethod;
import com.himotech.laundryms.payments.entity.Payment;
import com.himotech.laundryms.payments.service.PaymentService;
import com.himotech.laundryms.payments.service.RecordPaymentCommand;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;

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