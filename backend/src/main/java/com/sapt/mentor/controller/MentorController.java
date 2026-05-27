package com.sapt.mentor.controller;

import com.sapt.mentor.service.MentorService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * MentorController - REST endpoints for Mentor role.
 * Base URL: /api/mentor
 * Access: ROLE_MENTOR only
 * TODO (Mentor Team): Add endpoints for profile, assigned students, submission review.
 */
@RestController
@RequestMapping("/api/mentor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MENTOR')")
public class MentorController {

    private final MentorService mentorService;

    // TODO: @GetMapping("/profile") getMyProfile()
    // TODO: @GetMapping("/students") getAssignedStudents()
    // TODO: @GetMapping("/submissions/pending") getPendingSubmissions()
    // TODO: @PutMapping("/submissions/{id}/approve") approveSubmission()
    // TODO: @PutMapping("/submissions/{id}/reject") rejectSubmission()
}
