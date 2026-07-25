package com.sapt.student.service;

import com.sapt.student.dto.DailyLogDto;
import com.sapt.student.dto.StudentDto;
import com.sapt.student.entity.DailyLog;
import java.util.List;
import java.util.Map;

/**
 * StudentService - Interface for student business logic.
 */
public interface StudentService {
    
    StudentDto.StudentDashboardStats getStudentDashboardStats(String authUserId);
    
    List<DailyLogDto.Response> getStudentLogs(String authUserId);
    
    DailyLogDto.Response createDailyLog(String authUserId, DailyLogDto.CreateRequest request);
    
    DailyLogDto.Response updateDailyLog(String authUserId, String logId, DailyLogDto.CreateRequest request);
    
    Map<String, List<Map<String, Object>>> getAllCategories();
    
    StudentDto.CustomCategoryResponse createCustomCategory(String authUserId, StudentDto.CustomCategoryRequest request);
    
    void recalculateCreditSnapshot(String studentId);
}
