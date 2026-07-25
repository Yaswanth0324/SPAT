package com.sapt.hod.service;

import com.sapt.hod.dto.HodDto;

import java.util.List;

/**
 * ============================================================
 * HodService — Business logic contract for HOD role
 * ============================================================
 * All operations are scoped to the authenticated HOD's
 * departmentId (derived from their User record).
 *
 * Implementation: HodServiceImpl
 * ============================================================
 */
public interface HodService {

    /**
     * Returns full department analytics for the HOD dashboard.
     * Scoped to HOD's departmentId.
     *
     * @param authUserId email or UUID of the authenticated HOD user
     */
    HodDto.DeptStatsResponse getDashboardStats(String authUserId);

    /**
     * Returns the HOD's own profile.
     *
     * @param authUserId email or UUID of the authenticated HOD user
     */
    HodDto.HodProfile getProfile(String authUserId);

    /**
     * Returns all APPROVED mentors in the HOD's department.
     *
     * @param authUserId email or UUID of the authenticated HOD user
     */
    List<HodDto.UserSummary> getDepartmentMentors(String authUserId);

    /**
     * Returns all PENDING-approval mentors in the HOD's department.
     * Used by the Mentor Approvals page.
     *
     * @param authUserId email or UUID of the authenticated HOD user
     */
    List<HodDto.UserSummary> getPendingMentors(String authUserId);
}
