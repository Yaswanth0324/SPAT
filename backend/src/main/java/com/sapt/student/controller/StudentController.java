package com.sapt.student.controller;

import com.sapt.common.response.ApiResponse;
import com.sapt.student.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * StudentController - REST endpoints for Student role.
 * Base URL: /api/student
 * Access: ROLE_STUDENT only
 * TODO (Student Team): Add endpoints for profile, submissions, points.
 */
@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final StudentService studentService;

    // TODO: @GetMapping("/profile") getMyProfile()
    // TODO: @PutMapping("/profile") updateProfile()
    // TODO: @GetMapping("/submissions") getMySubmissions()
    // TODO: @GetMapping("/points") getTotalPoints()
    // TODO: @PostMapping("/submissions") createSubmission()
}
