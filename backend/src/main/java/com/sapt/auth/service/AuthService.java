package com.sapt.auth.service;

import com.sapt.auth.dto.AuthDtos;
import com.sapt.auth.dto.LoginRequest;
import com.sapt.auth.dto.LoginResponse;
import com.sapt.auth.dto.RegisterRequest;

/**
 * ============================================================
 * AuthService - Authentication Service Interface
 * ============================================================
 * Defines the contract for all authentication operations.
 * Implementation: AuthServiceImpl.java (create in this package)
 *
 * TODO (Auth Team):
 *  - Create AuthServiceImpl implements AuthService
 *  - Implement all methods below
 *  - Use AuthUserRepository, JwtUtil, PasswordEncoder
 *  - Use OtpService for OTP operations
 * ============================================================
 */
public interface AuthService {

    /**
     * Authenticate user with email + password + role.
     * Returns a LoginResponse with JWT token on success.
     */
    LoginResponse login(LoginRequest request);

    /**
     * Register a new user with the given role.
     * Sends OTP verification email after registration.
     */
    void register(RegisterRequest request);

    /**
     * Send an OTP to the given email for the specified purpose.
     * Purpose: "EMAIL_VERIFICATION" or "PASSWORD_RESET"
     */
    void sendOtp(AuthDtos.OtpRequest request);

    /**
     * Verify the OTP entered by the user.
     * Marks OTP as used and verifies email if applicable.
     */
    void verifyOtp(AuthDtos.OtpVerifyRequest request);

    /**
     * Reset user password using a verified OTP.
     */
    void resetPassword(AuthDtos.PasswordResetRequest request);

    /**
     * Logout — invalidate token on server side if blacklisting is used.
     * For stateless JWT, this may simply return success (client clears token).
     */
    void logout(String token);
}
