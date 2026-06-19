package com.stationery.auth.controller;

import com.stationery.auth.dto.AuditLogDto;
import com.stationery.auth.model.AuditLog;
import com.stationery.auth.repository.AuditLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuditController Unit Test Suite")
class AuditControllerUnitTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditController auditController;

    private AuditLogDto auditLogDto;
    private AuditLog auditLog;

    @BeforeEach
    void setUp() {
        auditLogDto = new AuditLogDto("admin1", "ADMIN", "ITEM_CREATED", "Created Notebook");
        auditLog = new AuditLog(1L, "admin1", "ADMIN", "ITEM_CREATED", "Created Notebook", LocalDateTime.now());
    }

    @Test
    @DisplayName("Should save audit log successfully")
    void testRecordAuditLogSuccess() {
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(auditLog);

        ResponseEntity<Void> response = auditController.recordAuditLog(auditLogDto);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("Should retrieve audit logs for admin")
    void testGetAuditLogsSuccess() {
        List<AuditLog> logs = Arrays.asList(auditLog);
        when(auditLogRepository.findAllByOrderByCreatedAtDesc()).thenReturn(logs);

        ResponseEntity<List<AuditLog>> response = auditController.getAuditLogs("ADMIN");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        verify(auditLogRepository, times(1)).findAllByOrderByCreatedAtDesc();
    }

    @Test
    @DisplayName("Should forbid non-admin from retrieving audit logs")
    void testGetAuditLogsForbidden() {
        ResponseEntity<List<AuditLog>> response = auditController.getAuditLogs("STUDENT");

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verifyNoInteractions(auditLogRepository);
    }
}
