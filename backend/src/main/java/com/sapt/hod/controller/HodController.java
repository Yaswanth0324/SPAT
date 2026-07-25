package com.sapt.hod.controller;

import com.sapt.common.response.ApiResponse;
import com.sapt.hod.dto.HodDto;
import com.sapt.hod.service.HodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ============================================================
 * HodController — REST endpoints for HOD role
 * ============================================================
 * Base URL : /api/hod
 * Security : All routes require ROLE_HOD (class-level)
 *
 * Endpoints:
 *   GET  /dashboard         → full department analytics stats
 *   GET  /profile           → HOD's own profile
 *   GET  /mentors           → approved mentors in HOD's dept
 *   GET  /mentor-approvals  → pending mentor registrations in dept
 * ============================================================
 */
@RestController
@RequestMapping("/hod")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HOD')")
public class HodController {

    private final HodService hodService;

    // ─────────────────────────────────────────────────────────────────────────
    // Dashboard Analytics
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/hod/dashboard
     *
     * Returns comprehensive department analytics for the HOD dashboard:
     *   - Mentor / student totals
     *   - Placement factor tallies (hackathons, courses, internships, etc.)
     *   - Factor bar-chart data
     *   - Monthly skill acquisition trend (area chart)
     *   - Top 3 students by credits
     *   - Top 3 mentors by success rate
     *   - Approved mentor list (for HODMentors page)
     *   - Pending mentor list (for HODMentorApprovals page)
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<HodDto.DeptStatsResponse>> getDashboardStats(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = userDetails.getUsername();
        HodDto.DeptStatsResponse stats = hodService.getDashboardStats(userId);
        return ResponseEntity.ok(ApiResponse.success("Department stats fetched successfully", stats));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Profile
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/hod/profile
     * Returns the logged-in HOD's own profile.
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<HodDto.HodProfile>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = userDetails.getUsername();
        HodDto.HodProfile profile = hodService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", profile));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Department Mentors
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/hod/mentors
     * Returns all APPROVED mentors in the HOD's department.
     * Powers the HODMentors list page.
     */
    @GetMapping("/mentors")
    public ResponseEntity<ApiResponse<List<HodDto.UserSummary>>> getDepartmentMentors(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = userDetails.getUsername();
        List<HodDto.UserSummary> mentors = hodService.getDepartmentMentors(userId);
        return ResponseEntity.ok(ApiResponse.success("Department mentors fetched successfully", mentors));
    }

    /**
     * GET /api/hod/mentor-approvals
     * Returns all PENDING mentors in the HOD's department.
     * Powers the HODMentorApprovals page.
     */
    @GetMapping("/mentor-approvals")
    public ResponseEntity<ApiResponse<List<HodDto.UserSummary>>> getPendingMentors(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = userDetails.getUsername();
        List<HodDto.UserSummary> pending = hodService.getPendingMentors(userId);
        return ResponseEntity.ok(ApiResponse.success("Pending mentor approvals fetched successfully", pending));
    }
}
