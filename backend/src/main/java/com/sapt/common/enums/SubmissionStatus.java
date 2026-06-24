package com.sapt.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * ============================================================
 * SubmissionStatus — Activity Submission Lifecycle States
 * ============================================================
 * Workflow:
 *   Student submits  → PENDING
 *   Mentor approves  → APPROVED   (awardedCredits set by mentor)
 *   Mentor rejects   → REJECTED   (awardedCredits must be 0 — DB constraint)
 *
 * JSON Serialization:
 *   Serialized as LOWERCASE strings for frontend compatibility:
 *     PENDING  → "pending"
 *     APPROVED → "approved"
 *     REJECTED → "rejected"
 *
 *   Frontend checks: sub.status === 'pending' / 'approved' / 'rejected'
 *
 * DB Storage:
 *   Stored as uppercase string via @Enumerated(EnumType.STRING)
 *   so it matches the DB ENUM('pending','approved','rejected') values.
 *   Note: DB ENUM values are lowercase — ensure DDL uses lowercase.
 * ============================================================
 */
public enum SubmissionStatus {
    PENDING,
    APPROVED,
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
     * Deserialize from either UPPERCASE or lowercase JSON string.
     * Accepts: "PENDING", "pending", "Pending" etc.
     */
    @JsonCreator
    public static SubmissionStatus fromJson(String value) {
        if (value == null) return null;
        return SubmissionStatus.valueOf(value.toUpperCase());
    }
}
