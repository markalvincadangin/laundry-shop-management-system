package com.himotech.laundryms.auditlog.api;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.himotech.laundryms.auditlog.dto.AuditLogResponse;
import com.himotech.laundryms.auditlog.service.AuditLogService;
import com.himotech.laundryms.auth.JwtPrincipal;
import com.himotech.laundryms.shared.dto.PageResponse;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    public ResponseEntity<PageResponse<AuditLogResponse>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            HttpServletRequest request) {

        logAccess(request);

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending().and(Sort.by("id").descending())
                : Sort.by(sortBy).descending().and(Sort.by("id").descending());

        Pageable pageable = PageRequest.of(page, Math.min(Math.max(size, 1), 100), sort);

        Instant fromTs = from != null ? from.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant toTs = to != null ? to.atTime(23, 59, 59).atZone(ZoneOffset.UTC).toInstant() : null;

        Page<AuditLogResponse> pageData = auditLogService.search(q, action, fromTs, toTs, pageable);

        return ResponseEntity.ok(PageResponse.<AuditLogResponse>builder()
                .content(pageData.getContent())
                .page(pageData.getNumber())
                .size(pageData.getSize())
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .first(pageData.isFirst())
                .last(pageData.isLast())
                .build());
    }

    @GetMapping("/record")
    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogForRecord(
            @RequestParam String tableName,
            @RequestParam String recordId,
            HttpServletRequest request) {
        logAccess(request);
        return ResponseEntity.ok(auditLogService.getAuditLogForRecord(tableName, recordId));
    }

    private void logAccess(HttpServletRequest request) {
        String userId = "SYSTEM";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            Object principal = auth.getPrincipal();
            if (principal instanceof JwtPrincipal jwtPrincipal) {
                userId = jwtPrincipal.userId().toString();
            } else {
                userId = auth.getName();
            }
        }

        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        } else {
            ipAddress = ipAddress.split(",")[0];
        }

        String userAgent = request.getHeader("User-Agent");

        auditLogService.logViewerAccess(userId, ipAddress, userAgent);
    }
}
