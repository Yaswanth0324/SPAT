package com.sapt.mentor.repository;

import com.sapt.mentor.entity.SuccessionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SuccessionRequestRepository extends JpaRepository<SuccessionRequest, String> {
    Optional<SuccessionRequest> findFirstByOutgoingUserIdAndStatusOrderByCreatedAtDesc(String outgoingUserId, String status);
    List<SuccessionRequest> findByStatus(String status);
}
