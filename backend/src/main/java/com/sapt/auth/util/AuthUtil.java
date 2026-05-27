package com.sapt.auth.util;

/**
 * ============================================================
 * AuthUtil - Auth Module Utility Methods
 * ============================================================
 * Shared helper methods specific to the auth module.
 *
 * TODO (Auth Team):
 *  - Add any auth-specific utility methods here
 *  - Keep methods static and stateless
 * ============================================================
 */
public final class AuthUtil {

    private AuthUtil() {}

    /**
     * Extracts the JWT token from a "Bearer <token>" Authorization header.
     *
     * @param authHeader The raw Authorization header value
     * @return The JWT token string, or null if header is invalid
     */
    public static String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    /**
     * Validates that a password meets minimum requirements.
     * TODO: Implement stricter validation rules
     *
     * @param password Raw password string
     * @return true if password is valid
     */
    public static boolean isValidPassword(String password) {
        // TODO: Add rules: min 8 chars, at least 1 uppercase, 1 number, 1 special char
        return password != null && password.length() >= 6;
    }

    /**
     * Checks if the OTP string is a valid 6-digit numeric OTP.
     *
     * @param otp The OTP string to validate
     * @return true if OTP is exactly 6 numeric digits
     */
    public static boolean isValidOtp(String otp) {
        return otp != null && otp.matches("\\d{6}");
    }
}
