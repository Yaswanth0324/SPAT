package com.sapt.auth.controller;

import com.sapt.auth.dto.AuthDtos;
import com.sapt.auth.dto.LoginRequest;
import com.sapt.auth.dto.LoginResponse;
import com.sapt.auth.dto.RegisterRequest;
import com.sapt.auth.service.AuthService;
import com.sapt.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * ============================================================
 * AuthController - REST Controller for Authentication
 * ============================================================
 * Exposes public authentication endpoints under /api/auth/
 *
 * All endpoints are PUBLIC (no JWT required).
 * Defined as permitAll() in SecurityConfig.
 *
 * Endpoints:
 *   POST /api/auth/login           — Login with email + password + role
 *   POST /api/auth/register        — Register new account (sends OTP)
 *   POST /api/auth/otp/send        — Request a new OTP
 *   POST /api/auth/otp/verify      — Verify OTP code
 *   POST /api/auth/password/reset  — Reset password with OTP
 *   POST /api/auth/logout          — Logout (client clears token)
 * ============================================================
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Authenticate user with email, password, and role.
     * Returns a JWT Bearer token on success.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    /**
     * Register a new user account.
     * Sends an OTP to the provided email for verification.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(
            @Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(
                "Registration successful. Please verify your email using the OTP sent."));
    }

    /**
     * Send an OTP to the given email for EMAIL_VERIFICATION or PASSWORD_RESET.
     */
    @PostMapping("/otp/send")
    public ResponseEntity<ApiResponse<Void>> sendOtp(
            @Valid @RequestBody AuthDtos.OtpRequest request) {
        authService.sendOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to " + request.getEmail()));
    }

    /**
     * Verify the OTP entered by the user.
     * Marks the email as verified if purpose is EMAIL_VERIFICATION.
     */
    @PostMapping("/otp/verify")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(
            @Valid @RequestBody AuthDtos.OtpVerifyRequest request) {
        authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully"));
    }

    @GetMapping("/verify")
    public ResponseEntity<Void> verifyUserLink(@RequestParam("email") String email) {
        authService.verifyEmailDirect(email);
        return ResponseEntity.status(org.springframework.http.HttpStatus.FOUND)
                .location(java.net.URI.create("http://localhost:5173/admin-login"))
                .build();
    }

    @PostMapping("/password/reset")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody AuthDtos.PasswordResetRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully. Please log in."));
    }

    /**
     * Logout — for stateless JWT, the client must clear the token.
     * If token blacklisting is implemented, this endpoint handles server-side revocation.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = (authHeader != null && authHeader.startsWith("Bearer "))
                ? authHeader.substring(7) : null;
        authService.logout(token);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully. Please clear your token."));
    }

    @GetMapping("/colleges")
    public ResponseEntity<ApiResponse<java.util.List<AuthDtos.CollegeDto>>> getColleges() {
        return ResponseEntity.ok(ApiResponse.success("Colleges fetched successfully", authService.getAllColleges()));
    }

    @GetMapping("/colleges/departments")
    public ResponseEntity<ApiResponse<java.util.List<String>>> getDepartments(@RequestParam String collegeName) {
        return ResponseEntity.ok(ApiResponse.success("Departments fetched successfully", authService.getDepartmentsByCollegeName(collegeName)));
    }

    @GetMapping("/mentors")
    public ResponseEntity<ApiResponse<java.util.List<AuthDtos.MentorDto>>> getMentors(
            @RequestParam String collegeName,
            @RequestParam String departmentName) {
        return ResponseEntity.ok(ApiResponse.success("Mentors fetched successfully", authService.getMentors(collegeName, departmentName)));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<java.util.List<com.sapt.auth.entity.User>>> getUsersByCollegeAndRole(
            @RequestParam String collegeName,
            @RequestParam com.sapt.common.enums.UserRole role) {
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", authService.getUsersByCollegeAndRole(collegeName, role)));
    }

    @GetMapping("/users/mentor/{mentorId}")
    public ResponseEntity<ApiResponse<java.util.List<com.sapt.auth.entity.User>>> getUsersByMentorId(
            @PathVariable String mentorId) {
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", authService.getUsersByMentorId(mentorId)));
    }

    @PostMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            @PathVariable String userId,
            @RequestParam com.sapt.common.enums.UserStatus status) {
        authService.updateUserStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully"));
    }

    @PutMapping("/users/{userId}/profile")
    public ResponseEntity<ApiResponse<com.sapt.auth.entity.User>> updateProfile(
            @PathVariable String userId,
            @RequestBody com.sapt.auth.dto.ProfileUpdateRequest request) {
        com.sapt.auth.entity.User updated = authService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }
}
