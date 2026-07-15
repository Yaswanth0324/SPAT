package com.sapt.collegeadmin.controller;

import com.sapt.collegeadmin.dto.CollegeAdminDto;
import com.sapt.collegeadmin.service.CollegeAdminService;
import com.sapt.common.enums.UserRole;
import com.sapt.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ============================================================
 * CollegeAdminController — REST endpoints for COLLEGE_ADMIN role
 * ============================================================
 * Base URL : /api/college-admin
 * Security : All routes require ROLE_COLLEGE_ADMIN (class-level)
 *
 * Endpoints:
 *   GET  /profile           → own profile
 *   PUT  /profile           → update own profile
 *   GET  /dashboard         → college-wide analytics stats
 *   GET  /departments       → all departments with summaries
 *   GET  /users?role=HOD    → users filtered by role in this college
 * ============================================================
 */
@RestController
@RequestMapping("/college-admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('COLLEGE_ADMIN')")
public class CollegeAdminController {

    private final CollegeAdminService collegeAdminService;

    // ─────────────────────────────────────────────────────────────────────────
    // Profile
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/college-admin/profile
     * Returns the logged-in College Admin's profile.
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CollegeAdminDto.CollegeAdminProfile>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = userDetails.getUsername();
        CollegeAdminDto.CollegeAdminProfile profile = collegeAdminService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", profile));
    }

    /**
     * PUT /api/college-admin/profile
     * Updates the College Admin's name, phone, position, and/or avatar.
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CollegeAdminDto.CollegeAdminProfile>> updateProfile(
            @RequestBody CollegeAdminDto.UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = userDetails.getUsername();
        CollegeAdminDto.CollegeAdminProfile updated = collegeAdminService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    /**
     * PUT /api/college-admin/college
     * Updates the college's registered address and official email.
     * Only non-null fields are applied.
     */
    @PutMapping("/college")
    public ResponseEntity<ApiResponse<CollegeAdminDto.CollegeAdminProfile>> updateCollegeDetails(
            @RequestBody CollegeAdminDto.UpdateCollegeRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = userDetails.getUsername();
        CollegeAdminDto.CollegeAdminProfile updated = collegeAdminService.updateCollegeDetails(userId, request);
        return ResponseEntity.ok(ApiResponse.success("College details updated successfully", updated));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Dashboard Stats
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/college-admin/dashboard
     * Returns comprehensive analytics stats for the college dashboard:
     *   - User/department counts
     *   - Submission breakdown (approved/rejected/pending)
     *   - Top student performers
     *   - Mentor performance metrics
     *   - Department and category chart data
     *   - Monthly submission trends
     *   - Placement readiness factors
     *   - College contract info
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<CollegeAdminDto.CollegeStatsResponse>> getDashboardStats(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = userDetails.getUsername();
        CollegeAdminDto.CollegeStatsResponse stats = collegeAdminService.getDashboardStats(userId);
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats fetched successfully", stats));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Departments
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/college-admin/departments
     * Returns all departments in this college with HOD info,
     * mentor/student counts, and activity statistics.
     */
    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<CollegeAdminDto.DepartmentSummary>>> getDepartments(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = userDetails.getUsername();
        List<CollegeAdminDto.DepartmentSummary> departments = collegeAdminService.getDepartments(userId);
        return ResponseEntity.ok(ApiResponse.success("Departments fetched successfully", departments));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Users by Role
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/college-admin/users?role=HOD|MENTOR|STUDENT
     * Returns all users in this college filtered by the given role.
     * Used by the College Admin's user-management and HOD-request pages.
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<CollegeAdminDto.UserSummary>>> getUsersByRole(
            @RequestParam UserRole role,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = userDetails.getUsername();
        List<CollegeAdminDto.UserSummary> users = collegeAdminService.getUsersByRole(userId, role);
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users));
    }
}
