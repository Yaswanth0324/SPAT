package com.sapt.mentor.dto;

import com.sapt.common.enums.UserRole;
import com.sapt.common.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class MentorDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MentorProfile {
        private String id;
        private String name;
        private String email;
        private String phone;
        private String position;
        private String collegeId;
        private String collegeName;
        private String departmentId;
        private String departmentName;
        private UserRole role;
        private UserStatus status;
        private String avatarUrl;
        private SuccessionRequestDto successionRequest;
        private LocalDateTime lastLoginAt;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuccessionRequestDto {
        private String id;
        private String name;        // candidateName
        private String email;       // candidateEmail
        private String phone;       // candidatePhone
        private String status;      // PENDING, APPROVED, etc.
        private LocalDate requestedAt;
    }

    @Data
    public static class SuccessionSubmitRequest {
        private String name;
        private String email;
        private String password;
        private String phone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentSummary {
        private String id;
        private String name;
        private String rollNo;
        private String email;
        private String phone;
        private String avatar;      // avatarUrl
        private String department;
        private int credits;
        private int activitiesCount;
        private int starsCount;
        private String badge;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyLogResponse {
        private String id;
        private String studentId;
        private String studentName;
        private String title;
        private String description;
        private String links;        // referenceLinks
        private String date;         // logDate formatted as YYYY-MM-DD
        private String reviewStatus; // approved | rejected | pending
        private String review;       // mentorRemark
    }

    @Data
    public static class UpdateProfileRequest {
        private String name;
        private String email;
        private String phone;
        private String avatar;
    }

    @Data
    public static class LogReviewRequest {
        private String reviewStatus;
        private String review;
    }
}
