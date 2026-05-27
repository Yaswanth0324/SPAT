package com.sapt.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * ============================================================
 * RegisterRequest - DTO for Registration API
 * ============================================================
 * Used in: POST /api/auth/register
 *
 * TODO (Auth Team):
 *  - Add role-specific fields if needed (e.g., rollNumber for students)
 *  - Or keep it minimal and use separate profile-setup endpoints
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

    // TODO: Add more registration fields as per requirements
}
