package com.sapt.collegeadmin.controller;

import com.sapt.collegeadmin.service.CollegeAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * CollegeAdminController - REST endpoints for CollegeAdmin role.
 * Base URL: /api/college-admin | Access: ROLE_COLLEGE_ADMIN only
 * TODO (CollegeAdmin Team): Add endpoints for HOD/Mentor management, college stats.
 */
@RestController
@RequestMapping("/api/college-admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('COLLEGE_ADMIN')")
public class CollegeAdminController {
    private final CollegeAdminService collegeAdminService;
    // TODO: @GetMapping("/profile") getMyProfile()
    // TODO: @PostMapping("/hod") createHod()
    // TODO: @PostMapping("/mentor") createMentor()
    // TODO: @GetMapping("/hods") getAllHods()
    // TODO: @GetMapping("/stats") getCollegeStats()
}
