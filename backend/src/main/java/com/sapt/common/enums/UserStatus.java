package com.sapt.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * ============================================================
 * UserStatus — Account Approval Lifecycle States
 * ============================================================
 * Tracks a user profile's registration/approval status.
 *
 * Workflow:
 *   PENDING  → APPROVED  (mentor approves student / admin creates staff)
 *   PENDING  → REJECTED  (mentor rejects student)
 *
 * JSON Serialization:
 *   Serialized as LOWERCASE strings for frontend compatibility:
 *     PENDING  → "pending"
 *     APPROVED → "approved"
 *     REJECTED → "rejected"
 *
 *   Frontend checks (all lowercase):
 *     u.status === 'approved'
 *     u.status === 'pending'
 *     u.status === 'rejected'
 *     res.user.status === 'pending'
 *
 * DB Storage:
 *   Stored as uppercase string via @Enumerated(EnumType.STRING).
 * ============================================================
 */
public enum UserStatus {

    /** Registered but not yet approved by supervisor */
    PENDING,

    /** Approved — user may log in and use the system */
    APPROVED,

    /** Rejected — account remains inactive */
    REJECTED;

    /**
     * Serialize to lowercase JSON string.
     * Frontend expects: 'pending', 'approved', 'rejected'
     */
    @JsonValue
    public String toJson() {
        return this.name().toLowerCase();
    }

    /**
     * Deserialize from UPPERCASE or lowercase JSON string.
     * Accepts: "PENDING", "pending", "Pending" etc.
     */
    @JsonCreator
    public static UserStatus fromJson(String value) {
        if (value == null) return null;
        return UserStatus.valueOf(value.toUpperCase());
    }
}
