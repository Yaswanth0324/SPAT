package com.sapt.auth.service;

import com.sapt.auth.dto.AuthDtos;
import com.sapt.auth.dto.LoginRequest;
import com.sapt.auth.dto.LoginResponse;
import com.sapt.auth.dto.RegisterRequest;
import com.sapt.auth.entity.User;
import com.sapt.auth.repository.UserRepository;
import com.sapt.common.enums.UserRole;
import com.sapt.common.exception.SaptException;
import com.sapt.security.CustomUserDetailsService;
import com.sapt.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * AuthServiceImpl - Authentication Service Implementation.
 * Uses the unified `users` table via UserRepository.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Value("${sapt.jwt.expiration:86400000}")
    private long jwtExpiration;

    // ─────────────────────────────────────────────────────────────────────────
    // Login
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public LoginResponse login(LoginRequest request) {
        // 1. Find user by email
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> SaptException.unauthorized("Invalid email or password"));

        // 2. Verify role matches
        if (!user.getRole().equals(request.getRole())) {
            throw SaptException.unauthorized("This account does not have the requested role");
        }

        // 3. Check account is active
        if (!user.isActive()) {
            throw SaptException.unauthorized("This account has been deactivated. Contact admin.");
        }

        // 4. Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw SaptException.unauthorized("Invalid email or password");
        }

        // 5. Generate JWT — subject = user.id (UUID string)
        var userDetails = userDetailsService.loadUserByUsername(user.getId());
        String token = jwtUtil.generateToken(userDetails);

        log.info("User '{}' (role={}) logged in successfully", user.getEmail(), user.getRole());

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration)
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(user.getName())
                .id(user.getId())
                .college(user.getCollegeName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Register (stub — OTP flow needed)
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public void register(RegisterRequest request) {
        log.warn("AuthServiceImpl.register() - NOT YET IMPLEMENTED");
        throw new UnsupportedOperationException("register() not yet implemented");
    }

    @Override
    public void sendOtp(AuthDtos.OtpRequest request) {
        log.warn("AuthServiceImpl.sendOtp() - NOT YET IMPLEMENTED");
        throw new UnsupportedOperationException("sendOtp() not yet implemented");
    }

    @Override
    public void verifyOtp(AuthDtos.OtpVerifyRequest request) {
        log.warn("AuthServiceImpl.verifyOtp() - NOT YET IMPLEMENTED");
        throw new UnsupportedOperationException("verifyOtp() not yet implemented");
    }

    @Override
    public void resetPassword(AuthDtos.PasswordResetRequest request) {
        log.warn("AuthServiceImpl.resetPassword() - NOT YET IMPLEMENTED");
        throw new UnsupportedOperationException("resetPassword() not yet implemented");
    }

    @Override
    public void logout(String token) {
        // Stateless JWT — client clears the token
        log.info("Logout called. Client must discard the JWT token.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Email Verification (via link click)
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void verifyEmailDirect(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> SaptException.notFound("User not found with email: " + email));

        user.setEmailVerified(true);
        user.setActive(true);
        user.setStatus("APPROVED");
        userRepository.save(user);

        log.info("User email '{}' has been verified and account activated.", email);
    }
}
