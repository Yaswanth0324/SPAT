package com.sapt.student.repository;

import com.sapt.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * StudentRepository - JPA Repository for Student entity.
 * TODO (Student Team): Add custom query methods as needed.
 */
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(String userId);
    Optional<Student> findByRollNumber(String rollNumber);
    // TODO: findByDepartmentAndBatch(), findByMentorId(), etc.
}
