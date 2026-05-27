package com.sapt.common.constants;

/**
 * ============================================================
 * AppConstants - Application-Wide Constants
 * ============================================================
 * Central place for all magic strings, numbers, and values.
 *
 * Rules:
 *  - DO NOT use raw strings in code. Define them here.
 *  - Group constants by logical section.
 *  - All constants must be public static final.
 *
 * TODO (Team):
 *  - Add endpoint path constants
 *  - Add pagination defaults
 *  - Add OTP config values
 *  - Add file upload constraints
 * ============================================================
 */
public final class AppConstants {

    // Prevent instantiation
    private AppConstants() {}

    // --------------------------------------------------------
    // API Paths
    // --------------------------------------------------------
    public static final String API_BASE         = "/api";
    public static final String AUTH_BASE        = "/api/auth";
    public static final String STUDENT_BASE     = "/api/student";
    public static final String MENTOR_BASE      = "/api/mentor";
    public static final String HOD_BASE         = "/api/hod";
    public static final String COLLEGE_ADMIN_BASE = "/api/college-admin";
    public static final String SYSTEM_ADMIN_BASE  = "/api/system-admin";
    public static final String SUBMISSION_BASE  = "/api/submission";

    // --------------------------------------------------------
    // JWT
    // --------------------------------------------------------
    public static final String JWT_BEARER_PREFIX = "Bearer ";
    public static final String JWT_HEADER        = "Authorization";
    public static final String JWT_CLAIM_ROLE    = "role";
    public static final String JWT_CLAIM_USER_ID = "userId";

    // --------------------------------------------------------
    // OTP
    // --------------------------------------------------------
    public static final int OTP_LENGTH          = 6;
    public static final int OTP_EXPIRY_MINUTES  = 10;

    // --------------------------------------------------------
    // Pagination
    // --------------------------------------------------------
    public static final int DEFAULT_PAGE_SIZE   = 10;
    public static final int MAX_PAGE_SIZE       = 100;
    public static final String DEFAULT_SORT_BY  = "createdAt";

    // --------------------------------------------------------
    // File Upload
    // --------------------------------------------------------
    public static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
    public static final String[] ALLOWED_FILE_TYPES = {
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg"
    };

    // --------------------------------------------------------
    // Messages (Success)
    // --------------------------------------------------------
    public static final String MSG_LOGIN_SUCCESS    = "Login successful";
    public static final String MSG_REGISTER_SUCCESS = "Registration successful";
    public static final String MSG_OTP_SENT         = "OTP sent to your email";
    public static final String MSG_OTP_VERIFIED     = "OTP verified successfully";
    public static final String MSG_LOGOUT_SUCCESS   = "Logout successful";

    // --------------------------------------------------------
    // Messages (Error)
    // --------------------------------------------------------
    public static final String ERR_USER_NOT_FOUND    = "User not found";
    public static final String ERR_EMAIL_EXISTS      = "Email already registered";
    public static final String ERR_INVALID_OTP       = "Invalid or expired OTP";
    public static final String ERR_INVALID_CREDS     = "Invalid email or password";
    public static final String ERR_ACCESS_DENIED     = "Access denied";
    public static final String ERR_SUBMISSION_EXISTS = "Submission already exists for this activity";
}
