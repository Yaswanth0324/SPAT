package com.sapt.submission.controller;

import com.sapt.submission.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * SubmissionController - REST endpoints for Submission module.
 * Base URL: /api/submission
 * Access: Multiple roles (Student, Mentor, HOD) — use @PreAuthorize per endpoint.
 * TODO (Submission Team): Add endpoints for CRUD and review workflow.
 */
@RestController
@RequestMapping("/submission")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    // TODO: @PostMapping             @PreAuthorize("hasRole('STUDENT')")    createSubmission()
    // TODO: @GetMapping("/{id}")     @PreAuthorize("...")                   getSubmissionById()
    // TODO: @GetMapping("/my")       @PreAuthorize("hasRole('STUDENT')")    getMySubmissions()
    // TODO: @GetMapping("/pending")  @PreAuthorize("hasRole('MENTOR')")     getPendingSubmissions()
    // TODO: @PutMapping("/{id}/review") @PreAuthorize("hasRole('MENTOR') or hasRole('HOD')") reviewSubmission()
    // TODO: @DeleteMapping("/{id}")  @PreAuthorize("hasRole('STUDENT')")    withdrawSubmission()
}

