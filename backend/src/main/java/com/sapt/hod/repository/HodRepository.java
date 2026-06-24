package com.sapt.hod.repository;

import com.sapt.hod.entity.Hod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/** HodRepository - TODO (HOD Team): Add custom query methods. */
@Repository
public interface HodRepository extends JpaRepository<Hod, Long> {
    Optional<Hod> findByUserId(String userId);
    List<Hod> findByCollegeId(Long collegeId);
    List<Hod> findByDepartment(String department);
}
