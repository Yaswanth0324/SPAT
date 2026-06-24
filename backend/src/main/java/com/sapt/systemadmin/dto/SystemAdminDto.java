package com.sapt.systemadmin.dto;

import com.sapt.common.enums.CollegeStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * SystemAdminDto - All request/response DTOs for the System Admin module.
 */
public class SystemAdminDto {

    // ─────────────────────────────────────────────────────────────────────────
    // Profile
    // ─────────────────────────────────────────────────────────────────────────

    @Data
    @Builder
    public static class SystemAdminProfile {
        private String id;          // UUID
        private String fullName;
        private String employeeId;
        private String email;
        private boolean active;
        private LocalDateTime createdAt;
        private String avatarUrl;
    }

    @Data
    public static class UpdateProfileRequest {
        private String fullName;
        private String avatarUrl;
    }


    // ─────────────────────────────────────────────────────────────────────────
    // Create College Admin Request
    // ─────────────────────────────────────────────────────────────────────────

    @Data
    public static class CreateCollegeAdminRequest {
        // College details
        private String collegeName;
        private String collegeAddress;
        private String collegeState;
        private String collegePhone;
        private String collegeEmail;
        private String collegeWebsite;

        // Admin (College Admin) details
        private String adminFullName;
        private String adminEmail;
        private String adminPassword;
        private String adminPhone;
        private String adminEmployeeId;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // College Response
    // ─────────────────────────────────────────────────────────────────────────

    @Data
    @Builder
    public static class CollegeResponse {
        private String id;
        private String name;
        private String address;
        private String state;
        private String phone;
        private String email;
        private String website;
        private CollegeStatus status;
        private LocalDate contractStart;
        private LocalDate contractEnd;
        private LocalDateTime createdAt;

        // Derived / joined fields
        private String adminName;
        private String adminEmail;
        private String adminPhone;
        private long totalAdmins;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // College Admin Response (list view)
    // ─────────────────────────────────────────────────────────────────────────

    @Data
    @Builder
    public static class CollegeAdminResponse {
        private String id;          // UUID
        private String fullName;
        private String employeeId;
        private String email;
        private String phone;
        private String collegeName;
        private boolean active;
        private LocalDateTime createdAt;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Update College Status Request
    // ─────────────────────────────────────────────────────────────────────────

    @Data
    public static class UpdateCollegeStatusRequest {
        private CollegeStatus status;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // System Stats Response
    // ─────────────────────────────────────────────────────────────────────────

    @Data
    @Builder
    public static class SystemStatsResponse {
        private long totalColleges;
        private long activeColleges;
        private long inactiveColleges;
        private long suspendedColleges;
        private long totalCollegeAdmins;
        private long totalUsers;
    }
}
