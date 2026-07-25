package com.sapt.student.repository;

import com.sapt.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    Optional<Student> findByEmail(String email);
    List<Student> findByCollegeId(String collegeId);
    List<Student> findByDepartmentId(String departmentId);
    List<Student> findByMentorId(String mentorId);
    boolean existsByEmail(String email);
}
