package com.himotech.laundryms.auditlog.controller;

import com.himotech.laundryms.auditlog.dto.AuditLogResponse;
import com.himotech.laundryms.auditlog.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.himotech.laundryms.auth.JwtPrincipal;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    public Page<AuditLogResponse> searchAuditLogs(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC, size = 50) Pageable pageable,
            HttpServletRequest request
    ) {
        // FR-006: Log the viewer access
        logAccess(request);

        return auditLogService.search(q, action, from, to, pageable);
    }

    @GetMapping("/record")
    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    public List<AuditLogResponse> getAuditLogForRecord(
            @RequestParam String tableName,
            @RequestParam String recordId,
            HttpServletRequest request
    ) {
        logAccess(request);
        return auditLogService.getAuditLogForRecord(tableName, recordId);
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
