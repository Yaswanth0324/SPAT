package com.sapt.systemadmin.service;

import com.sapt.auth.entity.User;
import com.sapt.auth.repository.UserRepository;
import com.sapt.collegeadmin.entity.College;
import com.sapt.collegeadmin.repository.CollegeRepository;
import com.sapt.common.enums.CollegeStatus;
import com.sapt.common.enums.UserRole;
import com.sapt.common.enums.UserStatus;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.sapt.submission.repository.SubmissionRepository;


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
    private final SubmissionRepository submissionRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // Profile
    // ─────────────────────────────────────────────────────────────────────────

    private User findUser(String identifier) {
        if (identifier == null) {
            throw SaptException.badRequest("User identifier cannot be null");
        }
        return userRepository.findByEmail(identifier)
                .orElseGet(() -> userRepository.findById(identifier)
                .orElseThrow(() -> SaptException.notFound("System admin not found: " + identifier)));
    }

    @Override
    public SystemAdminDto.SystemAdminProfile getProfile(String userId) {
        User user = findUser(userId);

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
        User user = findUser(userId);

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
                            .officialEmail(req.getCollegeEmail())
                            .status(CollegeStatus.ACTIVE)
                            .contractStart(LocalDate.now())
                            .contractEnd(LocalDate.now().plusYears(2))
                            .build();
                    log.info("Creating new college: {}", req.getCollegeName());
                    return collegeRepository.save(newCollege);
                });

        // 3. Create User record in `users` table — immediately active & approved.
        //    System Admin has already vetted this admin; credentials are sent via email.
        User collegeAdmin = User.builder()
                .id(UUID.randomUUID().toString())
                .role(UserRole.COLLEGE_ADMIN)
                .name(req.getAdminFullName())
                .email(req.getAdminEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.getAdminPassword()))
                .adminId(req.getAdminEmployeeId())
                .phone(req.getAdminPhone())
                .position("College Administrator")
                .collegeId(college.getId())
                .collegeName(college.getName())
                .status(UserStatus.APPROVED)
                .isActive(true)
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
                    "SPAT - College Admin Registration & Verification", htmlBody);
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
                    .phone(null)
                    .email(col.getOfficialEmail())
                    .website(null)
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
    public SystemAdminDto.CollegeResponse getCollegeById(String collegeId) {
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
                .phone(null)
                .email(col.getOfficialEmail())
                .website(null)
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
    public void updateCollegeStatus(String collegeId, CollegeStatus status) {
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

        int currentYear = LocalDate.now().getYear();

        List<College> allColleges = collegeRepository.findAll();
        List<User> allUsers = userRepository.findAll();
        List<com.sapt.submission.entity.Submission> allSubmissions = submissionRepository.findAll();

        // 1. Monthly Platform Growth (cumulative)
        String[] monthNames = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        List<SystemAdminDto.MonthlyGrowthDto> monthlyGrowth = new java.util.ArrayList<>();

        for (int m = 1; m <= 12; m++) {
            final int month = m;

            long collegeCount = allColleges.stream().filter(c -> {
                LocalDateTime ldt = c.getCreatedAt();
                if (ldt == null) return true; // baseline
                if (ldt.getYear() < currentYear) return true;
                return ldt.getYear() == currentYear && ldt.getMonthValue() <= month;
            }).count();

            long userCount = allUsers.stream().filter(u -> {
                LocalDateTime ldt = u.getCreatedAt();
                if (ldt == null) return true; // baseline
                if (ldt.getYear() < currentYear) return true;
                return ldt.getYear() == currentYear && ldt.getMonthValue() <= month;
            }).count();

            long submissionCount = allSubmissions.stream().filter(s -> {
                LocalDateTime ldt = s.getSubmittedAt();
                if (ldt == null) return true; // baseline
                if (ldt.getYear() < currentYear) return true;
                return ldt.getYear() == currentYear && ldt.getMonthValue() <= month;
            }).count();

            monthlyGrowth.add(SystemAdminDto.MonthlyGrowthDto.builder()
                    .name(monthNames[m - 1])
                    .colleges(collegeCount)
                    .users(userCount)
                    .submissions(submissionCount)
                    .build());
        }

        // 2. Submission Analytics (Approved vs Rejected per Month)
        List<SystemAdminDto.SubmissionAnalyticsDto> submissionAnalytics = new java.util.ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            final int month = m;

            long approvedCount = allSubmissions.stream().filter(s -> {
                LocalDateTime ldt = s.getSubmittedAt();
                if (ldt == null) return false;
                return ldt.getYear() == currentYear && ldt.getMonthValue() == month && s.getStatus() == com.sapt.common.enums.SubmissionStatus.APPROVED;
            }).count();

            long rejectedCount = allSubmissions.stream().filter(s -> {
                LocalDateTime ldt = s.getSubmittedAt();
                if (ldt == null) return false;
                return ldt.getYear() == currentYear && ldt.getMonthValue() == month && s.getStatus() == com.sapt.common.enums.SubmissionStatus.REJECTED;
            }).count();

            submissionAnalytics.add(SystemAdminDto.SubmissionAnalyticsDto.builder()
                    .name(monthNames[m - 1])
                    .approved(approvedCount)
                    .rejected(rejectedCount)
                    .build());
        }

        // 3. College Activity Distribution (Submissions per college)
        java.util.Map<String, String> userToCollegeMap = allUsers.stream()
                .filter(u -> u.getId() != null)
                .collect(Collectors.toMap(User::getId, u -> u.getCollegeName() != null ? u.getCollegeName() : "Unknown", (v1, v2) -> v1));

        java.util.Map<String, Long> collegeSubmissionsCount = allSubmissions.stream()
                .map(s -> userToCollegeMap.getOrDefault(s.getStudentId(), "Unknown"))
                .collect(Collectors.groupingBy(name -> name, Collectors.counting()));

        String[] colors = {"#ea580c", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4"};
        List<SystemAdminDto.CollegeActivityDto> collegeActivity = new java.util.ArrayList<>();
        int colorIdx = 0;
        for (java.util.Map.Entry<String, Long> entry : collegeSubmissionsCount.entrySet()) {
            if ("Unknown".equals(entry.getKey())) continue;
            collegeActivity.add(SystemAdminDto.CollegeActivityDto.builder()
                    .name(entry.getKey())
                    .value(entry.getValue())
                    .color(colors[colorIdx % colors.length])
                    .build());
            colorIdx++;
        }

        // 4. College Performance Comparison
        java.util.Map<String, List<User>> studentsByCollege = allUsers.stream()
                .filter(u -> u.getRole() == UserRole.STUDENT && u.getCollegeName() != null)
                .collect(Collectors.groupingBy(User::getCollegeName));

        java.util.Map<String, List<com.sapt.submission.entity.Submission>> submissionsByCollege = allSubmissions.stream()
                .filter(s -> s.getStudentId() != null && userToCollegeMap.containsKey(s.getStudentId()))
                .collect(Collectors.groupingBy(s -> userToCollegeMap.get(s.getStudentId())));

        List<SystemAdminDto.CollegePerformanceDto> collegePerformance = new java.util.ArrayList<>();
        for (String collegeName : allColleges.stream().map(College::getName).collect(Collectors.toSet())) {
            List<User> students = studentsByCollege.getOrDefault(collegeName, java.util.Collections.emptyList());
            List<com.sapt.submission.entity.Submission> submissions = submissionsByCollege.getOrDefault(collegeName, java.util.Collections.emptyList());

            long creditsSum = submissions.stream()
                    .filter(s -> s.getStatus() == com.sapt.common.enums.SubmissionStatus.APPROVED)
                    .mapToLong(com.sapt.submission.entity.Submission::getAwardedCredits)
                    .sum();

            collegePerformance.add(SystemAdminDto.CollegePerformanceDto.builder()
                    .name(collegeName)
                    .credits(creditsSum)
                    .submissions((long) submissions.size())
                    .students((long) students.size())
                    .build());
        }

        return SystemAdminDto.SystemStatsResponse.builder()
                .totalColleges(totalColleges)
                .activeColleges(activeColleges)
                .inactiveColleges(inactiveColleges)
                .suspendedColleges(suspended)
                .totalCollegeAdmins(totalAdmins)
                .totalUsers(totalUsers)
                .monthlyGrowth(monthlyGrowth)
                .submissionAnalytics(submissionAnalytics)
                .collegeActivity(collegeActivity)
                .collegePerformance(collegePerformance)
                .build();
    }
}
