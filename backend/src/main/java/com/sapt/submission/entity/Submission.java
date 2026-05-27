package com.sapt.submission.entity;

import com.sapt.common.enums.ActivityCategory;
import com.sapt.common.enums.SubmissionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * Submission - MySQL Entity (Core domain object)
 * Represents a student's activity point submission.
 * TODO (Submission Team): Add file attachment URLs, reviewer history, etc.
 */
@Entity
@Table(name = "submissions")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Student who made this submission */
    @Column(nullable = false)
    private Long studentId;

    /** Mentor assigned to review this submission */
    private Long mentorId;

    /** HOD who may do final approval */
    private Long hodId;

    /** Category of the activity */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityCategory category;

    /** Title of the activity/event */
    @Column(nullable = false)
    private String activityTitle;

    /** Student's description of the activity */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** Date when the activity took place */
    private LocalDateTime activityDate;

    /** URL/path to uploaded proof document */
    private String proofDocumentUrl;

    /** Points claimed by student */
    private Integer claimedPoints;

    /** Points awarded after approval (may differ from claimed) */
    private Integer awardedPoints;

    /** Current status in the review workflow */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status;

    /** Reviewer's comments or rejection reason */
    @Column(columnDefinition = "TEXT")
    private String reviewRemarks;

    /** When the mentor reviewed this submission */
    private LocalDateTime reviewedAt;

    @CreationTimestamp @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
