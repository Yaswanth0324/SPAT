package com.sapt.systemadmin.service;

import com.sapt.common.enums.CollegeStatus;
import com.sapt.systemadmin.dto.SystemAdminDto;

import java.util.List;

/**
 * SystemAdminService - Interface for all System Admin business operations.
 */
public interface SystemAdminService {

    /**
     * Returns the profile of the currently authenticated System Admin.
     * @param userId  the users.id (UUID) of the logged-in system admin
     */
    SystemAdminDto.SystemAdminProfile getProfile(String userId);

    /**
     * Updates the profile of the currently authenticated System Admin.
     * @param userId   the users.id (UUID) of the logged-in system admin
     * @param request  the request containing new name and profile picture
     */
    SystemAdminDto.SystemAdminProfile updateProfile(String userId, SystemAdminDto.UpdateProfileRequest request);


    /**
     * Creates a new College together with its first College Admin account.
     * Transactional: rolls back entirely if any step fails.
     *
     * @param request    all college and admin details from the form
     * @param createdByAuthUserId  auth ID of the System Admin performing this action
     */
    void createCollegeAdmin(SystemAdminDto.CreateCollegeAdminRequest request, String createdByUserId);

    /**
     * Returns all colleges registered on the platform, with admin info joined.
     */
    List<SystemAdminDto.CollegeResponse> getAllColleges();

    /**
     * Returns a single college by its ID.
     */
    SystemAdminDto.CollegeResponse getCollegeById(String collegeId);

    /**
     * Updates the operational status of a college (activate / deactivate / suspend).
     */
    void updateCollegeStatus(String collegeId, CollegeStatus status);

    /**
     * Returns all College Admin accounts across the platform.
     */
    List<SystemAdminDto.CollegeAdminResponse> getAllCollegeAdmins();

    /**
     * Returns system-wide KPI statistics for the dashboard.
     */
    SystemAdminDto.SystemStatsResponse getSystemStats();
}
