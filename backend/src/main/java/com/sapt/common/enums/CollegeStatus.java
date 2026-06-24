package com.sapt.common.enums;

/**
 * CollegeStatus - Represents the operational status of a registered college.
 */
public enum CollegeStatus {
    /** College is fully active and using the platform. */
    ACTIVE,
    /** College has been deactivated (e.g. contract expired or manual deactivation). */
    INACTIVE,
    /** College is temporarily suspended due to policy violation or non-payment. */
    SUSPENDED
}
