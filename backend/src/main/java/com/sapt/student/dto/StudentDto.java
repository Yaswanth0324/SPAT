package com.sapt.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * StudentDto - Data Transfer Objects for Student module.
 */
public class StudentDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        private String name;
        private String email;
        private String phone;
        private String password;
        private String avatar;
        private String mentorId;
        private String mentorName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentDashboardStats {
        private int totalCredits;
        private int totalApproved;
        private int totalRejected;
        private int totalPending;
        private int stars;
        private String badge;
        private List<CreditGrowthPoint> growthData;
        private List<com.sapt.submission.dto.SubmissionDto.SubmissionResponse> submissions;
        private List<com.sapt.student.dto.DailyLogDto.Response> logs;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreditGrowthPoint {
        private String date; // YYYY-MM
        private int credits;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomCategoryRequest {
        private String categoryName;
        private String achievementType;
        private Integer suggestedPoints;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomCategoryResponse {
        private String categoryId;
        private String subTypeId;
        private String categoryName;
        private String achievementType;
        private Integer points;
    }
}
