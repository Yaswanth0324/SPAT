package com.sapt.common.enums;

/**
 * ============================================================
 * SubmissionStatus - Activity Submission Lifecycle States
 * ============================================================
 * Tracks the status of a student's activity point submission
 * through the review workflow.
 *
 * Workflow:
 *   PENDING -> UNDER_REVIEW -> APPROVED / REJECTED
 *                          \-> REVISION_REQUESTED -> PENDING
 * ============================================================
 */
public enum SubmissionStatus {

    /** Student submitted, awaiting mentor review */
    PENDING,

    /** Mentor is currently reviewing the submission */
    UNDER_REVIEW,

    /** Mentor/HOD approved the submission — points awarded */
    APPROVED,

    /** Mentor/HOD rejected the submission — points not awarded */
    REJECTED,

    /** Mentor requested changes — student must resubmit */
    REVISION_REQUESTED,

    /** Student withdrew the submission before review */
    WITHDRAWN
}
