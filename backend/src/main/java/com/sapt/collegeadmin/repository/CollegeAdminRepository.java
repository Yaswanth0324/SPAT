package com.sapt.collegeadmin.repository;

import com.sapt.collegeadmin.entity.CollegeAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/** CollegeAdminRepository - TODO (CollegeAdmin Team): Add custom query methods. */
@Repository
public interface CollegeAdminRepository extends JpaRepository<CollegeAdmin, Long> {
    Optional<CollegeAdmin> findByUserId(String userId);
    List<CollegeAdmin> findByCollegeId(Long collegeId);
}
