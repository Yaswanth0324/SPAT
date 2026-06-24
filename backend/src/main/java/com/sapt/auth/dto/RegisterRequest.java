package com.sapt.auth.dto;

import com.sapt.common.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * ============================================================
 * RegisterRequest - DTO for Registration API
 * ============================================================
 * Used in: POST /api/auth/register
 *
 * The role field determines which module the user belongs to.
 * After registration, an OTP is sent to verify the email.
 * ============================================================
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    /**
     * The role this user is registering as.
     * Accepted values: STUDENT, MENTOR, HOD, COLLEGE_ADMIN, SYSTEM_ADMIN
     */
    @NotNull(message = "Role is required")
    private UserRole role;

    private String college;

    private String department;

    private String mentorName;

    private String idCardUrl;
}
