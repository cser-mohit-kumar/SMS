package com.stationery.request.repository;

import com.stationery.request.model.RequestStatus;
import com.stationery.request.model.StationeryRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RequestRepository extends JpaRepository<StationeryRequest, Long> {

    List<StationeryRequest> findByStudentUsername(String username);

    List<StationeryRequest> findByStatus(RequestStatus status);

    List<StationeryRequest> findByStudentUsernameAndStatus(String username, RequestStatus status);

    Optional<StationeryRequest> findByRequestId(String requestId);

    Page<StationeryRequest> findByStudentUsername(String username, Pageable pageable);

    @Query("SELECT r FROM StationeryRequest r WHERE r.studentUsername = :username ORDER BY r.createdAt DESC")
    List<StationeryRequest> findByStudentUsernameOrderByDateDesc(@Param("username") String username);

    @Query("SELECT r FROM StationeryRequest r WHERE r.studentUsername = :username ORDER BY r.createdAt ASC")
    List<StationeryRequest> findByStudentUsernameOrderByDateAsc(@Param("username") String username);

    @Query("SELECT r FROM StationeryRequest r WHERE r.studentUsername = :username ORDER BY r.status ASC")
    List<StationeryRequest> findByStudentUsernameOrderByStatusAsc(@Param("username") String username);

    @Query("SELECT r FROM StationeryRequest r ORDER BY r.createdAt DESC")
    List<StationeryRequest> findAllOrderByDateDesc();

    @Query("SELECT r FROM StationeryRequest r ORDER BY r.createdAt ASC")
    List<StationeryRequest> findAllOrderByDateAsc();

    @Query("SELECT r FROM StationeryRequest r ORDER BY r.status ASC")
    List<StationeryRequest> findAllOrderByStatusAsc();

    @Query("SELECT r FROM StationeryRequest r WHERE r.studentUsername = :username AND r.status = :status ORDER BY r.createdAt DESC")
    List<StationeryRequest> findByStudentUsernameAndStatusOrderByDateDesc(@Param("username") String username, @Param("status") RequestStatus status);

    @Query("SELECT r FROM StationeryRequest r WHERE r.studentUsername = :username AND r.status = :status ORDER BY r.createdAt ASC")
    List<StationeryRequest> findByStudentUsernameAndStatusOrderByDateAsc(@Param("username") String username, @Param("status") RequestStatus status);

    @Query("SELECT r FROM StationeryRequest r WHERE r.status = :status ORDER BY r.createdAt DESC")
    List<StationeryRequest> findByStatusOrderByDateDesc(@Param("status") RequestStatus status);

    @Query("SELECT r FROM StationeryRequest r WHERE r.status = :status ORDER BY r.createdAt ASC")
    List<StationeryRequest> findByStatusOrderByDateAsc(@Param("status") RequestStatus status);
}
