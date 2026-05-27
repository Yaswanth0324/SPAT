package com.sapt.submission.dto;

import com.sapt.common.enums.ActivityCategory;
import com.sapt.common.enums.SubmissionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * SubmissionDto - DTOs for Submission module.
 * TODO (Submission Team): Define all request/response shapes.
 */
public class SubmissionDto {

    /** Used by student to create a new submission */
    @Data
    public static class CreateSubmissionRequest {
        @NotNull(message = "Category is required")
        private ActivityCategory category;

        @NotBlank(message = "Activity title is required")
        private String activityTitle;

        private String description;
        private LocalDateTime activityDate;
        private Integer claimedPoints;
        // TODO: Add file upload handling
    }

    /** Used by mentor/HOD to review a submission */
    @Data
    public static class ReviewSubmissionRequest {
        @NotNull(message = "Status is required")
        private SubmissionStatus status;

        private String reviewRemarks;
        private Integer awardedPoints;
    }

    /** Returned in API responses */
    @Data
    public static class SubmissionResponse {
        private Long id;
        private Long studentId;
        private String studentName;
        private ActivityCategory category;
        private String activityTitle;
        private String description;
        private LocalDateTime activityDate;
        private String proofDocumentUrl;
        private Integer claimedPoints;
        private Integer awardedPoints;
        private SubmissionStatus status;
        private String reviewRemarks;
        private LocalDateTime createdAt;
        private LocalDateTime reviewedAt;
        // TODO: Add more fields as needed
    }
}
