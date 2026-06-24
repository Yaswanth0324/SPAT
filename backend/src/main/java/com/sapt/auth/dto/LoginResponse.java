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

    /** User's display name */
    private String fullName;

    /** User's database ID (UUID string) */
    private String id;

    /** User's college name */
    private String college;

    /** User's profile picture / avatar */
    private String avatarUrl;
}

