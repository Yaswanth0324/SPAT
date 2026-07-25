package com.sapt.hod.repository;

import com.sapt.hod.entity.Hod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HodRepository extends JpaRepository<Hod, String> {
    Optional<Hod> findByEmail(String email);
    List<Hod> findByCollegeId(String collegeId);
    List<Hod> findByDepartmentId(String departmentId);
    boolean existsByEmail(String email);
}
