package com.sapt.collegeadmin.repository;

import com.sapt.collegeadmin.entity.College;
import com.sapt.common.enums.CollegeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * CollegeRepository - JPA Repository for College entity.
 */
@Repository
public interface CollegeRepository extends JpaRepository<College, Long> {

    Optional<College> findByName(String name);

    boolean existsByName(String name);

    List<College> findByStatus(CollegeStatus status);

    long countByStatus(CollegeStatus status);

    /** Find colleges whose contract has expired (status still ACTIVE but end date passed) */
    @Query("SELECT c FROM College c WHERE c.contractEnd < CURRENT_DATE AND c.status = 'ACTIVE'")
    List<College> findExpiredContracts();
}
