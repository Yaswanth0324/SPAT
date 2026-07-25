package com.sapt.student.controller;

import com.sapt.auth.entity.User;
import com.sapt.auth.repository.UserRepository;
import com.sapt.common.exception.SaptException;
import com.sapt.common.response.ApiResponse;
import com.sapt.student.dto.DailyLogDto;
import com.sapt.student.dto.StudentDto;
import com.sapt.student.service.StudentService;
import com.sapt.submission.dto.SubmissionDto;
import com.sapt.submission.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * StudentController - REST endpoints for Student role.
 * Base URL: /api/student
 * Access: ROLE_STUDENT only
 */
@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final StudentService studentService;
    private final SubmissionService submissionService;
    private final UserRepository userRepository;

    private User findStudent(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> SaptException.notFound("Student not found: " + email));
    }

    /**
     * GET /api/student/dashboard/stats
     * Returns full student performance metrics, submissions, and daily logs.
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<StudentDto.StudentDashboardStats>> getDashboardStats(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        StudentDto.StudentDashboardStats stats = studentService.getStudentDashboardStats(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics fetched successfully", stats));
    }

    /**
     * GET /api/student/categories
     * Returns all active categories and their sub-types.
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<Map<String, List<Map<String, Object>>>>> getCategories() {
        Map<String, List<Map<String, Object>>> categories = studentService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Activity categories fetched successfully", categories));
    }

    /**
     * POST /api/student/categories/custom
     * Creates a custom category/sub-type from the student's submission page.
     */
    @PostMapping("/categories/custom")
    public ResponseEntity<ApiResponse<StudentDto.CustomCategoryResponse>> createCustomCategory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody StudentDto.CustomCategoryRequest request
    ) {
        StudentDto.CustomCategoryResponse response = studentService.createCustomCategory(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Custom category created successfully", response));
    }

    /**
     * GET /api/student/logs
     * Returns the logged-in student's daily log entries.
     */
    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<List<DailyLogDto.Response>>> getStudentLogs(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<DailyLogDto.Response> logs = studentService.getStudentLogs(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Daily logs fetched successfully", logs));
    }

    /**
     * POST /api/student/logs
     * Adds a new daily log entry.
     */
    @PostMapping("/logs")
    public ResponseEntity<ApiResponse<DailyLogDto.Response>> createDailyLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody DailyLogDto.CreateRequest request
    ) {
        DailyLogDto.Response newLog = studentService.createDailyLog(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Daily log entry created successfully", newLog));
    }

    /**
     * PUT /api/student/logs/{id}
     * Updates/re-submits a daily log entry (usually after rejection).
     */
    @PutMapping("/logs/{id}")
    public ResponseEntity<ApiResponse<DailyLogDto.Response>> updateDailyLog(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody DailyLogDto.CreateRequest request
    ) {
        DailyLogDto.Response updatedLog = studentService.updateDailyLog(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Daily log updated and re-submitted successfully", updatedLog));
    }

    /**
     * GET /api/student/submissions
     * Returns the logged-in student's submissions.
     */
    @GetMapping("/submissions")
    public ResponseEntity<ApiResponse<List<SubmissionDto.SubmissionResponse>>> getMySubmissions(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size
    ) {
        User student = findStudent(userDetails.getUsername());
        Page<SubmissionDto.SubmissionResponse> result = submissionService.getStudentSubmissions(student.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Submissions fetched successfully", result.getContent()));
    }

    /**
     * POST /api/student/submissions
     * Creates a new activity points submission.
     */
    @PostMapping("/submissions")
    public ResponseEntity<ApiResponse<SubmissionDto.SubmissionResponse>> createSubmission(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SubmissionDto.CreateSubmissionRequest request
    ) {
        User student = findStudent(userDetails.getUsername());
        SubmissionDto.SubmissionResponse response = submissionService.createSubmission(student.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Submission uploaded successfully", response));
    }
}
