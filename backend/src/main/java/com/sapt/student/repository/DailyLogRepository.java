package com.sapt.student.repository;

import com.sapt.student.entity.DailyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DailyLogRepository extends JpaRepository<DailyLog, String> {
    List<DailyLog> findByStudentIdOrderByLogDateDesc(String studentId);
    List<DailyLog> findByStudentIdInOrderByLogDateDesc(List<String> studentIds);
}
