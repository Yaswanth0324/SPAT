package com.sapt.collegeadmin.dto;

import com.sapt.common.enums.UserRole;
import com.sapt.common.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * ============================================================
 * CollegeAdminDto — DTOs for the College Admin module
 * ============================================================
 * All request/response shapes for CollegeAdmin endpoints.
 * ============================================================
 */
public class CollegeAdminDto {

    // ================================================================
    // PROFILE
    // ================================================================

    /**
     * Response: college admin's own profile.
     * Mirrors the fields the frontend needs (from AuthContext user object).
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CollegeAdminProfile {
        private String id;
        private String name;
        private String email;
        private String phone;
        private String position;
        private String avatarUrl;
        private String collegeId;
        private String collegeName;
        /** Address of the college (from the colleges table) */
        private String collegeAddress;
        /** Official contact email of the college (from the colleges table) */
        private String collegeOfficialEmail;
        private UserRole role;
        private UserStatus status;
        private LocalDateTime lastLoginAt;
        private LocalDateTime createdAt;
    }

    /**
     * Request: update own profile fields.
     * All fields are optional — only non-null fields will be updated.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        private String name;
        private String phone;
        private String position;
        /** Base64-encoded image or URL */
        private String avatarUrl;
    }

    /**
     * Request: update college-level details (address and official email).
     * Only non-null fields will be applied.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateCollegeRequest {
        /** Physical/registered address of the college campus */
        private String address;
        /** College's official contact email address */
        private String officialEmail;
    }

    // ================================================================
    // DASHBOARD STATS
    // ================================================================

    /**
     * Response: full college-wide analytics for the dashboard.
     * Mirrors the shape the frontend's loadData() computes from localStorage.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CollegeStatsResponse {
        // ─── User Counts ─────────────────────────────────────
        private int totalDepartments;
        private int totalUsers;
        private int activeUsers;
        private int inactiveUsers;
        private int hodCount;
        private int mentorCount;
        private int studentCount;

        // ─── Submission Counts ────────────────────────────────
        private int totalSubmissions;
        private int totalApprovals;
        private int totalRejections;
        private int pendingSubmissions;
        private int studentActivities;

        // ─── Top Performers ───────────────────────────────────
        private List<StudentPerformance> topStudents;
        private List<MentorPerformance>  mentorPerformances;

        // ─── Breakdown Charts ─────────────────────────────────
        /** Per-department breakdown for bar chart */
        private List<DepartmentChartEntry> departmentChart;

        /** Per-category counts for pie chart: [{name, value}] */
        private List<CategoryChartEntry> categoryChart;

        /** Monthly trend: [{month, approved, rejected, pending}] */
        private List<MonthlyTrendEntry> monthlyTrends;

        // ─── Placement Readiness Factors ──────────────────────
        private PlacementFactors placementFactors;

        // ─── Recent Submissions ──────────────────────────────
        private List<RecentSubmission> recentSubmissions;

        // ─── College Contract Info ─────────────────────────────
        private CollegeInfo college;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RecentSubmission {
        private String id;
        private String studentName;
        private String title;
        private String type;
        private int credits;
        private String date;
        private String status;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class StudentPerformance {
        private String id;
        private String name;
        private String email;
        private String department;
        private String rollNo;
        private String avatarUrl;
        private int totalCredits;
        private int approvedSubmissions;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MentorPerformance {
        private String id;
        private String name;
        private String department;
        private String avatarUrl;
        private int successRate;
        private int approvedCount;
        private int totalCreditsGuided;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DepartmentChartEntry {
        /** Abbreviation for chart axis */
        private String name;
        /** Full department name for tooltip */
        private String fullName;
        private int students;
        private int credits;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CategoryChartEntry {
        private String name;
        private int value;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MonthlyTrendEntry {
        private String month;
        private int approved;
        private int rejected;
        private int pending;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PlacementFactors {
        private int hackathonsCount;
        private int hackathonWins;
        private int certificationsCount;
        private int internshipsCount;
        private int projectsCount;
        private int placementPrepCount;
        private int researchCount;
        private int ppoCount;
        private int openSourceCount;
        private int examsCount;
        private int academicExcellenceCount;
        private int startupFreelanceCount;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CollegeInfo {
        private String id;
        private String name;
        private String status;
        private LocalDate contractStart;
        private LocalDate contractEnd;
    }

    // ================================================================
    // DEPARTMENTS
    // ================================================================

    /**
     * Response: summary for one department — used in the Departments page.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentSummary {
        private String id;
        private String name;
        private boolean active;

        /** HOD of this department (null if unassigned) */
        private UserSummary hod;

        private int mentorCount;
        private int studentCount;
        private int totalActivities;
        private int approvedCount;
        private int rejectedCount;
        private int pendingCount;
    }

    // ================================================================
    // USERS
    // ================================================================

    /**
     * Response: lightweight user record for lists (HOD requests, user management).
     * Avoids returning sensitive fields like passwordHash.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private String id;
        private String name;
        private String email;
        private String phone;
        private String position;
        private String avatarUrl;
        private String rollNo;
        private UserRole role;
        private UserStatus status;
        private String collegeId;
        private String collegeName;
        private String departmentId;
        private String departmentName;
        private String mentorId;
        private String mentorName;
        private String hodId;
        private LocalDateTime createdAt;
        private LocalDateTime lastLoginAt;
    }
}
