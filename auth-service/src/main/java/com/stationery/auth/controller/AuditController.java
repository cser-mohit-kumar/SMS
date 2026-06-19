package com.stationery.auth.controller;

import com.stationery.auth.dto.AuditLogDto;
import com.stationery.auth.model.AuditLog;
import com.stationery.auth.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth/audit")
@Tag(name = "Audit Logging Service", description = "APIs for recording and retrieving system audit logs")
public class AuditController {

    private static final Logger logger = LoggerFactory.getLogger(AuditController.class);

    private final AuditLogRepository auditLogRepository;

    public AuditController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Records a new audit log entry.
     * Accessible internally by microservices.
     */
    @PostMapping
    @Operation(summary = "Record an audit log entry", description = "Saves a new update or action event in the audit trail")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Audit log recorded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    public ResponseEntity<Void> recordAuditLog(@Valid @RequestBody AuditLogDto dto) {
        logger.info("Recording audit log for action: {} by user: {}", dto.getAction(), dto.getUsername());
        
        AuditLog auditLog = AuditLog.builder()
                .username(dto.getUsername())
                .userRole(dto.getUserRole())
                .action(dto.getAction())
                .details(dto.getDetails())
                .build();
        
        auditLogRepository.save(auditLog);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * Retrieves all audit log entries.
     * Restricted to ADMIN role only.
     */
    @GetMapping
    @Operation(summary = "Retrieve all audit logs", description = "Returns a list of all audit trail logs (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Audit logs retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    public ResponseEntity<List<AuditLog>> getAuditLogs(
            @RequestHeader(value = "X-User-Role", defaultValue = "") String userRole) {
        
        if (!"ADMIN".equalsIgnoreCase(userRole)) {
            logger.warn("Unauthorized access attempt to audit logs. User role: {}", userRole);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        logger.info("Admin retrieving system audit logs");
        List<AuditLog> logs = auditLogRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(logs);
    }
}
