package com.sapt.auth.dto;

import com.sapt.common.enums.UserRole;
import com.sapt.common.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ============================================================
 * LoginResponse — Full user profile returned on successful login
 * ============================================================
 * Returned by: POST /api/auth/login
 *
 * The frontend's AuthContext stores this entire object as `user`.
 * All field names MUST match what the React code accesses:
 *
 *   user.id             → UUID string
 *   user.name           → display name (mapped from fullName)
 *   user.email
 *   user.role           → UserRole enum
 *   user.college        → college name string (frontend key)
 *   user.department     → department name string (frontend key)
 *   user.phone
 *   user.mentorId       → for STUDENT role
 *   user.hodId          → for MENTOR role
 *   user.rollNo         → for STUDENT role
 *   user.avatarUrl
 *   user.collegeId      → UUID FK (for API calls)
 *   user.departmentId   → UUID FK (for API calls)
 *
 * JWT metadata:
 *   token, tokenType, expiresIn
 * ============================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    // ─── JWT Metadata ────────────────────────────────────────
    /** JWT access token — frontend stores and sends as Bearer header */
    private String token;

    /** Always "Bearer" */
    private String tokenType;

    /** Token validity in milliseconds */
    private long expiresIn;

    // ─── Core Identity (matches frontend user.xxx keys) ───────
    /** User's UUID — frontend uses as user.id */
    private String id;

    /** Display name — frontend uses as user.name */
    private String name;

    /** Email address */
    private String email;

    /** Role enum — frontend uses for routing/access control */
    private UserRole role;

    /** Account approval status */
    private UserStatus status;

    // ─── Profile Fields ───────────────────────────────────────
    /** College name (denormalized) — frontend uses user.college */
    private String college;

    /** Department name (denormalized) — frontend uses user.department */
    private String department;

    /** Phone number */
    private String phone;

    /** Avatar/profile image URL */
    private String avatarUrl;

    /** Position/title (e.g., "Associate Professor") */
    private String position;

    // ─── UUID Reference Keys (for API calls from frontend) ───
    /** College UUID — frontend uses for college-scoped API calls */
    private String collegeId;

    /** Department UUID — frontend uses for department-scoped API calls */
    private String departmentId;

    // ─── Role-Specific Fields (null when not applicable) ──────
    /** Assigned mentor's UUID — STUDENT role only */
    private String mentorId;

    /** Assigned mentor's name — STUDENT role only */
    private String mentorName;

    /** HOD's UUID — MENTOR role only */
    private String hodId;

    /** Student roll/register number — STUDENT role only */
    private String rollNo;

    /** Employee/Admin ID — COLLEGE_ADMIN, HOD, MENTOR roles */
    private String adminId;

    public String getAvatar() {
        return avatarUrl;
    }

    public String getProfileImage() {
        return avatarUrl;
    }
}
