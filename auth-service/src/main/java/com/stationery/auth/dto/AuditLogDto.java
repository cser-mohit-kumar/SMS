package com.stationery.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class AuditLogDto {

    @NotBlank(message = "Username is required")
    private String username;

    private String userRole;

    @NotBlank(message = "Action is required")
    private String action;

    private String details;

    public AuditLogDto() {}

    public AuditLogDto(String username, String userRole, String action, String details) {
        this.username = username;
        this.userRole = userRole;
        this.action = action;
        this.details = details;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
