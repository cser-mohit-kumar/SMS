package com.stationery.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stationery.auth.dto.AuditLogDto;
import com.stationery.auth.model.AuditLog;
import com.stationery.auth.repository.AuditLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
    "spring.cloud.config.enabled=false",
    "eureka.client.enabled=false",
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver"
})
@AutoConfigureMockMvc
@DisplayName("AuditController Integration Test Suite")
class AuditControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private AuditLogDto auditLogDto;
    private AuditLog auditLog;

    @BeforeEach
    void setUp() {
        auditLogDto = new AuditLogDto("admin1", "ADMIN", "ITEM_CREATED", "Created Notebook");
        auditLog = new AuditLog(1L, "admin1", "ADMIN", "ITEM_CREATED", "Created Notebook", LocalDateTime.of(2026, 6, 19, 12, 0, 0));
    }

    @Test
    @DisplayName("Integration: POST /api/auth/audit - Success")
    void testPostAuditLogIntegration() throws Exception {
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(auditLog);

        mockMvc.perform(post("/api/auth/audit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(auditLogDto)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Integration: GET /api/auth/audit - Admin Access Success")
    void testGetAuditLogsAdminIntegration() throws Exception {
        when(auditLogRepository.findAllByOrderByCreatedAtDesc()).thenReturn(Arrays.asList(auditLog));

        mockMvc.perform(get("/api/auth/audit")
                .header("X-User-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("admin1"))
                .andExpect(jsonPath("$[0].action").value("ITEM_CREATED"))
                .andExpect(jsonPath("$[0].details").value("Created Notebook"));
    }

    @Test
    @DisplayName("Integration: GET /api/auth/audit - Forbidden for Student")
    void testGetAuditLogsStudentIntegration() throws Exception {
        mockMvc.perform(get("/api/auth/audit")
                .header("X-User-Role", "STUDENT"))
                .andExpect(status().isForbidden());
    }
}
