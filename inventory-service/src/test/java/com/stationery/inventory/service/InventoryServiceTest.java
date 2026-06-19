package com.stationery.inventory.service;

import com.stationery.inventory.dto.StationeryItemRequest;
import com.stationery.inventory.dto.StationeryItemResponse;
import com.stationery.inventory.model.StationeryItem;
import com.stationery.inventory.repository.StationeryItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("InventoryService Test Suite")
class InventoryServiceTest {

    @Mock
    private StationeryItemRepository stationeryItemRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private StationeryItemRequest itemRequest;
    private StationeryItem testItem;

    @BeforeEach
    void setUp() {
        itemRequest = StationeryItemRequest.builder()
                .name("Notebook")
                .description("College ruled notebook")
                .category("Books")
                .unit("pcs")
                .availableQuantity(100)
                .minimumQuantity(10)
                .build();

        testItem = StationeryItem.builder()
                .id(1L)
                .name("Notebook")
                .description("College ruled notebook")
                .category("Books")
                .unit("pcs")
                .availableQuantity(100)
                .minimumQuantity(10)
                .build();
    }

    @Test
    @DisplayName("Should create a new stationery item successfully")
    void testCreateItemSuccess() {
        when(stationeryItemRepository.save(any(StationeryItem.class))).thenReturn(testItem);

        StationeryItemResponse response = inventoryService.createItem(itemRequest);

        assertNotNull(response);
        assertEquals("Notebook", response.getName());
        assertEquals("Books", response.getCategory());
        assertEquals(100, response.getAvailableQuantity());

        verify(stationeryItemRepository).save(any(StationeryItem.class));
    }

    @Test
    @DisplayName("Should retrieve all items with pagination")
    void testGetAllItemsSuccess() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<StationeryItem> page = new PageImpl<>(Arrays.asList(testItem), pageable, 1);
        when(stationeryItemRepository.findAll(pageable)).thenReturn(page);

        Page<StationeryItemResponse> response = inventoryService.getAllItems(0, 20, "name");

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        verify(stationeryItemRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Should retrieve item by ID successfully")
    void testGetItemByIdSuccess() {
        when(stationeryItemRepository.findById(1L)).thenReturn(Optional.of(testItem));

        StationeryItemResponse response = inventoryService.getItemById(1L);

        assertNotNull(response);
        assertEquals("Notebook", response.getName());
        verify(stationeryItemRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when item not found")
    void testGetItemByIdNotFound() {
        when(stationeryItemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> inventoryService.getItemById(999L));
        verify(stationeryItemRepository).findById(999L);
    }

    @Test
    @DisplayName("Should retrieve items by category with pagination")
    void testGetItemsByCategorySuccess() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<StationeryItem> page = new PageImpl<>(Arrays.asList(testItem), pageable, 1);
        when(stationeryItemRepository.findByCategory("Books", pageable)).thenReturn(page);

        Page<StationeryItemResponse> response = inventoryService.getItemsByCategory("Books", 0, 20);

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        verify(stationeryItemRepository).findByCategory("Books", pageable);
    }

    @Test
    @DisplayName("Should update an existing item successfully")
    void testUpdateItemSuccess() {
        when(stationeryItemRepository.findById(1L)).thenReturn(Optional.of(testItem));
        when(stationeryItemRepository.save(any(StationeryItem.class))).thenReturn(testItem);

        StationeryItemRequest updateRequest = StationeryItemRequest.builder()
                .name("Updated Notebook")
                .description("Updated description")
                .category("Books")
                .unit("pcs")
                .availableQuantity(150)
                .minimumQuantity(20)
                .build();

        StationeryItemResponse response = inventoryService.updateItem(1L, updateRequest);

        assertNotNull(response);
        verify(stationeryItemRepository).findById(1L);
        verify(stationeryItemRepository).save(any(StationeryItem.class));
    }

    @Test
    @DisplayName("Should delete an item successfully")
    void testDeleteItemSuccess() {
        when(stationeryItemRepository.findById(1L)).thenReturn(Optional.of(testItem));
        doNothing().when(stationeryItemRepository).deleteById(1L);

        assertDoesNotThrow(() -> inventoryService.deleteItem(1L));
        verify(stationeryItemRepository).findById(1L);
        verify(stationeryItemRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should deduct quantity successfully")
    void testDeductQuantitySuccess() {
        when(stationeryItemRepository.findById(1L)).thenReturn(Optional.of(testItem));
        when(stationeryItemRepository.save(any(StationeryItem.class))).thenReturn(testItem);

        boolean result = inventoryService.deductQuantity(1L, 10);

        assertTrue(result);
        assertEquals(90, testItem.getAvailableQuantity());
        verify(stationeryItemRepository).findById(1L);
        verify(stationeryItemRepository).save(any(StationeryItem.class));
    }

    @Test
    @DisplayName("Should return false when insufficient stock for deduction")
    void testDeductQuantityInsufficientStock() {
        testItem.setAvailableQuantity(5);
        when(stationeryItemRepository.findById(1L)).thenReturn(Optional.of(testItem));

        boolean result = inventoryService.deductQuantity(1L, 10);

        assertFalse(result);
        verify(stationeryItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should retrieve low stock items")
    void testGetLowStockItemsSuccess() {
        StationeryItem lowStockItem = testItem;
        lowStockItem.setAvailableQuantity(5);
        List<StationeryItem> lowStockItems = Arrays.asList(lowStockItem);
        when(stationeryItemRepository.findByAvailableQuantityLessThanEqual(10)).thenReturn(lowStockItems);

        List<StationeryItemResponse> response = inventoryService.getLowStockItems();

        assertNotNull(response);
        assertEquals(1, response.size());
        verify(stationeryItemRepository).findByAvailableQuantityLessThanEqual(10);
    }

    @Test
    @DisplayName("Should search items by keyword")
    void testSearchItemsSuccess() {
        List<StationeryItem> searchResults = Arrays.asList(testItem);
        when(stationeryItemRepository.findByNameContainingIgnoreCase("Note")).thenReturn(searchResults);

        List<StationeryItemResponse> response = inventoryService.searchItems("Note");

        assertNotNull(response);
        assertEquals(1, response.size());
        verify(stationeryItemRepository).findByNameContainingIgnoreCase("Note");
    }

    @Test
    @DisplayName("Should return empty list when search has no results")
    void testSearchItemsNoResults() {
        when(stationeryItemRepository.findByNameContainingIgnoreCase("NonExistent")).thenReturn(Arrays.asList());

        List<StationeryItemResponse> response = inventoryService.searchItems("NonExistent");

        assertNotNull(response);
        assertEquals(0, response.size());
        verify(stationeryItemRepository).findByNameContainingIgnoreCase("NonExistent");
    }
}
