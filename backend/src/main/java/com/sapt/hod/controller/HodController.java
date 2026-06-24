package com.sapt.hod.controller;

import com.sapt.hod.service.HodService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * HodController - REST endpoints for HOD role.
 * Base URL: /api/hod | Access: ROLE_HOD only
 * TODO (HOD Team): Add endpoints for profile, mentors, submissions, department stats.
 */
@RestController
@RequestMapping("/hod")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HOD')")
public class HodController {
    private final HodService hodService;
    // TODO: @GetMapping("/profile") getMyProfile()
    // TODO: @GetMapping("/mentors") getDepartmentMentors()
    // TODO: @GetMapping("/submissions") getDepartmentSubmissions()
    // TODO: @GetMapping("/stats") getDepartmentStats()
}

