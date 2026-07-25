package com.sapt.mentor.repository;

import com.sapt.mentor.entity.Mentor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorRepository extends JpaRepository<Mentor, String> {
    Optional<Mentor> findByEmail(String email);
    List<Mentor> findByCollegeId(String collegeId);
    List<Mentor> findByDepartmentId(String departmentId);
    boolean existsByEmail(String email);
}
