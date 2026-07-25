package com.sapt.mentor.entity;

import com.sapt.common.enums.SuccessionRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ============================================================
 * SuccessionRequest — Mentor / HOD Handover Request Entity
 * ============================================================
 * When a MENTOR or HOD wants to hand over their account to
 * a new faculty member, they submit a succession request.
 *
 * The reviewer (HOD for MENTOR requests, College Admin for HOD
 * requests) can approve, reject, or the requester can cancel.
 *
 * On approval, the outgoing user's account credentials are
 * updated to the incoming candidate's details.
 *
 * Workflow:
 *   Outgoing user submits → status = "PENDING"
 *   Reviewer approves     → status = "APPROVED" → account transfer
 *   Reviewer rejects      → status = "REJECTED"
 *   Outgoing user cancels → status = "CANCELLED"
 *
 * Table: succession_requests
 * ============================================================
 */
@Entity
@Table(
    name = "succession_requests",
    indexes = {
        @Index(name = "idx_succession_outgoing", columnList = "outgoing_user_id"),
        @Index(name = "idx_succession_status",   columnList = "status"),
        @Index(name = "idx_succession_role",     columnList = "outgoing_role")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuccessionRequest {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false, columnDefinition = "CHAR(36)")
    private String id;

    // ─── Outgoing User ────────────────────────────────────────
    /** FK → users.id — the mentor/HOD initiating the handover */
    @Column(name = "outgoing_user_id", nullable = false, columnDefinition = "CHAR(36)")
    private String outgoingUserId;

    /** Whether the outgoing user is a MENTOR or HOD */
    @Enumerated(EnumType.STRING)
    @Column(name = "outgoing_role", nullable = false, length = 10)
    private SuccessionRole outgoingRole;

    // ─── Incoming Candidate Details ───────────────────────────
    @Column(name = "candidate_name", nullable = false, length = 255)
    private String candidateName;

    @Column(name = "candidate_email", nullable = false, length = 255)
    private String candidateEmail;

    @Column(name = "candidate_phone", length = 20)
    private String candidatePhone;

    /**
     * Pre-hashed password for the incoming candidate.
     * Hashed at request time using BCrypt.
     */
    @Column(name = "candidate_password_hash", nullable = false, length = 255)
    private String candidatePasswordHash;

    /** Date the succession was formally requested */
    @Column(name = "requested_at", nullable = false)
    @Builder.Default
    private LocalDate requestedAt = LocalDate.now();

    // ─── Review ──────────────────────────────────────────────
    /**
     * Current status: PENDING → APPROVED | REJECTED | CANCELLED
     */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING";

    /**
     * FK → users.id — the reviewer (HOD or College Admin).
     * null until the request is reviewed.
     */
    @Column(name = "reviewed_by", columnDefinition = "CHAR(36)")
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    // ─── Timestamps ──────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;
}
