package com.sapt.student.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DailyLogDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Description is required")
        private String description;

        /** Mapped from frontend's "links" field */
        private String links;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String studentId;
        private String title;
        private String description;
        
        /** Mapped to frontend's "links" field */
        private String links;
        
        /** Mapped to frontend's "date" field (log_date) */
        private LocalDate date;
        
        private String mentorRemark;
        private String remarkedBy;
        private String reviewStatus;
        private LocalDateTime remarkedAt;
        private LocalDateTime createdAt;
    }
}
