package com.sapt.collegeadmin.service;

import com.sapt.auth.entity.User;
import com.sapt.auth.repository.UserRepository;
import com.sapt.collegeadmin.dto.CollegeAdminDto;
import com.sapt.collegeadmin.entity.College;
import com.sapt.collegeadmin.entity.Department;
import com.sapt.collegeadmin.repository.CollegeRepository;
import com.sapt.collegeadmin.repository.DepartmentRepository;
import com.sapt.common.enums.SubmissionStatus;
import com.sapt.common.enums.UserRole;
import com.sapt.common.enums.UserStatus;
import com.sapt.common.exception.SaptException;
import com.sapt.submission.entity.Submission;
import com.sapt.submission.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ============================================================
 * CollegeAdminServiceImpl — College Admin Business Logic
 * ============================================================
 * All operations are scoped to the admin's college (derived
 * from the authenticated user's collegeId field).
 *
 * Data sources:
 *   - users          → UserRepository (all roles in one table)
 *   - colleges       → CollegeRepository
 *   - departments    → DepartmentRepository
 *   - submissions    → SubmissionRepository
 * ============================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CollegeAdminServiceImpl implements CollegeAdminService {

    private final UserRepository       userRepository;
    private final CollegeRepository    collegeRepository;
    private final DepartmentRepository departmentRepository;
    private final SubmissionRepository submissionRepository;

    // ================================================================
    // PROFILE
    // ================================================================

    @Override
    @Transactional(readOnly = true)
    public CollegeAdminDto.CollegeAdminProfile getProfile(String authUserId) {
        log.info("CollegeAdmin getProfile: userId={}", authUserId);
        User user = findUser(authUserId);
        College college = null;
        if (user.getCollegeId() != null && !user.getCollegeId().isBlank()) {
            college = collegeRepository.findById(user.getCollegeId()).orElse(null);
        }
        return mapToProfile(user, college);
    }

    @Override
    @Transactional
    public CollegeAdminDto.CollegeAdminProfile updateProfile(String authUserId, CollegeAdminDto.UpdateProfileRequest request) {
        log.info("CollegeAdmin updateProfile: userId={}", authUserId);
        User user = findUser(authUserId);

        if (request.getName()      != null) user.setName(request.getName());
        if (request.getPhone()     != null) user.setPhone(request.getPhone());
        if (request.getPosition()  != null) user.setPosition(request.getPosition());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());

        User saved = userRepository.save(user);
        log.info("CollegeAdmin profile updated: userId={}", authUserId);

        College college = null;
        if (saved.getCollegeId() != null && !saved.getCollegeId().isBlank()) {
            college = collegeRepository.findById(saved.getCollegeId()).orElse(null);
        }
        return mapToProfile(saved, college);
    }

    @Override
    @Transactional
    public CollegeAdminDto.CollegeAdminProfile updateCollegeDetails(String authUserId, CollegeAdminDto.UpdateCollegeRequest request) {
        log.info("CollegeAdmin updateCollegeDetails: userId={}", authUserId);
        User admin = findUser(authUserId);
        String collegeId = requireCollegeId(admin);

        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> SaptException.notFound("College not found"));

        if (request.getAddress()       != null) college.setAddress(request.getAddress());
        if (request.getOfficialEmail() != null) college.setOfficialEmail(request.getOfficialEmail());

        College savedCollege = collegeRepository.save(college);
        log.info("CollegeAdmin college details updated: collegeId={}", collegeId);
        return mapToProfile(admin, savedCollege);
    }

    // ================================================================
    // DASHBOARD STATS
    // ================================================================

    @Override
    @Transactional(readOnly = true)
    public CollegeAdminDto.CollegeStatsResponse getDashboardStats(String authUserId) {
        log.info("CollegeAdmin getDashboardStats: userId={}", authUserId);

        User admin = findUser(authUserId);
        String collegeId = requireCollegeId(admin);

        // ── 1. College info ───────────────────────────────────────────
        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> SaptException.notFound("College not found"));

        // ── 2. All users in this college ─────────────────────────────
        List<User> collegeUsers = userRepository.findByCollegeId(collegeId);

        List<User> students = filterByRole(collegeUsers, UserRole.STUDENT);
        List<User> mentors  = filterByRole(collegeUsers, UserRole.MENTOR);
        List<User> hods     = filterByRole(collegeUsers, UserRole.HOD);

        int activeUsers   = (int) collegeUsers.stream()
                .filter(u -> u.getStatus() == UserStatus.APPROVED && u.isActive()).count();
        int inactiveUsers = (int) collegeUsers.stream()
                .filter(u -> u.getStatus() == UserStatus.PENDING
                          || u.getStatus() == UserStatus.REJECTED
                          || !u.isActive()).count();

        // ── 3. Departments ────────────────────────────────────────────
        List<Department> departments = departmentRepository.findByCollegeId(collegeId);

        // ── 4. Submissions for this college's students ────────────────
        List<String> studentIds = students.stream().map(User::getId).collect(Collectors.toList());
        List<Submission> submissions = studentIds.isEmpty()
                ? Collections.emptyList()
                : submissionRepository.findByStudentIdIn(studentIds);

        List<Submission> approved = filterByStatus(submissions, SubmissionStatus.APPROVED);
        List<Submission> rejected = filterByStatus(submissions, SubmissionStatus.REJECTED);
        List<Submission> pending  = filterByStatus(submissions, SubmissionStatus.PENDING);

        // ── 5. Placement factors ──────────────────────────────────────
        CollegeAdminDto.PlacementFactors placementFactors = buildPlacementFactors(submissions);

        // ── 6. Top 3 student performers ───────────────────────────────
        Map<String, Integer> creditByStudent = new HashMap<>();
        for (User s : students) {
            List<Submission> studentSubs = submissions.stream()
                    .filter(sub -> sub.getStudentId().equals(s.getId()))
                    .collect(Collectors.toList());
            int approvedSum = studentSubs.stream()
                    .filter(sub -> sub.getStatus() == SubmissionStatus.APPROVED)
                    .mapToInt(Submission::getAwardedCredits).sum();
            int penaltySum = studentSubs.stream()
                    .filter(sub -> sub.getStatus() == SubmissionStatus.REJECTED)
                    .mapToInt(sub -> sub.getCreditPenalty() > 0 ? sub.getCreditPenalty() : (int) Math.ceil(sub.getSuggestedCredits() * 0.10)).sum();
            creditByStudent.put(s.getId(), Math.max(0, approvedSum - penaltySum));
        }

        List<CollegeAdminDto.StudentPerformance> topStudents = students.stream()
                .map(s -> CollegeAdminDto.StudentPerformance.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .email(s.getEmail())
                        .department(s.getDepartmentName())
                        .rollNo(s.getRollNo())
                        .avatarUrl(s.getAvatarUrl())
                        .totalCredits(creditByStudent.getOrDefault(s.getId(), 0))
                        .approvedSubmissions((int) approved.stream()
                                .filter(sub -> sub.getStudentId().equals(s.getId())).count())
                        .build())
                .sorted(Comparator.comparingInt(CollegeAdminDto.StudentPerformance::getTotalCredits).reversed())
                .limit(3)
                .collect(Collectors.toList());

        // ── 7. Mentor performances ────────────────────────────────────
        List<CollegeAdminDto.MentorPerformance> mentorPerformances = mentors.stream()
                .map(m -> {
                    List<Submission> mentorSubs = submissions.stream()
                            .filter(s -> m.getId().equals(s.getMentorId()))
                            .collect(Collectors.toList());
                    int approvedCount   = (int) mentorSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.APPROVED).count();
                    int processedCount  = (int) mentorSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.APPROVED
                                                                             || s.getStatus() == SubmissionStatus.REJECTED).count();
                    int successRate     = processedCount > 0 ? Math.round((approvedCount * 100f) / processedCount) : 0;
                    int creditsGuided   = mentorSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.APPROVED)
                                                   .mapToInt(Submission::getAwardedCredits).sum();
                    int penaltiesGuided = mentorSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.REJECTED)
                                                   .mapToInt(s -> s.getCreditPenalty() > 0 ? s.getCreditPenalty() : (int) Math.ceil(s.getSuggestedCredits() * 0.10)).sum();
                    int netCreditsGuided = Math.max(0, creditsGuided - penaltiesGuided);
                    return CollegeAdminDto.MentorPerformance.builder()
                            .id(m.getId())
                            .name(m.getName())
                            .department(m.getDepartmentName())
                            .avatarUrl(m.getAvatarUrl())
                            .successRate(successRate)
                            .approvedCount(approvedCount)
                            .totalCreditsGuided(netCreditsGuided)
                            .build();
                })
                .sorted(Comparator.comparingInt(CollegeAdminDto.MentorPerformance::getSuccessRate).reversed()
                        .thenComparingInt(CollegeAdminDto.MentorPerformance::getTotalCreditsGuided).reversed())
                .collect(Collectors.toList());

        // ── 8. Department chart data ──────────────────────────────────
        Set<String> studentIdSet = new HashSet<>(studentIds);
        List<CollegeAdminDto.DepartmentChartEntry> deptChart = departments.stream()
                .map(dept -> {
                    List<String> deptStudentIds = students.stream()
                            .filter(s -> dept.getId().equals(s.getDepartmentId()))
                            .map(User::getId)
                            .collect(Collectors.toList());
                    int approvedCredits = approved.stream()
                            .filter(s -> deptStudentIds.contains(s.getStudentId()))
                            .mapToInt(Submission::getAwardedCredits).sum();
                    int penaltyCredits = rejected.stream()
                            .filter(s -> deptStudentIds.contains(s.getStudentId()))
                            .mapToInt(s -> s.getCreditPenalty() > 0 ? s.getCreditPenalty() : (int) Math.ceil(s.getSuggestedCredits() * 0.10)).sum();
                    int netCredits = Math.max(0, approvedCredits - penaltyCredits);
                    // Abbreviation: first letter of each word
                    String abbr = Arrays.stream(dept.getName().split("\\s+"))
                            .filter(w -> !w.isEmpty())
                            .map(w -> String.valueOf(w.charAt(0)).toUpperCase())
                            .collect(Collectors.joining());
                    return CollegeAdminDto.DepartmentChartEntry.builder()
                            .name(abbr)
                            .fullName(dept.getName())
                            .students(deptStudentIds.size())
                            .credits(netCredits)
                            .build();
                })
                .collect(Collectors.toList());

        // ── 9. Category chart data (pie chart) ────────────────────────
        Map<String, Long> categoryCounts = submissions.stream()
                .filter(s -> s.getCategoryName() != null)
                .collect(Collectors.groupingBy(Submission::getCategoryName, Collectors.counting()));

        List<CollegeAdminDto.CategoryChartEntry> categoryChart = categoryCounts.entrySet().stream()
                .map(e -> new CollegeAdminDto.CategoryChartEntry(e.getKey(), e.getValue().intValue()))
                .sorted(Comparator.comparingInt(CollegeAdminDto.CategoryChartEntry::getValue).reversed())
                .collect(Collectors.toList());

        // ── 10. Monthly trend data ────────────────────────────────────
        List<CollegeAdminDto.MonthlyTrendEntry> monthlyTrends = new ArrayList<>();
        for (Month month : Month.values()) {
            int m = month.getValue();
            long appCount = approved.stream().filter(s -> s.getSubmittedAt() != null
                    && s.getSubmittedAt().getMonthValue() == m).count();
            long rejCount = rejected.stream().filter(s -> s.getSubmittedAt() != null
                    && s.getSubmittedAt().getMonthValue() == m).count();
            long penCount = pending.stream().filter(s -> s.getSubmittedAt() != null
                    && s.getSubmittedAt().getMonthValue() == m).count();
            monthlyTrends.add(CollegeAdminDto.MonthlyTrendEntry.builder()
                    .month(month.getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .approved((int) appCount)
                    .rejected((int) rejCount)
                    .pending((int) penCount)
                    .build());
        }

        // ── 11. Recent submissions (last 5, sorted by submittedAt desc)
        List<CollegeAdminDto.RecentSubmission> recentSubmissions = submissions.stream()
                .filter(s -> s.getSubmittedAt() != null)
                .sorted((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()))
                .limit(5)
                .map(s -> CollegeAdminDto.RecentSubmission.builder()
                        .id(s.getId())
                        .studentName(s.getStudentName())
                        .title(s.getTitle())
                        .type(s.getCategoryName())
                        .credits(s.getAwardedCredits())
                        .date(s.getSubmittedAt().toLocalDate().toString())
                        .status(s.getStatus().name().toLowerCase())
                        .build())
                .collect(Collectors.toList());

        return CollegeAdminDto.CollegeStatsResponse.builder()
                .totalDepartments(departments.size())
                .totalUsers(collegeUsers.size())
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .hodCount(hods.size())
                .mentorCount(mentors.size())
                .studentCount(students.size())
                .totalSubmissions(submissions.size())
                .totalApprovals(approved.size())
                .totalRejections(rejected.size())
                .pendingSubmissions(pending.size())
                .studentActivities(submissions.size())
                .topStudents(topStudents)
                .mentorPerformances(mentorPerformances)
                .departmentChart(deptChart)
                .categoryChart(categoryChart)
                .monthlyTrends(monthlyTrends)
                .placementFactors(placementFactors)
                .recentSubmissions(recentSubmissions)
                .college(CollegeAdminDto.CollegeInfo.builder()
                        .id(college.getId())
                        .name(college.getName())
                        .status(college.getStatus().name())
                        .contractStart(college.getContractStart())
                        .contractEnd(college.getContractEnd())
                        .build())
                .build();
    }

    // ================================================================
    // DEPARTMENTS
    // ================================================================

    @Override
    @Transactional(readOnly = true)
    public List<CollegeAdminDto.DepartmentSummary> getDepartments(String authUserId) {
        log.info("CollegeAdmin getDepartments: userId={}", authUserId);

        User admin = findUser(authUserId);
        String collegeId = requireCollegeId(admin);

        List<User> collegeUsers  = userRepository.findByCollegeId(collegeId);
        List<User> students      = filterByRole(collegeUsers, UserRole.STUDENT);
        List<User> mentors       = filterByRole(collegeUsers, UserRole.MENTOR);
        List<User> hods          = filterByRole(collegeUsers, UserRole.HOD);
        List<Department> depts   = departmentRepository.findByCollegeId(collegeId);

        List<String> studentIds = students.stream().map(User::getId).collect(Collectors.toList());
        List<Submission> submissions = studentIds.isEmpty()
                ? Collections.emptyList()
                : submissionRepository.findByStudentIdIn(studentIds);

        return depts.stream().map(dept -> {
            // HOD assigned to this department
            User hod = hods.stream()
                    .filter(h -> dept.getId().equals(h.getDepartmentId())
                              && h.getStatus() == UserStatus.APPROVED)
                    .findFirst().orElse(null);

            List<String> deptStudentIds = students.stream()
                    .filter(s -> dept.getId().equals(s.getDepartmentId()))
                    .map(User::getId)
                    .collect(Collectors.toList());

            int mentorCount = (int) mentors.stream()
                    .filter(m -> dept.getId().equals(m.getDepartmentId())).count();

            List<Submission> deptSubs = submissions.stream()
                    .filter(s -> deptStudentIds.contains(s.getStudentId()))
                    .collect(Collectors.toList());

            return CollegeAdminDto.DepartmentSummary.builder()
                    .id(dept.getId())
                    .name(dept.getName())
                    .active(dept.isActive())
                    .hod(hod != null ? mapToUserSummary(hod) : null)
                    .mentorCount(mentorCount)
                    .studentCount(deptStudentIds.size())
                    .totalActivities(deptSubs.size())
                    .approvedCount((int) deptSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.APPROVED).count())
                    .rejectedCount((int) deptSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.REJECTED).count())
                    .pendingCount((int) deptSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.PENDING).count())
                    .build();
        }).collect(Collectors.toList());
    }

    // ================================================================
    // USERS BY ROLE
    // ================================================================

    @Override
    @Transactional(readOnly = true)
    public List<CollegeAdminDto.UserSummary> getUsersByRole(String authUserId, UserRole role) {
        log.info("CollegeAdmin getUsersByRole: userId={}, role={}", authUserId, role);

        User admin = findUser(authUserId);
        String collegeId = requireCollegeId(admin);

        return userRepository.findByCollegeIdAndRole(collegeId, role).stream()
                .map(this::mapToUserSummary)
                .collect(Collectors.toList());
    }

    // ================================================================
    // PRIVATE HELPERS
    // ================================================================

    private User findUser(String identifier) {
        if (identifier == null) {
            throw SaptException.badRequest("User identifier cannot be null");
        }
        return userRepository.findByEmail(identifier)
                .orElseGet(() -> userRepository.findById(identifier)
                .orElseThrow(() -> SaptException.notFound("User not found: " + identifier)));
    }

    private String requireCollegeId(User user) {
        if (user.getCollegeId() == null || user.getCollegeId().isBlank()) {
            throw SaptException.badRequest("College Admin is not assigned to a college");
        }
        return user.getCollegeId();
    }

    private List<User> filterByRole(List<User> users, UserRole role) {
        return users.stream().filter(u -> role == u.getRole()).collect(Collectors.toList());
    }

    private List<Submission> filterByStatus(List<Submission> submissions, SubmissionStatus status) {
        return submissions.stream().filter(s -> status == s.getStatus()).collect(Collectors.toList());
    }

    private CollegeAdminDto.CollegeAdminProfile mapToProfile(User user, College college) {
        return CollegeAdminDto.CollegeAdminProfile.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .position(user.getPosition())
                .avatarUrl(user.getAvatarUrl())
                .adminId(user.getAdminId())
                .collegeId(user.getCollegeId())
                .collegeName(user.getCollegeName())
                .collegeAddress(college != null ? college.getAddress() : null)
                .collegeOfficialEmail(college != null ? college.getOfficialEmail() : null)
                .role(user.getRole())
                .status(user.getStatus())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private CollegeAdminDto.UserSummary mapToUserSummary(User user) {
        return CollegeAdminDto.UserSummary.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .position(user.getPosition())
                .avatarUrl(user.getAvatarUrl())
                .adminId(user.getAdminId())
                .rollNo(user.getRollNo())
                .role(user.getRole())
                .status(user.getStatus())
                .collegeId(user.getCollegeId())
                .collegeName(user.getCollegeName())
                .departmentId(user.getDepartmentId())
                .departmentName(user.getDepartmentName())
                .mentorId(user.getMentorId())
                .mentorName(user.getMentorName())
                .hodId(user.getHodId())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    /**
     * Computes placement readiness factors from submission list.
     * Category names match the frontend's mockData.js activity types.
     */
    private CollegeAdminDto.PlacementFactors buildPlacementFactors(List<Submission> submissions) {
        List<Submission> approved = filterByStatus(submissions, SubmissionStatus.APPROVED);

        int hackathons = (int) submissions.stream()
                .filter(s -> containsIgnoreCase(s.getCategoryName(), "Hackathon")).count();
        int hackathonWins = (int) approved.stream()
                .filter(s -> containsIgnoreCase(s.getCategoryName(), "Hackathon")
                          && containsIgnoreCase(s.getAchievementType(), "winner")).count();
        int certifications = (int) approved.stream()
                .filter(s -> containsIgnoreCase(s.getCategoryName(), "Certif")).count();
        int internships = (int) approved.stream()
                .filter(s -> containsIgnoreCase(s.getCategoryName(), "Internship")).count();
        int projects = (int) approved.stream()
                .filter(s -> containsIgnoreCase(s.getCategoryName(), "Project")).count();
        int placementPrep = (int) approved.stream()
                .filter(s -> containsIgnoreCase(s.getCategoryName(), "Placement")).count();
        int research = (int) approved.stream()
                .filter(s -> containsIgnoreCase(s.getCategoryName(), "Research")).count();
        int ppo = (int) approved.stream()
                .filter(s -> containsIgnoreCase(s.getCategoryName(), "Internship")
                          && containsIgnoreCase(s.getAchievementType(), "ppo")).count();
        int openSource = (int) approved.stream()
                .filter(s -> containsIgnoreCase(s.getCategoryName(), "Open Source")).count();
        int exams = (int) approved.stream()
                .filter(s -> containsIgnoreCase(s.getCategoryName(), "Competitive Exam")).count();
        int academic = (int) approved.stream()
                .filter(s -> containsIgnoreCase(s.getCategoryName(), "Academic")
                          && (containsIgnoreCase(s.getAchievementType(), "topper")
                           || containsIgnoreCase(s.getAchievementType(), "rank")
                           || containsIgnoreCase(s.getAchievementType(), "9."))).count();
        int startup = (int) approved.stream()
                .filter(s -> containsIgnoreCase(s.getCategoryName(), "Freelanc")
                          || containsIgnoreCase(s.getCategoryName(), "Startup")).count();

        return CollegeAdminDto.PlacementFactors.builder()
                .hackathonsCount(hackathons)
                .hackathonWins(hackathonWins)
                .certificationsCount(certifications)
                .internshipsCount(internships)
                .projectsCount(projects)
                .placementPrepCount(placementPrep)
                .researchCount(research)
                .ppoCount(ppo)
                .openSourceCount(openSource)
                .examsCount(exams)
                .academicExcellenceCount(academic)
                .startupFreelanceCount(startup)
                .build();
    }

    private boolean containsIgnoreCase(String source, String fragment) {
        if (source == null || fragment == null) return false;
        return source.toLowerCase(Locale.ROOT).contains(fragment.toLowerCase(Locale.ROOT));
    }
}
