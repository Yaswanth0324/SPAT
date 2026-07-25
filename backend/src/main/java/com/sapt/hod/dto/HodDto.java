package com.sapt.hod.dto;

import com.sapt.common.enums.UserRole;
import com.sapt.common.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * ============================================================
 * HodDto — All request/response DTOs for the HOD module
 * ============================================================
 * Naming mirrors the frontend field keys used in:
 *   HODDashboard.jsx  → DeptStatsResponse
 *   HODProfile.jsx    → HodProfile / UpdateProfileRequest
 * ============================================================
 */
public class HodDto {

    // =====================================================================
    // DASHBOARD — GET /api/hod/dashboard
    // =====================================================================

    /**
     * Top-level response for the HOD department analytics dashboard.
     * All fields match what HODDashboard.jsx reads from its useMemo block.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeptStatsResponse {

        // ── Stat cards ──────────────────────────────────────────
        /** All approved mentors in the HOD's department */
        private int totalMentors;

        /** All approved students in the HOD's department */
        private int totalStudents;

        /** Approved hackathon/ideathon/coding-competition submissions that were winning entries */
        private int hackathonsWon;

        /** Approved hackathon/ideathon/coding-competition submissions (non-winning) */
        private int hackathonsParticipated;

        /** Approved certification / workshop / seminar submissions */
        private int coursesDone;

        /** Approved internship submissions */
        private int internshipsDone;

        // ── Bar chart: factor breakdown ──────────────────────────
        /**
         * Placement factor counts for the bar chart.
         * Keys: Hackathons, Certifications, Internships, Projects, Publications
         */
        private Map<String, Integer> factorCounts;

        // ── Area chart: monthly skill trend ─────────────────────
        /** 12-entry list — one per calendar month */
        private List<SkillTrendEntry> skillTrendData;

        // ── Leaderboard: top students & mentors ─────────────────
        /** Top 3 students by total approved credits */
        private List<StudentPerformance> topStudents;

        /** Top 3 mentors by approval success rate */
        private List<MentorPerformance> topMentors;

        // ── Full lists for the mentors page (scoped to dept) ────
        /** All approved mentors in the department (used by HODMentors page) */
        private List<UserSummary> departmentMentors;

        /** All pending-approval mentors in the department (used by HODMentorApprovals) */
        private List<UserSummary> pendingMentors;
    }

    // ── Student performance (top-3 leaderboard) ─────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentPerformance {
        private String id;
        private String name;
        private String email;
        private String avatarUrl;
        private String rollNo;
        private String department;

        /** Sum of awardedCredits across all approved submissions */
        private int credits;

        /** Count of approved submissions */
        private int activitiesCount;

        /** Star tier (0-5) derived from credits thresholds */
        private int starsCount;

        /** Badge label: Bronze / Silver / Gold / Platinum / Diamond */
        private String badge;

        /** Breakdown by placement factor type */
        private FactorsBreakdown factors;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FactorsBreakdown {
        private int hackathons;
        private int certifications;
        private int internships;
        private int projects;
        private int publications;
    }

    // ── Mentor performance (top-3 leaderboard) ──────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MentorPerformance {
        private String id;
        private String name;
        private String email;
        private String avatarUrl;
        private String department;

        /** Total approved credits guided across all mentees */
        private int creditsGuided;

        /** Total submissions reviewed (any status) */
        private int reviewsHandled;

        /** Count of approved reviews */
        private int approvalsCount;

        /** Percentage: approvalsCount / (approved + rejected) * 100 */
        private int successRate;
    }

    // ── Monthly skill acquisition trend ─────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillTrendEntry {
        /** Short month name: Jan, Feb, … Dec */
        private String month;

        /** Count of approved submissions submitted in this month */
        private int achievements;
    }

    // ── Generic user summary (mentors list, pending approvals) ───────────

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
        private String adminId;
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

        // Mentor statistics fields (calculated on the backend using real DB data)
        private Integer successRate;
        private Integer reviewsHandled;
        private Integer approvalsCount;
        private Integer rejectedCount;
        private Integer pendingCount;
        private Integer creditsGuided;
        private Integer studentCount;
    }

    // =====================================================================
    // PROFILE — GET / PUT /api/hod/profile
    // =====================================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HodProfile {
        private String id;
        private String name;
        private String email;
        private String phone;
        private String position;
        private String avatarUrl;
        private String adminId;
        private UserRole role;
        private UserStatus status;
        private String collegeId;
        private String collegeName;
        private String departmentId;
        private String departmentName;
        private LocalDateTime lastLoginAt;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        private String name;
        private String phone;
        private String position;
        private String avatarUrl;
    }
}
