package com.stationery.request.service;

import com.stationery.request.client.InventoryClient;
import com.stationery.request.dto.CreateRequestDto;
import com.stationery.request.dto.RequestItemDto;
import com.stationery.request.dto.RequestResponse;
import com.stationery.request.model.RequestItem;
import com.stationery.request.model.RequestStatus;
import com.stationery.request.model.StationeryRequest;
import com.stationery.request.repository.RequestRepository;
import feign.FeignException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RequestService Test Suite")
class RequestServiceTest {

    @Mock
    private RequestRepository requestRepository;

    @Mock
    private InventoryClient inventoryClient;

    @InjectMocks
    private RequestService requestService;

    private CreateRequestDto createRequestDto;
    private StationeryRequest testRequest;
    private RequestItem testItem;

    @BeforeEach
    void setUp() {
        RequestItemDto itemDto = RequestItemDto.builder()
                .itemId(1L)
                .itemName("Notebook")
                .quantity(5)
                .build();

        createRequestDto = CreateRequestDto.builder()
                .items(Arrays.asList(itemDto))
                .build();

        testItem = RequestItem.builder()
                .id(1L)
                .itemId(1L)
                .itemName("Notebook")
                .quantity(5)
                .build();

        testRequest = StationeryRequest.builder()
                .id(1L)
                .requestId("req-123")
                .studentUsername("student1")
                .status(RequestStatus.PENDING)
                .items(Arrays.asList(testItem))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should create a new request successfully")
    void testCreateRequestSuccess() {
        when(requestRepository.save(any(StationeryRequest.class))).thenReturn(testRequest);

        RequestResponse response = requestService.createRequest("student1", createRequestDto);

        assertNotNull(response);
        assertEquals("student1", response.getStudentUsername());
        assertEquals(RequestStatus.PENDING.name(), response.getStatus());
        assertEquals(1, response.getItems().size());

        verify(requestRepository).save(any(StationeryRequest.class));
    }

    @Test
    @DisplayName("Should retrieve request by ID")
    void testGetRequestByIdSuccess() {
        when(requestRepository.findById(1L)).thenReturn(Optional.of(testRequest));

        RequestResponse response = requestService.getRequestById(1L);

        assertNotNull(response);
        assertEquals("student1", response.getStudentUsername());
        verify(requestRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when request not found by ID")
    void testGetRequestByIdNotFound() {
        when(requestRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> requestService.getRequestById(999L));
        verify(requestRepository).findById(999L);
    }

    @Test
    @DisplayName("Should retrieve request by request ID")
    void testGetRequestByRequestIdSuccess() {
        when(requestRepository.findByRequestId("req-123")).thenReturn(Optional.of(testRequest));

        RequestResponse response = requestService.getRequestByRequestId("req-123");

        assertNotNull(response);
        assertEquals("req-123", response.getRequestId());
        verify(requestRepository).findByRequestId("req-123");
    }

    @Test
    @DisplayName("Should retrieve all requests for a student")
    void testGetRequestsByStudentSuccess() {
        when(requestRepository.findByStudentUsername("student1"))
                .thenReturn(Arrays.asList(testRequest));

        List<RequestResponse> responses = requestService.getRequestsByStudent("student1");

        assertNotNull(responses);
        assertEquals(1, responses.size());
        verify(requestRepository).findByStudentUsername("student1");
    }

    @Test
    @DisplayName("Should retrieve requests by student and status")
    void testGetRequestsByStudentAndStatusSuccess() {
        when(requestRepository.findByStudentUsernameAndStatus("student1", RequestStatus.PENDING))
                .thenReturn(Arrays.asList(testRequest));

        List<RequestResponse> responses = requestService.getRequestsByStudentAndStatus("student1", "PENDING");

        assertNotNull(responses);
        assertEquals(1, responses.size());
        verify(requestRepository).findByStudentUsernameAndStatus("student1", RequestStatus.PENDING);
    }

    @Test
    @DisplayName("Should retrieve all requests")
    void testGetAllRequestsSuccess() {
        when(requestRepository.findAll()).thenReturn(Arrays.asList(testRequest));

        List<RequestResponse> responses = requestService.getAllRequests();

        assertNotNull(responses);
        assertEquals(1, responses.size());
        verify(requestRepository).findAll();
    }

    @Test
    @DisplayName("Should approve request successfully")
    void testApproveRequestSuccess() {
        when(requestRepository.findById(1L)).thenReturn(Optional.of(testRequest));
        when(inventoryClient.deductItemQuantity(1L, 5)).thenReturn(true);
        when(requestRepository.save(any(StationeryRequest.class))).thenReturn(testRequest);

        testRequest.setStatus(RequestStatus.APPROVED);
        RequestResponse response = requestService.approveRequest(1L, "admin1");

        assertNotNull(response);
        verify(inventoryClient).deductItemQuantity(1L, 5);
        verify(requestRepository).save(any(StationeryRequest.class));
    }

    @Test
    @DisplayName("Should throw exception when approving non-pending request")
    void testApproveNonPendingRequest() {
        testRequest.setStatus(RequestStatus.APPROVED);
        when(requestRepository.findById(1L)).thenReturn(Optional.of(testRequest));

        assertThrows(IllegalStateException.class, () -> requestService.approveRequest(1L, "admin1"));
        verify(inventoryClient, never()).deductItemQuantity(anyLong(), anyInt());
    }

    @Test
    @DisplayName("Should reject request successfully")
    void testRejectRequestSuccess() {
        when(requestRepository.findById(1L)).thenReturn(Optional.of(testRequest));
        when(requestRepository.save(any(StationeryRequest.class))).thenReturn(testRequest);

        testRequest.setStatus(RequestStatus.REJECTED);
        RequestResponse response = requestService.rejectRequest(1L, "admin1", "Out of stock");

        assertNotNull(response);
        verify(requestRepository).save(any(StationeryRequest.class));
    }

    @Test
    @DisplayName("Should fulfill approved request successfully")
    void testFulfillRequestSuccess() {
        testRequest.setStatus(RequestStatus.APPROVED);
        when(requestRepository.findById(1L)).thenReturn(Optional.of(testRequest));
        when(requestRepository.save(any(StationeryRequest.class))).thenReturn(testRequest);

        testRequest.setStatus(RequestStatus.FULFILLED);
        RequestResponse response = requestService.fulfillRequest(1L);

        assertNotNull(response);
        verify(requestRepository).save(any(StationeryRequest.class));
    }

    @Test
    @DisplayName("Should retrieve requests sorted by date descending")
    void testGetRequestsByStudentSortedByDateDesc() {
        when(requestRepository.findByStudentUsernameOrderByDateDesc("student1"))
                .thenReturn(Arrays.asList(testRequest));

        List<RequestResponse> responses = requestService.getRequestsByStudentSorted("student1", "date", "desc");

        assertNotNull(responses);
        assertEquals(1, responses.size());
        verify(requestRepository).findByStudentUsernameOrderByDateDesc("student1");
    }

    @Test
    @DisplayName("Should retrieve requests sorted by date ascending")
    void testGetRequestsByStudentSortedByDateAsc() {
        when(requestRepository.findByStudentUsernameOrderByDateAsc("student1"))
                .thenReturn(Arrays.asList(testRequest));

        List<RequestResponse> responses = requestService.getRequestsByStudentSorted("student1", "date", "asc");

        assertNotNull(responses);
        assertEquals(1, responses.size());
        verify(requestRepository).findByStudentUsernameOrderByDateAsc("student1");
    }

    @Test
    @DisplayName("Should retrieve requests sorted by status")
    void testGetRequestsByStudentSortedByStatus() {
        when(requestRepository.findByStudentUsernameOrderByStatusAsc("student1"))
                .thenReturn(Arrays.asList(testRequest));

        List<RequestResponse> responses = requestService.getRequestsByStudentSorted("student1", "status", "asc");

        assertNotNull(responses);
        assertEquals(1, responses.size());
        verify(requestRepository).findByStudentUsernameOrderByStatusAsc("student1");
    }

    @Test
    @DisplayName("Should throw exception for invalid sort field")
    void testInvalidSortField() {
        assertThrows(IllegalArgumentException.class,
                () -> requestService.getRequestsByStudentSorted("student1", "invalid", "asc"));
    }

    @Test
    @DisplayName("Should throw exception for invalid status")
    void testInvalidStatus() {
        assertThrows(IllegalArgumentException.class,
                () -> requestService.getRequestsByStudentAndStatus("student1", "INVALID_STATUS"));
    }
}
