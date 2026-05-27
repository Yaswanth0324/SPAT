package com.sapt.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * ============================================================
 * OtpRequest / OtpVerifyRequest / PasswordResetRequest DTOs
 * ============================================================
 * DTOs for the OTP and Password Reset flow.
 *
 * Endpoints:
 *  POST /api/auth/otp/send        -> OtpRequest
 *  POST /api/auth/otp/verify      -> OtpVerifyRequest
 *  POST /api/auth/password/reset  -> PasswordResetRequest
 * ============================================================
 */
public class AuthDtos {

    /** Request to send OTP to an email */
    @Data
    public static class OtpRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Purpose is required (EMAIL_VERIFICATION or PASSWORD_RESET)")
        private String purpose;
    }

    /** Request to verify an OTP */
    @Data
    public static class OtpVerifyRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "OTP is required")
        @Size(min = 6, max = 6, message = "OTP must be 6 digits")
        private String otp;

        @NotBlank(message = "Purpose is required")
        private String purpose;
    }

    /** Request to reset password using a verified OTP */
    @Data
    public static class PasswordResetRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "OTP is required")
        @Size(min = 6, max = 6, message = "OTP must be 6 digits")
        private String otp;

        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String newPassword;
    }
}
