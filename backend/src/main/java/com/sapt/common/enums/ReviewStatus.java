package com.sapt.common.enums;

/**
 * ============================================================
 * ReviewStatus - Mentor Review Lifecycle for Daily Logs
 * ============================================================
 * Tracks the review state of a student's daily log entry.
 *
 * Workflow:
 *   PENDING → APPROVED
 *   PENDING → REJECTED
 * ============================================================
 */
public enum ReviewStatus {

    /** Submitted by student, awaiting mentor review */
    PENDING,

    /** Mentor reviewed and approved the log */
    APPROVED,

    /** Mentor reviewed and rejected the log */
    REJECTED
}
