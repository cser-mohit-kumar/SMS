package com.stationery.inventory.controller;

import com.stationery.inventory.dto.StationeryItemRequest;
import com.stationery.inventory.dto.StationeryItemResponse;
import com.stationery.inventory.service.InventoryService;
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
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for inventory management operations.
 * Exposes endpoints for CRUD operations, stock management, search, and low-stock alerts.
 * Admin-only operations are protected via X-User-Role header checks (set by API Gateway).
 */
@RestController
@RequestMapping("/api/inventory")
@Tag(name = "Inventory Service", description = "APIs for inventory and stationery item management")
public class InventoryController {

    private static final Logger log = LoggerFactory.getLogger(InventoryController.class);

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    /**
     * Creates a new stationery item. Admin-only.
     *
     * @param request   the item creation request
     * @param userRole  the role from X-User-Role header
     * @param userName  the username from X-User-Name header
     * @return the created item with HTTP 201
     */
    @PostMapping
    @Operation(summary = "Create stationery item", description = "Creates a new stationery item (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Item created successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    public ResponseEntity<StationeryItemResponse> createItem(
            @Valid @RequestBody StationeryItemRequest request,
            @RequestHeader(value = "X-User-Role", defaultValue = "") String userRole,
            @RequestHeader(value = "X-User-Name", defaultValue = "SYSTEM") String userName) {

        if (!"ADMIN".equalsIgnoreCase(userRole)) {
            log.warn("AUDIT: Unauthorized create attempt by user '{}' with role '{}'", userName, userRole);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.info("AUDIT: User '{}' (role: {}) creating new stationery item: '{}'",
                userName, userRole, request.getName());

        StationeryItemResponse response = inventoryService.createItem(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Retrieves all stationery items with pagination.
     *
     * @param page   page number (default 0)
     * @param size   page size (default 20)
     * @param sortBy sort field (default "name")
     * @return paginated list of items
     */
    @GetMapping
    @Operation(summary = "Get all stationery items", description = "Retrieves all stationery items with pagination")
    @ApiResponse(responseCode = "200", description = "Items retrieved successfully")
    public ResponseEntity<Page<StationeryItemResponse>> getAllItems(
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "name") String sortBy) {

        Page<StationeryItemResponse> items = inventoryService.getAllItems(page, size, sortBy);
        return ResponseEntity.ok(items);
    }

    /**
     * Retrieves a specific stationery item by ID.
     *
     * @param id the item ID
     * @return the item details
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get item by ID", description = "Retrieves a specific stationery item by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Item found"),
            @ApiResponse(responseCode = "404", description = "Item not found")
    })
    public ResponseEntity<StationeryItemResponse> getItemById(@PathVariable Long id) {
        StationeryItemResponse response = inventoryService.getItemById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves stationery items filtered by category with pagination.
     *
     * @param category the category to filter by
     * @param page     page number (default 0)
     * @param size     page size (default 20)
     * @return paginated list of items in the category
     */
    @GetMapping("/category/{category}")
    @Operation(summary = "Get items by category", description = "Retrieves stationery items filtered by category")
    @ApiResponse(responseCode = "200", description = "Items retrieved successfully")
    public ResponseEntity<Page<StationeryItemResponse>> getItemsByCategory(
            @PathVariable String category,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {

        Page<StationeryItemResponse> items = inventoryService.getItemsByCategory(category, page, size);
        return ResponseEntity.ok(items);
    }

    /**
     * Updates an existing stationery item. Admin-only.
     *
     * @param id       the item ID to update
     * @param request  the update request
     * @param userRole the role from X-User-Role header
     * @param userName the username from X-User-Name header
     * @return the updated item
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update stationery item", description = "Updates an existing stationery item (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Item updated successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
            @ApiResponse(responseCode = "404", description = "Item not found")
    })
    public ResponseEntity<StationeryItemResponse> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody StationeryItemRequest request,
            @RequestHeader(value = "X-User-Role", defaultValue = "") String userRole,
            @RequestHeader(value = "X-User-Name", defaultValue = "SYSTEM") String userName) {

        if (!"ADMIN".equalsIgnoreCase(userRole)) {
            log.warn("AUDIT: Unauthorized update attempt on item ID {} by user '{}' with role '{}'",
                    id, userName, userRole);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.info("AUDIT: User '{}' (role: {}) updating stationery item ID: {}", userName, userRole, id);

        StationeryItemResponse response = inventoryService.updateItem(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Deletes a stationery item. Admin-only.
     *
     * @param id       the item ID to delete
     * @param userRole the role from X-User-Role header
     * @param userName the username from X-User-Name header
     * @return HTTP 204 No Content on success
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete stationery item", description = "Deletes a stationery item (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Item deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
            @ApiResponse(responseCode = "404", description = "Item not found")
    })
    public ResponseEntity<Void> deleteItem(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", defaultValue = "") String userRole,
            @RequestHeader(value = "X-User-Name", defaultValue = "SYSTEM") String userName) {

        if (!"ADMIN".equalsIgnoreCase(userRole)) {
            log.warn("AUDIT: Unauthorized delete attempt on item ID {} by user '{}' with role '{}'",
                    id, userName, userRole);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.info("AUDIT: User '{}' (role: {}) deleting stationery item ID: {}", userName, userRole, id);

        inventoryService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Retrieves all items that are at or below their minimum stock level. Admin-only.
     *
     * @param userRole the role from X-User-Role header
     * @return list of low-stock items
     */
    @GetMapping("/low-stock")
    @Operation(summary = "Get low stock items", description = "Retrieves all items at or below minimum stock level (Admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Low stock items retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    })
    public ResponseEntity<List<StationeryItemResponse>> getLowStockItems(
            @RequestHeader(value = "X-User-Role", defaultValue = "") String userRole) {

        if (!"ADMIN".equalsIgnoreCase(userRole)) {
            log.warn("AUDIT: Unauthorized low-stock access attempt with role '{}'", userRole);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<StationeryItemResponse> lowStockItems = inventoryService.getLowStockItems();
        return ResponseEntity.ok(lowStockItems);
    }

    /**
     * Deducts a quantity from an item's stock. Called internally by request-service.
     *
     * @param id       the item ID
     * @param quantity the quantity to deduct
     * @return true if deduction was successful
     */
    @PutMapping("/{id}/deduct")
    @Operation(summary = "Deduct item quantity", description = "Deducts quantity from item stock (Internal service call)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Quantity deducted successfully"),
            @ApiResponse(responseCode = "400", description = "Insufficient stock"),
            @ApiResponse(responseCode = "404", description = "Item not found")
    })
    public ResponseEntity<Boolean> deductQuantity(
            @PathVariable Long id,
            @Parameter(description = "Quantity to deduct") @RequestParam Integer quantity) {

        log.info("AUDIT: Internal service call - deducting {} units from item ID: {}", quantity, id);

        boolean result = inventoryService.deductQuantity(id, quantity);
        return ResponseEntity.ok(result);
    }

    /**
     * Searches for stationery items by keyword (case-insensitive name match).
     *
     * @param keyword the search keyword
     * @return list of matching items
     */
    @GetMapping("/search")
    @Operation(summary = "Search items", description = "Searches for stationery items by keyword (case-insensitive)")
    @ApiResponse(responseCode = "200", description = "Search results retrieved successfully")
    public ResponseEntity<List<StationeryItemResponse>> searchItems(
            @Parameter(description = "Search keyword") @RequestParam String keyword) {

        List<StationeryItemResponse> items = inventoryService.searchItems(keyword);
        return ResponseEntity.ok(items);
    }
}
