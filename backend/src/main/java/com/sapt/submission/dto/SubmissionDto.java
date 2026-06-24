package com.sapt.submission.dto;

import com.sapt.common.enums.SubmissionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * SubmissionDto — DTOs for the Submission module.
 *
 * FIELD NAME ALIGNMENT WITH FRONTEND:
 *   Frontend (React)      Backend Entity          This DTO
 *   ─────────────────     ────────────────        ─────────────
 *   sub.type          ←  categoryName       →    type
 *   sub.achievementType← achievementType    →    achievementType
 *   sub.date          ←  activityDate       →    date
 *   sub.credits       ←  awardedCredits     →    credits
 *   sub.review        ←  reviewText         →    review
 *   sub.suggestedCredits← suggestedCredits  →    suggestedCredits
 *   sub.status        ←  status (enum)      →    status (lowercase via @JsonValue)
 *   sub.studentId     ←  studentId          →    studentId
 *   sub.mentorId      ←  mentorId           →    mentorId
 *
 * ActivityCategory is now an entity (not an enum).
 * The frontend uses category name strings (type = categoryName denormalized).
 */
public class SubmissionDto {

    // ─── CREATE REQUEST (Student → POST /submissions) ──────────────────────
    /** Used by a student to create a new submission */
    @Data
    public static class CreateSubmissionRequest {

        /** UUID of the ActivityCategory selected */
        @NotBlank(message = "Category ID is required")
        private String categoryId;

        /** UUID of the ActivitySubType selected */
        private String subTypeId;

        /** Activity/achievement title */
        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        @NotNull(message = "Activity date is required")
        private LocalDate activityDate;

        /** Credits the student is claiming (matches sub-type default) */
        private Integer suggestedCredits;
    }

    // ─── REVIEW REQUEST (Mentor → PUT /submissions/{id}/review) ───────────
    /** Used by mentor to review a submission */
    @Data
    public static class ReviewSubmissionRequest {
        @NotNull(message = "Status is required")
        private SubmissionStatus status;

        /** Mentor's review remarks */
        private String review;            // → entity.reviewText

        /** Credits awarded. Must be 0 if status=REJECTED (DB constraint) */
        private Integer credits;          // → entity.awardedCredits
    }

    // ─── RESPONSE (returned in all GET/POST API responses) ─────────────────
    /**
     * Returned in API responses.
     * Field names match the frontend's JavaScript object keys exactly.
     */
    @Data
    public static class SubmissionResponse {

        // ─── IDs (UUID strings) ──────────────────────────
        private String id;
        private String studentId;
        private String mentorId;
        private String categoryId;           // UUID (for lookups)
        private String subTypeId;            // UUID (for lookups)
        private String parentSubmissionId;   // UUID of original (for re-submissions)

        // ─── Frontend-named fields (match React sub.xxx exactly) ──
        /**
         * Activity category name string.
         * Frontend accesses as: sub.type
         * Maps to Submission.categoryName (denormalized)
         */
        private String type;

        /**
         * Achievement / activity sub-type label.
         * Frontend accesses as: sub.achievementType
         */
        private String achievementType;

        /** Activity title. Frontend: sub.title */
        private String title;

        /** Description. Frontend: sub.description */
        private String description;

        /**
         * Activity date (ISO date string: YYYY-MM-DD).
         * Frontend accesses as: sub.date
         * Maps to Submission.activityDate (LocalDate)
         */
        private LocalDate date;

        /**
         * Credits student claimed for this submission.
         * Frontend: sub.suggestedCredits
         */
        private Integer suggestedCredits;

        /**
         * Credits awarded by mentor.
         * Frontend accesses as: sub.credits
         * Maps to Submission.awardedCredits
         */
        private Integer credits;

        /**
         * Submission status.
         * Frontend checks: sub.status === 'pending' / 'approved' / 'rejected'
         * Serialized to lowercase via SubmissionStatus.toString()
         */
        private SubmissionStatus status;

        /**
         * Mentor's review feedback text.
         * Frontend accesses as: sub.review
         * Maps to Submission.reviewText
         */
        private String review;

        // ─── Student info (denormalized) ─────────────────
        private String studentName;

        // ─── File URLs ───────────────────────────────────
        /** Primary certificate/proof document URL */
        private String fileUrl;

        /** Presentation file URL */
        private String presentationUrl;

        /** Supporting document URL */
        private String documentUrl;

        /** Certificate file original name */
        private String certificateFile;

        /** Presentation file original name */
        private String presentationFile;

        /** Supporting document file original name */
        private String documentFile;

        /** All uploaded documents as a list */
        private List<DocumentInfo> allDocuments;

        // ─── Flags ───────────────────────────────────────
        /** true if this is a re-submission after rejection */
        private boolean isResubmission;

        // ─── Timestamps ──────────────────────────────────
        /** When mentor reviewed this submission */
        private LocalDateTime reviewedAt;

        /** When student submitted */
        private LocalDateTime submittedAt;

        /** Record creation time */
        private LocalDateTime createdAt;
    }

    // ─── NESTED: Document Info ─────────────────────────────────────────────
    @Data
    public static class DocumentInfo {
        private String name;    // file name
        private String type;    // 'certificate' | 'presentation' | 'document'
        private String url;     // stored URL
    }
}
