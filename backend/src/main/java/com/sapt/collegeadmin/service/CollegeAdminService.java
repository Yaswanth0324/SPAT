package com.sapt.collegeadmin.service;

import com.sapt.collegeadmin.dto.CollegeAdminDto;
import com.sapt.common.enums.UserRole;

import java.util.List;

/**
 * ============================================================
 * CollegeAdminService — Business Logic Interface
 * ============================================================
 * All operations scoped to the COLLEGE_ADMIN role.
 *
 * Key design decisions:
 *  - All data is scoped to the admin's own college (collegeId derived from userId).
 *  - Colleges and users are stored in a single unified schema (no separate tables).
 *  - Stats are computed at query time (no caching in this phase).
 * ============================================================
 */
public interface CollegeAdminService {

    /**
     * Returns the profile of the logged-in College Admin.
     *
     * @param authUserId UUID of the authenticated user (from JWT principal)
     * @return CollegeAdminProfile DTO
     */
    CollegeAdminDto.CollegeAdminProfile getProfile(String authUserId);

    /**
     * Updates profile fields of the logged-in College Admin.
     * Only non-null fields in the request are applied.
     *
     * @param authUserId UUID of the authenticated user
     * @param request    Fields to update (name, phone, position, avatarUrl)
     * @return Updated CollegeAdminProfile DTO
     */
    CollegeAdminDto.CollegeAdminProfile updateProfile(String authUserId, CollegeAdminDto.UpdateProfileRequest request);

    /**
     * Updates college-level details (address and official email).
     * Only non-null fields in the request are applied.
     *
     * @param authUserId UUID of the authenticated college admin
     * @param request    Fields to update (address, officialEmail)
     * @return Updated CollegeAdminProfile DTO (with new college fields)
     */
    CollegeAdminDto.CollegeAdminProfile updateCollegeDetails(String authUserId, CollegeAdminDto.UpdateCollegeRequest request);

    /**
     * Computes and returns college-wide analytics stats for the dashboard.
     * Includes user counts, submission breakdown, placement factors,
     * top student/mentor performers, and chart data.
     *
     * @param authUserId UUID of the authenticated college admin (used to derive collegeId)
     * @return CollegeStatsResponse DTO
     */
    CollegeAdminDto.CollegeStatsResponse getDashboardStats(String authUserId);

    /**
     * Returns all departments in this college with per-department summaries
     * (HOD info, mentor count, student count, activity counts).
     *
     * @param authUserId UUID of the authenticated college admin
     * @return List of DepartmentSummary DTOs
     */
    List<CollegeAdminDto.DepartmentSummary> getDepartments(String authUserId);

    /**
     * Returns all users in this college filtered by role.
     *
     * @param authUserId UUID of the authenticated college admin
     * @param role       UserRole to filter by (HOD, MENTOR, STUDENT)
     * @return List of UserSummary DTOs
     */
    List<CollegeAdminDto.UserSummary> getUsersByRole(String authUserId, UserRole role);
}
