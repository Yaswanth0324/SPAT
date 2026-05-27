package com.sapt.common.utils;

import java.security.SecureRandom;
import java.time.LocalDateTime;

/**
 * ============================================================
 * CommonUtils - Shared Utility Methods
 * ============================================================
 * General-purpose utility methods used across all modules.
 *
 * TODO (Team):
 *  - Add any shared helper methods here
 *  - Keep methods stateless and testable
 *  - Do NOT add business-logic here; only pure utility functions
 * ============================================================
 */
public final class CommonUtils {

    private static final SecureRandom RANDOM = new SecureRandom();

    // Prevent instantiation
    private CommonUtils() {}

    /**
     * Generates a random numeric OTP of the given length.
     * TODO: Implement this method
     */
    public static String generateOtp(int length) {
        // TODO: Generate a random numeric string of given length
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < length; i++) {
            otp.append(RANDOM.nextInt(10));
        }
        return otp.toString();
    }

    /**
     * Checks if an OTP has expired given its creation time.
     * TODO: Implement this method
     */
    public static boolean isOtpExpired(LocalDateTime createdAt, int expiryMinutes) {
        // TODO: Compare createdAt + expiryMinutes with now
        return LocalDateTime.now().isAfter(createdAt.plusMinutes(expiryMinutes));
    }

    /**
     * Masks an email address for display (e.g., ya*****@gmail.com).
     * TODO: Implement this method
     */
    public static String maskEmail(String email) {
        // TODO: Implement email masking logic
        if (email == null || !email.contains("@")) return email;
        int atIndex = email.indexOf("@");
        String local = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        if (local.length() <= 2) return email;
        return local.charAt(0) + "*".repeat(local.length() - 1) + domain;
    }

    /**
     * Sanitizes a string by trimming and lowercasing.
     */
    public static String sanitize(String input) {
        if (input == null) return null;
        return input.trim().toLowerCase();
    }
}
