package com.sapt.auth.service;

import com.sapt.auth.dto.AuthDtos;
import com.sapt.auth.dto.LoginRequest;
import com.sapt.auth.dto.LoginResponse;
import com.sapt.auth.dto.RegisterRequest;
import com.sapt.auth.entity.User;
import com.sapt.auth.repository.UserRepository;
import com.sapt.common.enums.UserStatus;
import com.sapt.common.exception.SaptException;
import com.sapt.common.utils.CommonUtils;
import com.sapt.notification.NotificationService;
import com.sapt.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * ============================================================
 * AuthServiceImpl — Authentication Service Implementation
 * ============================================================
 * Implements all authentication operations against the
 * unified `users` table (no separate auth_users or otp_tokens).
 *
 * OTP Flow:
 *   OTP is stored directly on the User entity (otp_code, otp_expires_at).
 *   After successful verification the OTP fields are nulled out.
 *   A null otp_code signals "email verified".
 *
 * Login gate (all three must pass):
 *   1. Password correct        → Spring Security authentication
 *   2. otpCode == null         → email was verified
 *   3. status == APPROVED      → approved by supervisor / admin
 *
 * OTP validity : 10 minutes
 * OTP length   : 6 digits
 * ============================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final int    OTP_LENGTH         = 6;
    private static final int    OTP_EXPIRY_MINUTES = 10;
    private static final String PURPOSE_EMAIL      = "EMAIL_VERIFICATION";
    private static final String PURPOSE_RESET      = "PASSWORD_RESET";

    private final UserRepository        userRepository;
    private final JwtUtil               jwtUtil;
    private final PasswordEncoder       passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final NotificationService   notificationService;
    private final com.sapt.collegeadmin.repository.CollegeRepository collegeRepository;
    private final com.sapt.collegeadmin.repository.DepartmentRepository departmentRepository;

    // ============================================================
    // LOGIN
    // ============================================================

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        log.info("Login attempt for: {}", email);

        // 1. Verify credentials via Spring Security
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (BadCredentialsException e) {
            log.warn("Invalid credentials for: {}", email);
            throw SaptException.unauthorized("Invalid email or password");
        }

        // 2. Load user entity from DB
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> SaptException.notFound("User not found"));

        // 3. Role must match what the login page selected
        if (!user.getRole().equals(request.getRole())) {
            log.warn("Role mismatch for {} — requested: {}, actual: {}",
                    email, request.getRole(), user.getRole());
            throw SaptException.unauthorized("Your role does not match the selected login portal");
        }

        // 4. Email must be verified (otp_code is nulled after successful OTP verification)
        if (user.getOtpCode() != null) {
            log.warn("Unverified email login attempt: {}", email);
            throw SaptException.badRequest("Please verify your email before logging in");
        }

        // 5. Account must be approved (by mentor / admin / system)
        if (user.getStatus() != UserStatus.APPROVED) {
            log.warn("Non-approved login attempt for: {} (status={})", email, user.getStatus());
            throw SaptException.badRequest(
                    user.getStatus() == UserStatus.PENDING
                            ? "Your account is pending approval. Please wait."
                            : "Your account registration was rejected."
            );
        }

        // 6. Generate JWT from Spring Security principal
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        // 7. Update last login timestamp
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Login successful: {} (role={})", email, user.getRole());

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpirationMs())
                // ─── Core Identity ────────────────────────────
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                // ─── Profile ──────────────────────────────────
                .college(user.getCollegeName())       // user.college in frontend
                .department(user.getDepartmentName()) // user.department in frontend
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .position(user.getPosition())
                // ─── UUID References ──────────────────────────
                .collegeId(user.getCollegeId())
                .departmentId(user.getDepartmentId())
                // ─── Role-Specific (null when not applicable) ─
                .mentorId(user.getMentorId())
                .mentorName(user.getMentorName())
                .hodId(user.getHodId())
                .rollNo(user.getRollNo())
                .adminId(user.getAdminId())
                .build();

    }

    // ============================================================
    // REGISTER
    // ============================================================

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        log.info("Registration attempt: {} (role={})", email, request.getRole());

        // 1. Duplicate email check
        if (userRepository.existsByEmail(email)) {
            log.warn("Registration failed — email already exists: {}", email);
            throw SaptException.conflict("An account with this email already exists");
        }

        // 2. Look up and populate database reference fields
        String collegeId = null;
        String collegeName = null;
        if (request.getCollege() != null && !request.getCollege().isBlank()) {
            com.sapt.collegeadmin.entity.College college = collegeRepository.findByName(request.getCollege().trim())
                    .orElseThrow(() -> SaptException.notFound("College not found in database: " + request.getCollege()));
            collegeId = college.getId();
            collegeName = college.getName();
        }

        String departmentId = null;
        String departmentName = null;
        if (collegeId != null && request.getDepartment() != null && !request.getDepartment().isBlank()) {
            List<com.sapt.collegeadmin.entity.Department> depts = departmentRepository.findByCollegeId(collegeId);
            com.sapt.collegeadmin.entity.Department dept = depts.stream()
                    .filter(d -> d.getName().equalsIgnoreCase(request.getDepartment().trim()))
                    .findFirst()
                    .orElse(null);
            
            // Auto-create department if "Other" custom option was used
            if (dept == null) {
                dept = com.sapt.collegeadmin.entity.Department.builder()
                        .collegeId(collegeId)
                        .name(request.getDepartment().trim())
                        .isActive(true)
                        .build();
                dept = departmentRepository.save(dept);
            }
            departmentId = dept.getId();
            departmentName = dept.getName();
        }

        String mentorId = null;
        String mentorName = null;
        if (com.sapt.common.enums.UserRole.STUDENT.equals(request.getRole()) && request.getMentorName() != null && !request.getMentorName().isBlank()) {
            List<User> mentors = userRepository.findByRole(com.sapt.common.enums.UserRole.MENTOR);
            final String targetCollegeId = collegeId;
            User mentor = mentors.stream()
                    .filter(m -> m.getName().equalsIgnoreCase(request.getMentorName().trim()) 
                            && m.getCollegeId() != null 
                            && m.getCollegeId().equals(targetCollegeId))
                    .findFirst()
                    .orElse(null);
            if (mentor != null) {
                mentorId = mentor.getId();
                mentorName = mentor.getName();
            } else {
                mentorName = request.getMentorName().trim();
            }
        }

        // 3. Generate OTP before saving (so we can send it immediately after)
        String otp = CommonUtils.generateOtp(OTP_LENGTH);

        // 4. Create the User record in the unified users table
        User newUser = User.builder()
                .name(request.getFullName())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(UserStatus.PENDING)     // awaiting email verify + supervisor approval
                .isActive(true)
                .otpCode(otp)
                .otpExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .collegeId(collegeId)
                .collegeName(collegeName)
                .departmentId(departmentId)
                .departmentName(departmentName)
                .mentorId(mentorId)
                .mentorName(mentorName)
                .idCardUrl(request.getIdCardUrl())
                .build();

        userRepository.save(newUser);
        log.info("User registered: {} (role={})", email, request.getRole());

        // 5. Send OTP email asynchronously
        notificationService.sendEmailVerificationOtp(email, request.getFullName(), otp);
    }

    // ============================================================
    // SEND / RESEND OTP
    // ============================================================

    @Override
    @Transactional
    public void sendOtp(AuthDtos.OtpRequest request) {
        String email   = request.getEmail().trim().toLowerCase();
        String purpose = request.getPurpose().trim().toUpperCase();
        log.info("OTP request for: {}, purpose: {}", email, purpose);

        if (!PURPOSE_EMAIL.equals(purpose) && !PURPOSE_RESET.equals(purpose)) {
            throw SaptException.badRequest("Invalid OTP purpose. Use EMAIL_VERIFICATION or PASSWORD_RESET");
        }

        // User must exist for both purposes
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> SaptException.notFound("No account found with this email"));

        // Generate and persist the new OTP
        String otp = refreshOtp(user);

        if (PURPOSE_EMAIL.equals(purpose)) {
            notificationService.sendEmailVerificationOtp(email, user.getName(), otp);
        } else {
            notificationService.sendPasswordResetOtp(email, otp);
        }

        log.info("OTP sent to {} for purpose: {}", email, purpose);
    }

    // ============================================================
    // VERIFY OTP
    // ============================================================

    @Override
    @Transactional
    public void verifyOtp(AuthDtos.OtpVerifyRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String otp   = request.getOtp().trim();
        log.info("OTP verification for: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> SaptException.notFound("User not found"));

        // Validate OTP
        validateOtp(user, otp);

        // Clear OTP — this marks the email as verified
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        log.info("OTP verified and email confirmed for: {}", email);
    }

    // ============================================================
    // RESET PASSWORD
    // ============================================================

    @Override
    @Transactional
    public void resetPassword(AuthDtos.PasswordResetRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String otp   = request.getOtp().trim();
        log.info("Password reset attempt for: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> SaptException.notFound("User not found"));

        // Validate OTP
        validateOtp(user, otp);

        // Update password and clear OTP
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        log.info("Password reset successfully for: {}", email);
    }

    // ============================================================
    // LOGOUT
    // ============================================================

    @Override
    public void logout(String token) {
        // JWT is stateless — client must delete the token.
        // For token blacklisting (e.g., Redis), add the token here.
        // Session rows in the `sessions` table can be revoked here if needed.
        log.info("Logout called — client must discard the JWT.");
    }

    // ============================================================
    // PRIVATE HELPERS
    // ============================================================

    /**
     * Generates a new OTP, saves it on the user entity, and returns the OTP value.
     * Replaces any previous unexpired OTP.
     */
    private String refreshOtp(User user) {
        String otp = CommonUtils.generateOtp(OTP_LENGTH);
        user.setOtpCode(otp);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        userRepository.save(user);
        log.debug("OTP refreshed for: {}", user.getEmail());
        return otp;
    }

    /**
     * Validates the OTP stored on the user entity.
     * Throws a SaptException if the OTP is null, wrong, or expired.
     */
    private void validateOtp(User user, String submittedOtp) {
        if (user.getOtpCode() == null) {
            throw SaptException.badRequest("No OTP found. Please request a new one.");
        }
        if (!user.getOtpCode().equals(submittedOtp)) {
            log.warn("Wrong OTP entered for: {}", user.getEmail());
            throw SaptException.badRequest("Invalid OTP. Please check and try again.");
        }
        if (LocalDateTime.now().isAfter(user.getOtpExpiresAt())) {
            log.warn("Expired OTP used for: {}", user.getEmail());
            throw SaptException.badRequest("OTP has expired. Please request a new one.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<AuthDtos.CollegeDto> getAllColleges() {
        return collegeRepository.findByStatus(com.sapt.common.enums.CollegeStatus.ACTIVE).stream()
                .map(c -> new AuthDtos.CollegeDto(c.getId(), c.getName()))
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<String> getDepartmentsByCollegeName(String collegeName) {
        java.util.Optional<com.sapt.collegeadmin.entity.College> collegeOpt = collegeRepository.findByName(collegeName.trim());
        if (collegeOpt.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return departmentRepository.findByCollegeIdAndIsActive(collegeOpt.get().getId(), true).stream()
                .map(com.sapt.collegeadmin.entity.Department::getName)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<AuthDtos.MentorDto> getMentors(String collegeName, String departmentName) {
        java.util.Optional<com.sapt.collegeadmin.entity.College> collegeOpt = collegeRepository.findByName(collegeName.trim());
        if (collegeOpt.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        String collegeId = collegeOpt.get().getId();
        List<User> mentors = userRepository.findByRole(com.sapt.common.enums.UserRole.MENTOR);
        return mentors.stream()
                .filter(m -> m.getCollegeId() != null && m.getCollegeId().equals(collegeId)
                        && m.getDepartmentName() != null && m.getDepartmentName().equalsIgnoreCase(departmentName.trim())
                        && m.getStatus() == com.sapt.common.enums.UserStatus.APPROVED)
                .map(m -> new AuthDtos.MentorDto(m.getId(), m.getName()))
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<com.sapt.auth.entity.User> getUsersByCollegeAndRole(String collegeName, com.sapt.common.enums.UserRole role) {
        return userRepository.findByCollegeNameAndRole(collegeName.trim(), role);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<com.sapt.auth.entity.User> getUsersByMentorId(String mentorId) {
        return userRepository.findByMentorId(mentorId);
    }

    @Override
    @Transactional
    public void updateUserStatus(String userId, com.sapt.common.enums.UserStatus status) {
        com.sapt.auth.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> SaptException.notFound("User not found"));
        user.setStatus(status);
        userRepository.save(user);
        log.info("User status updated for user {}: {}", userId, status);
    }

    @Override
    @Transactional
    public com.sapt.auth.entity.User updateProfile(String userId, com.sapt.auth.dto.ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> SaptException.notFound("User not found"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null) user.setEmail(request.getEmail().trim().toLowerCase());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        
        // Handle avatar / profileImage (save to avatarUrl)
        if (request.getAvatar() != null) {
            user.setAvatarUrl(request.getAvatar());
        } else if (request.getProfileImage() != null) {
            user.setAvatarUrl(request.getProfileImage());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            if (request.getCurrentPassword() != null && !request.getCurrentPassword().isBlank()) {
                if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
                    throw SaptException.badRequest("Current password is incorrect");
                }
            }
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getMentorId() != null) user.setMentorId(request.getMentorId());
        if (request.getMentorName() != null) user.setMentorName(request.getMentorName());

        log.info("User profile updated for user {}: {}", userId, user.getEmail());
        return userRepository.save(user);
    }
}
