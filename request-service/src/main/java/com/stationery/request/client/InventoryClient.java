package com.stationery.request.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "inventory-service")
public interface InventoryClient {

    @GetMapping("/api/inventory/{id}")
    ResponseEntity<Map<String, Object>> getInventoryItem(@PathVariable("id") Long id);

    /**
     * Deducts stock from inventory. Returns true on success.
     * Using Boolean (not ResponseEntity) so Feign's default error decoder
     * properly throws FeignException on HTTP 4xx/5xx responses.
     * This ensures InsufficientStockException (HTTP 400) is correctly
     * propagated as FeignException.BadRequest and caught by the service layer.
     */
    @PutMapping("/api/inventory/{id}/deduct")
    Boolean deductItemQuantity(
            @PathVariable("id") Long id,
            @RequestParam("quantity") Integer quantity
    );
}
