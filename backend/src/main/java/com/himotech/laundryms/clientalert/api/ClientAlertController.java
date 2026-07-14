package com.himotech.laundryms.clientalert.api;

import com.himotech.laundryms.shared.dto.PageResponse;
import com.himotech.laundryms.clientalert.service.ClientAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

@RestController
@RequestMapping("/api/v1/client-alerts")
@RequiredArgsConstructor
public class ClientAlertController {

    private final ClientAlertService clientAlertService;

    @GetMapping
    public ResponseEntity<PageResponse<ClientAlertResponse>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending().and(Sort.by("id").descending()) 
                : Sort.by(sortBy).descending().and(Sort.by("id").descending());
                
        Pageable pageable = PageRequest.of(page, Math.min(Math.max(size, 1), 100), sort);
        
        Instant fromTs = from != null ? from.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant toTs = to != null ? to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        
        com.himotech.laundryms.clientalert.ClientAlertStatus alertStatus = null;
        if (status != null && !status.isEmpty()) {
            alertStatus = com.himotech.laundryms.clientalert.ClientAlertStatus.valueOf(status.toUpperCase());
        }
        
        Page<ClientAlertResponse> pageData = clientAlertService.search(q, alertStatus, fromTs, toTs, pageable);

        return ResponseEntity.ok(PageResponse.<ClientAlertResponse>builder()
                .content(pageData.getContent())
                .page(pageData.getNumber())
                .size(pageData.getSize())
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .first(pageData.isFirst())
                .last(pageData.isLast())
                .build());
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        clientAlertService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        clientAlertService.markAllAsRead();
        return ResponseEntity.ok().build();
    }
}
