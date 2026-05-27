package com.sapt.auth.dto;

import com.sapt.common.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * ============================================================
 * LoginRequest - DTO for Login API
 * ============================================================
 * Used in: POST /api/auth/login
 *
 * TODO (Auth Team):
 *  - Wire this DTO in AuthController
 *  - Pass to AuthService for validation
 * ============================================================
 */
@Data
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotNull(message = "Role is required")
    private UserRole role;
}
