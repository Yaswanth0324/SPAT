package com.sapt.student.repository;

import com.sapt.student.entity.StudentCreditSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentCreditSnapshotRepository extends JpaRepository<StudentCreditSnapshot, String> {
    Optional<StudentCreditSnapshot> findByStudentId(String studentId);
}
