package com.sapt.common.enums;

/**
 * ============================================================
 * UserRole - System-wide Role Definitions
 * ============================================================
 * Defines all user roles in the SAPT system.
 * Used for role-based access control (RBAC) in:
 *  - JWT claims
 *  - Spring Security @PreAuthorize annotations
 *  - Entity role fields
 *
 * Role Hierarchy (Highest to Lowest):
 *   SYSTEM_ADMIN > COLLEGE_ADMIN > HOD > MENTOR > STUDENT
 * ============================================================
 */
public enum UserRole {

    /**
     * Top-level system administrator.
     * Can manage all colleges, admins, and system settings.
     */
    SYSTEM_ADMIN,

    /**
     * College-level administrator.
     * Can manage HODs, mentors, and students within a college.
     */
    COLLEGE_ADMIN,

    /**
     * Head of Department.
     * Can manage mentors and review student activity submissions.
     */
    HOD,

    /**
     * Faculty mentor assigned to a group of students.
     * Can review and approve/reject student submissions.
     */
    MENTOR,

    /**
     * Student — the primary user of the system.
     * Can submit activity proofs for point tracking.
     */
    STUDENT
}
