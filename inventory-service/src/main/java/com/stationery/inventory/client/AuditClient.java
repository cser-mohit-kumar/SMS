package com.stationery.inventory.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "auth-service")
public interface AuditClient {

    @PostMapping("/api/auth/audit")
    void logAction(@RequestBody Map<String, Object> auditLogRequest);
}
