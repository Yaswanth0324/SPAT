package com.sapt.auth.entity;

import com.sapt.common.enums.UserRole;
import com.sapt.common.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

/**
 * ============================================================
 * User — Unified User Entity (All Roles)
 * ============================================================
 * The single source of truth for ALL users in the system.
 * All five roles are stored in this one table:
 *   SYSTEM_ADMIN, COLLEGE_ADMIN, HOD, MENTOR, STUDENT
 *
 * Role-specific fields are nullable and only populated
 * when relevant to the user's role:
 *
 *   SYSTEM_ADMIN  → only core fields (name, email, adminId)
 *   COLLEGE_ADMIN → collegeId, adminId
 *   HOD           → collegeId, departmentId, hodId (if dept has HOD above)
 *   MENTOR        → collegeId, departmentId, hodId
 *   STUDENT       → collegeId, departmentId, rollNo, mentorId, mentorName
 *
 * OTP is stored directly on this entity (no separate otp_tokens table).
 * Self-referencing FKs: mentor_id and hod_id reference users(id).
 *
 * Table: users
 * ============================================================
 */
@Entity
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_users_email",      columnList = "email",         unique = true),
        @Index(name = "idx_users_role",       columnList = "role"),
        @Index(name = "idx_users_college",    columnList = "college_id"),
        @Index(name = "idx_users_department", columnList = "department_id"),
        @Index(name = "idx_users_mentor",     columnList = "mentor_id"),
        @Index(name = "idx_users_hod",        columnList = "hod_id"),
        @Index(name = "idx_users_status",     columnList = "status")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    // ─── Primary Key (UUID) ───────────────────────────────────
    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false, columnDefinition = "CHAR(36)")
    private String id;

    // ─── Core Identity ────────────────────────────────────────
    /**
     * The role determines which role-specific fields are populated.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @JsonIgnore
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    // ─── Common Profile Fields ────────────────────────────────
    /**
     * Employee ID for staff roles (COLLEGE_ADMIN, HOD, MENTOR).
     * Admin reference number for SYSTEM_ADMIN.
     */
    @Column(name = "admin_id", length = 50)
    private String adminId;

    @Column(name = "avatar_url", columnDefinition = "LONGTEXT")
    private String avatarUrl;

    @Column(length = 20)
    private String phone;

    /**
     * Job title or position (e.g., "Head of Department – CSE",
     * "Associate Professor", "Assistant Professor").
     */
    @Column(length = 150)
    private String position;

    /** ID card / profile card image URL */
    @Column(name = "id_card_url", columnDefinition = "LONGTEXT")
    private String idCardUrl;

    // ─── College Reference ────────────────────────────────────
    /**
     * FK → colleges.id (UUID).
     * null for SYSTEM_ADMIN.
     */
    @Column(name = "college_id", columnDefinition = "CHAR(36)")
    private String collegeId;

    /**
     * Denormalized college name for API responses / display without JOIN.
     * Kept in sync whenever college assignment changes.
     * Frontend uses: user.college
     */
    @Column(name = "college_name", length = 255)
    private String collegeName;

    // ─── Department Reference ─────────────────────────────────
    /**
     * FK → departments.id (UUID).
     * Applicable to HOD, MENTOR, STUDENT.
     */
    @Column(name = "department_id", columnDefinition = "CHAR(36)")
    private String departmentId;

    /**
     * Denormalized department name for API responses / display without JOIN.
     * Kept in sync whenever department assignment changes.
     * Frontend uses: user.department
     */
    @Column(name = "department_name", length = 255)
    private String departmentName;

    // ─── Student-Specific Fields ─────────────────────────────
    /**
     * Student roll/register number.
     * Unique per college (enforced by uk_roll_per_college constraint).
     */
    @Column(name = "roll_no", length = 50)
    private String rollNo;

    /**
     * Self-referencing FK → users.id (mentor's user record).
     * Set when role = STUDENT; references the assigned MENTOR user.
     */
    @Column(name = "mentor_id", columnDefinition = "CHAR(36)")
    private String mentorId;

    /**
     * Denormalized mentor name for fast display without a join.
     * Kept in sync when mentor changes.
     */
    @Column(name = "mentor_name", length = 255)
    private String mentorName;

    // ─── HOD Reference ────────────────────────────────────────
    /**
     * Self-referencing FK → users.id (HOD's user record).
     * Set when role = MENTOR; references the HOD overseeing this mentor.
     */
    @Column(name = "hod_id", columnDefinition = "CHAR(36)")
    private String hodId;

    // ─── Account Status ───────────────────────────────────────
    /**
     * Approval status:
     *   PENDING  → registered, awaiting supervisor approval
     *   APPROVED → active, can log in and use the system
     *   REJECTED → denied access
     *
     * Default is PENDING for STUDENT registrations.
     * Staff accounts created by admins are set to APPROVED directly.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UserStatus status = UserStatus.PENDING;

    /** Whether this account is enabled (soft-delete flag) */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    /** Timestamp of last successful login */
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    // ─── OTP (stored directly on user, no separate otp_tokens table) ─
    /**
     * One-time password code for email verification or password reset.
     * Cleared after successful use.
     */
    @Column(name = "otp_code", length = 10)
    private String otpCode;

    /** When the OTP code expires (typically 10-15 minutes after issue) */
    @Column(name = "otp_expires_at")
    private LocalDateTime otpExpiresAt;

    // ─── Timestamps ──────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public String getAvatar() {
        return avatarUrl;
    }

    public String getProfileImage() {
        return avatarUrl;
    }

    public String getCollege() {
        return collegeName;
    }

    public String getDepartment() {
        return departmentName;
    }
}
