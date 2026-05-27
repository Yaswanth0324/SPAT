package com.sapt.auth.service;

import com.sapt.auth.dto.AuthDtos;
import com.sapt.auth.dto.LoginRequest;
import com.sapt.auth.dto.LoginResponse;
import com.sapt.auth.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * ============================================================
 * AuthServiceImpl - Authentication Service Implementation
 * ============================================================
 * Implements all authentication operations defined in AuthService.
 *
 * TODO (Auth Team):
 *  - Inject: AuthUserRepository, JwtUtil, PasswordEncoder
 *  - Inject: OtpService, MailService
 *  - Implement: login, register, sendOtp, verifyOtp, resetPassword
 *  - Use SaptException for all error cases
 *  - Add @Transactional where DB writes are involved
 * ============================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    // TODO: Inject dependencies
    // private final AuthUserRepository authUserRepository;
    // private final JwtUtil jwtUtil;
    // private final PasswordEncoder passwordEncoder;
    // private final OtpService otpService;
    // private final AuthenticationManager authenticationManager;

    @Override
    public LoginResponse login(LoginRequest request) {
        // TODO: Implement login logic
        // 1. Authenticate using authenticationManager
        // 2. Load user from repository
        // 3. Generate JWT token
        // 4. Return LoginResponse with token and user info
        log.warn("AuthServiceImpl.login() - NOT YET IMPLEMENTED");
        throw new UnsupportedOperationException("login() not yet implemented");
    }

    @Override
    public void register(RegisterRequest request) {
        // TODO: Implement registration logic
        // 1. Check if email already exists
        // 2. Encode password with BCrypt
        // 3. Save AuthUser entity
        // 4. Send OTP verification email
        log.warn("AuthServiceImpl.register() - NOT YET IMPLEMENTED");
        throw new UnsupportedOperationException("register() not yet implemented");
    }

    @Override
    public void sendOtp(AuthDtos.OtpRequest request) {
        // TODO: Implement OTP sending logic
        // 1. Generate OTP using CommonUtils.generateOtp()
        // 2. Save OtpToken entity
        // 3. Send email with OTP via MailService
        log.warn("AuthServiceImpl.sendOtp() - NOT YET IMPLEMENTED");
        throw new UnsupportedOperationException("sendOtp() not yet implemented");
    }

    @Override
    public void verifyOtp(AuthDtos.OtpVerifyRequest request) {
        // TODO: Implement OTP verification logic
        // 1. Find OTP by email + purpose + unused
        // 2. Check if expired
        // 3. Mark as used
        // 4. If EMAIL_VERIFICATION, set emailVerified = true
        log.warn("AuthServiceImpl.verifyOtp() - NOT YET IMPLEMENTED");
        throw new UnsupportedOperationException("verifyOtp() not yet implemented");
    }

    @Override
    public void resetPassword(AuthDtos.PasswordResetRequest request) {
        // TODO: Implement password reset logic
        // 1. Verify OTP first
        // 2. Update user password (BCrypt encode)
        // 3. Invalidate all OTPs for this email
        log.warn("AuthServiceImpl.resetPassword() - NOT YET IMPLEMENTED");
        throw new UnsupportedOperationException("resetPassword() not yet implemented");
    }

    @Override
    public void logout(String token) {
        // TODO: Implement logout
        // For stateless JWT: no server action required
        // If implementing token blacklist: add token to blacklist (Redis/DB)
        log.info("User logged out. Client must clear the token.");
    }
}
