package com.sapt.systemadmin.controller;

import com.sapt.common.enums.CollegeStatus;
import com.sapt.common.response.ApiResponse;
import com.sapt.systemadmin.dto.SystemAdminDto;
import com.sapt.systemadmin.service.SystemAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * SystemAdminController - REST endpoints for the System Admin role.
 *
 * Base URL  : /api/system-admin
 * Security  : All routes require ROLE_SYSTEM_ADMIN (enforced at class level)
 *
 * Endpoints:
 *   GET  /profile                     → own profile
 *   POST /college-admin               → register college + create college admin
 *   GET  /colleges                    → list all colleges
 *   GET  /colleges/{id}               → single college detail
 *   PUT  /colleges/{id}/status        → activate / deactivate / suspend
 *   GET  /college-admins              → list all college admins
 *   GET  /stats                       → system-wide KPI stats
 */
@RestController
@RequestMapping("/system-admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class SystemAdminController {

    private final SystemAdminService systemAdminService;

    // ─────────────────────────────────────────────────────────────────────────
    // Profile
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/system-admin/profile
     * Returns the logged-in System Admin's profile.
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<SystemAdminDto.SystemAdminProfile>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // userId is stored as the username (UUID) in JWT principal
        String userId = userDetails.getUsername();
        SystemAdminDto.SystemAdminProfile profile = systemAdminService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", profile));
    }

    /**
     * PUT /api/system-admin/profile
     * Updates the logged-in System Admin's profile (name & profile photo).
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<SystemAdminDto.SystemAdminProfile>> updateProfile(
            @RequestBody SystemAdminDto.UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = userDetails.getUsername();
        SystemAdminDto.SystemAdminProfile updated = systemAdminService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Create College Admin (+ College if new)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/system-admin/college-admin
     * Registers a new college (if it doesn't exist) and creates a College Admin account.
     */
    @PostMapping("/college-admin")
    public ResponseEntity<ApiResponse<Void>> createCollegeAdmin(
            @RequestBody SystemAdminDto.CreateCollegeAdminRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = userDetails.getUsername();
        systemAdminService.createCollegeAdmin(request, userId);
        return ResponseEntity.ok(ApiResponse.success(
                "College admin '" + request.getAdminFullName() + "' created successfully"
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Colleges
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/system-admin/colleges
     * Returns all colleges with joined admin information.
     */
    @GetMapping("/colleges")
    public ResponseEntity<ApiResponse<List<SystemAdminDto.CollegeResponse>>> getAllColleges() {
        List<SystemAdminDto.CollegeResponse> colleges = systemAdminService.getAllColleges();
        return ResponseEntity.ok(ApiResponse.success("Colleges fetched successfully", colleges));
    }

    /**
     * GET /api/system-admin/colleges/{id}
     * Returns a single college by ID.
     */
    @GetMapping("/colleges/{id}")
    public ResponseEntity<ApiResponse<SystemAdminDto.CollegeResponse>> getCollegeById(
            @PathVariable String id
    ) {
        SystemAdminDto.CollegeResponse college = systemAdminService.getCollegeById(id);
        return ResponseEntity.ok(ApiResponse.success("College fetched successfully", college));
    }

    /**
     * PUT /api/system-admin/colleges/{id}/status
     * Updates the status of a college: ACTIVE | INACTIVE | SUSPENDED
     */
    @PutMapping("/colleges/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateCollegeStatus(
            @PathVariable String id,
            @RequestBody SystemAdminDto.UpdateCollegeStatusRequest request
    ) {
        systemAdminService.updateCollegeStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(
                "College status updated to " + request.getStatus()
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // College Admins
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/system-admin/college-admins
     * Returns all college admin accounts across the platform.
     */
    @GetMapping("/college-admins")
    public ResponseEntity<ApiResponse<List<SystemAdminDto.CollegeAdminResponse>>> getAllCollegeAdmins() {
        List<SystemAdminDto.CollegeAdminResponse> admins = systemAdminService.getAllCollegeAdmins();
        return ResponseEntity.ok(ApiResponse.success("College admins fetched successfully", admins));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Stats
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/system-admin/stats
     * Returns system-wide KPI statistics for the analytics dashboard.
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<SystemAdminDto.SystemStatsResponse>> getSystemStats() {
        SystemAdminDto.SystemStatsResponse stats = systemAdminService.getSystemStats();
        return ResponseEntity.ok(ApiResponse.success("Stats fetched successfully", stats));
    }
}

