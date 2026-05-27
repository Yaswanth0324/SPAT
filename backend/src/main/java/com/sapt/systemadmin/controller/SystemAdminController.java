package com.sapt.systemadmin.controller;

import com.sapt.systemadmin.service.SystemAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * SystemAdminController - REST endpoints for SystemAdmin role.
 * Base URL: /api/system-admin | Access: ROLE_SYSTEM_ADMIN only
 * TODO (SystemAdmin Team): Add endpoints for college, user, and system management.
 */
@RestController
@RequestMapping("/api/system-admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class SystemAdminController {
    private final SystemAdminService systemAdminService;
    // TODO: @GetMapping("/profile") getMyProfile()
    // TODO: @PostMapping("/college-admin") createCollegeAdmin()
    // TODO: @GetMapping("/colleges") getAllColleges()
    // TODO: @GetMapping("/stats") getSystemStats()
    // TODO: @PutMapping("/users/{id}/deactivate") deactivateUser()
}
