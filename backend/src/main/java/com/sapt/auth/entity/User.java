package com.sapt.auth.entity;

import com.sapt.common.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * User - Unified user entity for all roles.
 * Table: users
 *
 * All roles (SYSTEM_ADMIN, COLLEGE_ADMIN, HOD, MENTOR, STUDENT) share this table.
 * Role-specific detail tables (system_admins, college_admins, etc.) link to this via userId.
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    /** UUID primary key */
    @Id
    @Column(name = "id", length = 36)
    private String id;

    /** Role of the user */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    /** Full name */
    @Column(name = "name")
    private String name;

    /** Unique login email */
    @Column(nullable = false, unique = true)
    private String email;

    /** BCrypt-hashed password — NEVER store plain text */
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    /** Employee/Admin ID (for SYSTEM_ADMIN, COLLEGE_ADMIN, HOD, MENTOR) */
    @Column(name = "admin_id")
    private String adminId;

    /** Phone number */
    @Column(name = "phone")
    private String phone;

    /** Position/Designation */
    @Column(name = "position")
    private String position;

    /** FK → colleges.id (null for SYSTEM_ADMIN) */
    @Column(name = "college_id", length = 36)
    private String collegeId;

    /** Denormalized college name for fast reads */
    @Column(name = "college_name")
    private String collegeName;

    /** FK → departments.id */
    @Column(name = "department_id", length = 36)
    private String departmentId;

    /** Denormalized department name */
    @Column(name = "department_name")
    private String departmentName;

    /** Roll number (STUDENT only) */
    @Column(name = "roll_no")
    private String rollNo;

    /** FK → users.id (mentor of this student) */
    @Column(name = "mentor_id", length = 36)
    private String mentorId;

    /** Denormalized mentor name */
    @Column(name = "mentor_name")
    private String mentorName;

    /** FK → users.id (HOD of this user's department) */
    @Column(name = "hod_id", length = 36)
    private String hodId;

    /** Account approval status */
    @Column(name = "status")
    private String status;  // PENDING, APPROVED, REJECTED

    /** Whether the account is active (soft-delete) */
    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    /** Whether the email has been verified via link or OTP */
    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified;

    /** Timestamp of last login */
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    /** OTP code for email verification */
    @Column(name = "otp_code")
    private String otpCode;

    /** OTP expiry timestamp */
    @Column(name = "otp_expires_at")
    private LocalDateTime otpExpiresAt;

    /** Profile picture (Base64 or URL) */
    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;


    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** Generate a new UUID id before persisting if not set. */
    @PrePersist
    public void generateId() {
        if (this.id == null || this.id.isBlank()) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
