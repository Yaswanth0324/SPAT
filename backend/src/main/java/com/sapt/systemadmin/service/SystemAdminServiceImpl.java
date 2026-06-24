package com.sapt.systemadmin.service;

import com.sapt.auth.entity.User;
import com.sapt.auth.repository.UserRepository;
import com.sapt.collegeadmin.entity.College;
import com.sapt.collegeadmin.repository.CollegeRepository;
import com.sapt.common.enums.CollegeStatus;
import com.sapt.common.enums.UserRole;
import com.sapt.common.exception.SaptException;
import com.sapt.notification.mail.MailService;
import com.sapt.notification.templates.MailTemplates;
import com.sapt.systemadmin.dto.SystemAdminDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * SystemAdminServiceImpl - Full implementation of System Admin business logic.
 * Uses the unified `users` table via UserRepository.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SystemAdminServiceImpl implements SystemAdminService {

    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    // ─────────────────────────────────────────────────────────────────────────
    // Profile
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public SystemAdminDto.SystemAdminProfile getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> SaptException.notFound("System admin not found"));

        return SystemAdminDto.SystemAdminProfile.builder()
                .id(user.getId())
                .fullName(user.getName())
                .employeeId(user.getAdminId())
                .email(user.getEmail())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    @Override
    @Transactional
    public SystemAdminDto.SystemAdminProfile updateProfile(String userId, SystemAdminDto.UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> SaptException.notFound("System admin not found"));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setName(request.getFullName().trim());
        }

        user.setAvatarUrl(request.getAvatarUrl());

        User saved = userRepository.save(user);

        return SystemAdminDto.SystemAdminProfile.builder()
                .id(saved.getId())
                .fullName(saved.getName())
                .employeeId(saved.getAdminId())
                .email(saved.getEmail())
                .active(saved.isActive())
                .createdAt(saved.getCreatedAt())
                .avatarUrl(saved.getAvatarUrl())
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Create College + College Admin
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void createCollegeAdmin(SystemAdminDto.CreateCollegeAdminRequest req, String createdByUserId) {

        // 1. Validate: email must not already exist
        if (userRepository.existsByEmail(req.getAdminEmail())) {
            throw SaptException.conflict("Email already registered: " + req.getAdminEmail());
        }

        // 2. Find or create College
        College college = collegeRepository.findByName(req.getCollegeName().trim())
                .orElseGet(() -> {
                    College newCollege = College.builder()
                            .name(req.getCollegeName().trim())
                            .address(req.getCollegeAddress())
                            .state(req.getCollegeState())
                            .phone(req.getCollegePhone())
                            .email(req.getCollegeEmail())
                            .website(req.getCollegeWebsite())
                            .status(CollegeStatus.ACTIVE)
                            .contractStart(LocalDate.now())
                            .contractEnd(LocalDate.now().plusYears(2))
                            .build();
                    log.info("Creating new college: {}", req.getCollegeName());
                    return collegeRepository.save(newCollege);
                });

        // 3. Create User record in `users` table (unverified/inactive)
        User collegeAdmin = User.builder()
                .id(UUID.randomUUID().toString())
                .role(UserRole.COLLEGE_ADMIN)
                .name(req.getAdminFullName())
                .email(req.getAdminEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.getAdminPassword()))
                .adminId(req.getAdminEmployeeId())
                .phone(req.getAdminPhone())
                .position("College Administrator")
                .collegeId(college.getId() != null ? String.valueOf(college.getId()) : null)
                .collegeName(college.getName())
                .status("PENDING")
                .isActive(false)
                .emailVerified(false)
                .build();
        collegeAdmin = userRepository.save(collegeAdmin);
        log.info("Created unverified college admin in users table: id={}, email={}", collegeAdmin.getId(), collegeAdmin.getEmail());

        // 4. Send credential + verification email
        try {
            String verifyLink = "http://localhost:8080/api/auth/verify?email="
                    + java.net.URLEncoder.encode(req.getAdminEmail().trim(), "UTF-8");
            String htmlBody = MailTemplates.buildCollegeAdminWelcomeEmail(
                    req.getAdminFullName(),
                    req.getAdminEmail().trim(),
                    req.getAdminPassword(),
                    req.getAdminEmployeeId(),
                    verifyLink
            );
            mailService.sendHtmlMail(req.getAdminEmail().trim(),
                    "SAPT - College Admin Registration & Verification", htmlBody);
            log.info("Verification email sent to: {}", req.getAdminEmail());
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", req.getAdminEmail(), e.getMessage());
            throw new RuntimeException("Failed to send verification email: " + e.getMessage(), e);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Get All Colleges
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public List<SystemAdminDto.CollegeResponse> getAllColleges() {
        List<College> colleges = collegeRepository.findAll();

        // Map collegeName → primary college admin User (from users table)
        List<User> allCollegeAdmins = userRepository.findByRole(UserRole.COLLEGE_ADMIN);

        return colleges.stream().map(col -> {
            // Find the first college admin whose collegeName matches
            User primaryAdmin = allCollegeAdmins.stream()
                    .filter(u -> col.getName().equalsIgnoreCase(u.getCollegeName()))
                    .findFirst()
                    .orElse(null);

            long totalAdmins = allCollegeAdmins.stream()
                    .filter(u -> col.getName().equalsIgnoreCase(u.getCollegeName()))
                    .count();

            return SystemAdminDto.CollegeResponse.builder()
                    .id(col.getId())
                    .name(col.getName())
                    .address(col.getAddress())
                    .state(col.getState())
                    .phone(col.getPhone())
                    .email(col.getEmail())
                    .website(col.getWebsite())
                    .status(col.getStatus())
                    .contractStart(col.getContractStart())
                    .contractEnd(col.getContractEnd())
                    .createdAt(col.getCreatedAt())
                    .adminName(primaryAdmin != null ? primaryAdmin.getName() : null)
                    .adminEmail(primaryAdmin != null ? primaryAdmin.getEmail() : null)
                    .adminPhone(primaryAdmin != null ? primaryAdmin.getPhone() : null)
                    .totalAdmins(totalAdmins)
                    .build();
        }).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Get Single College
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public SystemAdminDto.CollegeResponse getCollegeById(Long collegeId) {
        College col = collegeRepository.findById(collegeId)
                .orElseThrow(() -> SaptException.notFound("College not found with id: " + collegeId));

        List<User> admins = userRepository.findByRole(UserRole.COLLEGE_ADMIN).stream()
                .filter(u -> col.getName().equalsIgnoreCase(u.getCollegeName()))
                .collect(Collectors.toList());
        User primaryAdmin = admins.isEmpty() ? null : admins.get(0);

        return SystemAdminDto.CollegeResponse.builder()
                .id(col.getId())
                .name(col.getName())
                .address(col.getAddress())
                .state(col.getState())
                .phone(col.getPhone())
                .email(col.getEmail())
                .website(col.getWebsite())
                .status(col.getStatus())
                .contractStart(col.getContractStart())
                .contractEnd(col.getContractEnd())
                .createdAt(col.getCreatedAt())
                .adminName(primaryAdmin != null ? primaryAdmin.getName() : null)
                .adminEmail(primaryAdmin != null ? primaryAdmin.getEmail() : null)
                .adminPhone(primaryAdmin != null ? primaryAdmin.getPhone() : null)
                .totalAdmins(admins.size())
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Update College Status
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void updateCollegeStatus(Long collegeId, CollegeStatus status) {
        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> SaptException.notFound("College not found with id: " + collegeId));
        college.setStatus(status);
        collegeRepository.save(college);
        log.info("College '{}' status updated to {}", college.getName(), status);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Get All College Admins
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public List<SystemAdminDto.CollegeAdminResponse> getAllCollegeAdmins() {
        return userRepository.findByRole(UserRole.COLLEGE_ADMIN).stream()
                .map(u -> SystemAdminDto.CollegeAdminResponse.builder()
                        .id(u.getId())
                        .fullName(u.getName())
                        .employeeId(u.getAdminId())
                        .email(u.getEmail())
                        .phone(u.getPhone())
                        .collegeName(u.getCollegeName())
                        .active(u.isActive())
                        .createdAt(u.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // System Stats
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public SystemAdminDto.SystemStatsResponse getSystemStats() {
        long totalColleges    = collegeRepository.count();
        long activeColleges   = collegeRepository.countByStatus(CollegeStatus.ACTIVE);
        long inactiveColleges = collegeRepository.countByStatus(CollegeStatus.INACTIVE);
        long suspended        = collegeRepository.countByStatus(CollegeStatus.SUSPENDED);
        long totalAdmins      = userRepository.findByRole(UserRole.COLLEGE_ADMIN).size();
        long totalUsers       = userRepository.count();

        return SystemAdminDto.SystemStatsResponse.builder()
                .totalColleges(totalColleges)
                .activeColleges(activeColleges)
                .inactiveColleges(inactiveColleges)
                .suspendedColleges(suspended)
                .totalCollegeAdmins(totalAdmins)
                .totalUsers(totalUsers)
                .build();
    }
}
