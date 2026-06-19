package com.stationery.request.controller;

import com.stationery.request.dto.ApproveRejectDto;
import com.stationery.request.dto.CreateRequestDto;
import com.stationery.request.dto.RequestResponse;
import com.stationery.request.service.RequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@Tag(name = "Request Service", description = "APIs for managing stationery requests")
public class RequestController {

    private static final Logger log = LoggerFactory.getLogger(RequestController.class);

    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    /**
     * Create a new stationery request (STUDENT only).
     * POST /api/requests
     */
    @PostMapping
    @Operation(summary = "Create a new stationery request", description = "Creates a new stationery request with PENDING status")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Request created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input or unauthorized role")
    })
    public ResponseEntity<RequestResponse> createRequest(
            @RequestHeader("X-User-Name") String username,
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody CreateRequestDto createRequestDto) {

        log.info("AUDIT: POST /api/requests - User: {}, Role: {}", username, role);
        validateRole(role, "STUDENT");

        RequestResponse response = requestService.createRequest(username, createRequestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get current student's requests, optionally filtered by status and sorted.
     * GET /api/requests/my
     * GET /api/requests/my?status=PENDING
     * GET /api/requests/my?sortBy=date&sortOrder=desc
     */
    @GetMapping("/my")
    @Operation(summary = "Get my requests", description = "Retrieve all requests for the current student")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Requests retrieved successfully")
    })
    public ResponseEntity<List<RequestResponse>> getMyRequests(
            @RequestHeader("X-User-Name") String username,
            @RequestParam(value = "status", required = false) String status,
            @Parameter(description = "Sort field: date, status") @RequestParam(value = "sortBy", required = false) String sortBy,
            @Parameter(description = "Sort order: asc, desc") @RequestParam(value = "sortOrder", required = false, defaultValue = "asc") String sortOrder) {

        log.info("AUDIT: GET /api/requests/my - User: {}, Status filter: {}, Sort: {}:{}", username, status, sortBy, sortOrder);

        List<RequestResponse> responses;
        if (sortBy != null && !sortBy.isEmpty()) {
            if (status != null && !status.isEmpty()) {
                responses = requestService.getRequestsByStudentAndStatusSorted(username, status, sortBy, sortOrder);
            } else {
                responses = requestService.getRequestsByStudentSorted(username, sortBy, sortOrder);
            }
        } else {
            if (status != null && !status.isEmpty()) {
                responses = requestService.getRequestsByStudentAndStatus(username, status);
            } else {
                responses = requestService.getRequestsByStudent(username);
            }
        }
        return ResponseEntity.ok(responses);
    }

    /**
     * Get a request by database ID.
     * GET /api/requests/{id}
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get request by ID", description = "Retrieve a specific request by its database ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Request found"),
            @ApiResponse(responseCode = "404", description = "Request not found")
    })
    public ResponseEntity<RequestResponse> getRequestById(@PathVariable Long id) {
        log.info("AUDIT: GET /api/requests/{} - Fetching request by ID", id);
        RequestResponse response = requestService.getRequestById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Track a request by its UUID-based request ID.
     * GET /api/requests/track/{requestId}
     */
    @GetMapping("/track/{requestId}")
    @Operation(summary = "Track request by request ID", description = "Track a specific request using its UUID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Request found"),
            @ApiResponse(responseCode = "404", description = "Request not found")
    })
    public ResponseEntity<RequestResponse> getRequestByRequestId(@PathVariable String requestId) {
        log.info("AUDIT: GET /api/requests/track/{} - Tracking request", requestId);
        RequestResponse response = requestService.getRequestByRequestId(requestId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all requests (ADMIN only), optionally filtered by status and sorted.
     * GET /api/requests
     * GET /api/requests?status=PENDING
     * GET /api/requests?sortBy=date&sortOrder=desc
     */
    @GetMapping
    @Operation(summary = "Get all requests", description = "Retrieve all requests with optional filtering and sorting (ADMIN only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Requests retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    public ResponseEntity<List<RequestResponse>> getAllRequests(
            @RequestHeader("X-User-Role") String role,
            @RequestParam(value = "status", required = false) String status,
            @Parameter(description = "Sort field: date, status") @RequestParam(value = "sortBy", required = false) String sortBy,
            @Parameter(description = "Sort order: asc, desc") @RequestParam(value = "sortOrder", required = false, defaultValue = "asc") String sortOrder) {

        log.info("AUDIT: GET /api/requests - Role: {}, Status filter: {}, Sort: {}:{}", role, status, sortBy, sortOrder);
        validateRole(role, "ADMIN");

        List<RequestResponse> responses;
        if (sortBy != null && !sortBy.isEmpty()) {
            if (status != null && !status.isEmpty()) {
                responses = requestService.getRequestsByStatusSorted(status, sortBy, sortOrder);
            } else {
                responses = requestService.getAllRequestsSorted(sortBy, sortOrder);
            }
        } else {
            if (status != null && !status.isEmpty()) {
                responses = requestService.getAllRequestsByStatus(status);
            } else {
                responses = requestService.getAllRequests();
            }
        }
        return ResponseEntity.ok(responses);
    }

    /**
     * Approve a request (ADMIN only).
     * PUT /api/requests/{id}/approve
     */
    @PutMapping("/{id}/approve")
    @Operation(summary = "Approve a request", description = "Approve a pending request and deduct inventory (ADMIN only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Request approved successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid status or insufficient stock"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
            @ApiResponse(responseCode = "404", description = "Request not found")
    })
    public ResponseEntity<RequestResponse> approveRequest(
            @PathVariable Long id,
            @RequestHeader("X-User-Name") String adminUsername,
            @RequestHeader("X-User-Role") String role) {

        log.info("AUDIT: PUT /api/requests/{}/approve - Admin: {}, Role: {}", id, adminUsername, role);
        validateRole(role, "ADMIN");

        RequestResponse response = requestService.approveRequest(id, adminUsername);
        return ResponseEntity.ok(response);
    }

    /**
     * Reject a request with a reason (ADMIN only).
     * PUT /api/requests/{id}/reject
     */
    @PutMapping("/{id}/reject")
    @Operation(summary = "Reject a request", description = "Reject a pending request with an optional reason (ADMIN only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Request rejected successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid status"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
            @ApiResponse(responseCode = "404", description = "Request not found")
    })
    public ResponseEntity<RequestResponse> rejectRequest(
            @PathVariable Long id,
            @RequestHeader("X-User-Name") String adminUsername,
            @RequestHeader("X-User-Role") String role,
            @RequestBody(required = false) ApproveRejectDto approveRejectDto) {

        log.info("AUDIT: PUT /api/requests/{}/reject - Admin: {}, Role: {}", id, adminUsername, role);
        validateRole(role, "ADMIN");

        String reason = (approveRejectDto != null) ? approveRejectDto.getRejectionReason() : null;
        RequestResponse response = requestService.rejectRequest(id, adminUsername, reason);
        return ResponseEntity.ok(response);
    }

    /**
     * Fulfill an approved request (ADMIN only).
     * PUT /api/requests/{id}/fulfill
     */
    @PutMapping("/{id}/fulfill")
    @Operation(summary = "Fulfill a request", description = "Mark an approved request as fulfilled (ADMIN only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Request fulfilled successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid status"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
            @ApiResponse(responseCode = "404", description = "Request not found")
    })
    public ResponseEntity<RequestResponse> fulfillRequest(
            @PathVariable Long id,
            @RequestHeader("X-User-Role") String role) {

        log.info("AUDIT: PUT /api/requests/{}/fulfill - Role: {}", id, role);
        validateRole(role, "ADMIN");

        RequestResponse response = requestService.fulfillRequest(id);
        return ResponseEntity.ok(response);
    }

    // ========== Helper Methods ==========

    /**
     * Validate that the user has the required role.
     */
    private void validateRole(String actualRole, String requiredRole) {
        if (actualRole == null || !actualRole.equalsIgnoreCase(requiredRole)) {
            throw new IllegalArgumentException(
                    "Access denied. Required role: " + requiredRole + ", but got: " + actualRole);
        }
    }
}
