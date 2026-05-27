package com.sapt.auth.dto;

import com.sapt.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ============================================================
 * LoginResponse - DTO for Login API Response
 * ============================================================
 * Returned in: POST /api/auth/login (inside ApiResponse<LoginResponse>)
 *
 * TODO (Auth Team):
 *  - Populate this from AuthService after successful login
 * ============================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    /** JWT access token — frontend must store and send with each request */
    private String token;

    /** Token type (always "Bearer") */
    private String tokenType;

    /** Token expiry time in milliseconds */
    private long expiresIn;

    /** User's email */
    private String email;

    /** User's role — frontend uses this to route to correct dashboard */
    private UserRole role;

    /** User's display name */
    private String fullName;
}
