package com.sapt.hod.service;

import com.sapt.auth.entity.User;
import com.sapt.auth.repository.UserRepository;
import com.sapt.common.enums.SubmissionStatus;
import com.sapt.common.enums.UserRole;
import com.sapt.common.enums.UserStatus;
import com.sapt.common.exception.SaptException;
import com.sapt.hod.dto.HodDto;
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
 * HodServiceImpl — HOD Business Logic
 * ============================================================
 * All queries are scoped to the HOD's departmentId.
 * Data sources:
 *   - users       → UserRepository (unified users table)
 *   - submissions → SubmissionRepository
 *
 * Category/type classification mirrors the frontend's logic in
 * HODDashboard.jsx so the numbers match exactly.
 * ============================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HodServiceImpl implements HodService {

    private final UserRepository       userRepository;
    private final SubmissionRepository submissionRepository;

    // =====================================================================
    // DASHBOARD STATS
    // =====================================================================

    @Override
    @Transactional(readOnly = true)
    public HodDto.DeptStatsResponse getDashboardStats(String authUserId) {
        log.info("HOD getDashboardStats: userId={}", authUserId);

        User hod = findUser(authUserId);
        String deptId = requireDepartmentId(hod);

        // ── 1. All users in HOD's department ─────────────────────────────
        List<User> deptUsers = userRepository.findByDepartmentId(deptId);

        List<User> mentors = filterByRoleAndStatus(deptUsers, UserRole.MENTOR, UserStatus.APPROVED);
        List<User> students = filterByRoleAndStatus(deptUsers, UserRole.STUDENT, UserStatus.APPROVED);

        // ── 2. All submissions for dept students ──────────────────────────
        List<String> studentIds = students.stream().map(User::getId).collect(Collectors.toList());
        List<Submission> allSubs = studentIds.isEmpty()
                ? Collections.emptyList()
                : submissionRepository.findByStudentIdIn(studentIds);

        List<Submission> approved = filterByStatus(allSubs, SubmissionStatus.APPROVED);

        // ── 3. Placement factor tallies ───────────────────────────────────
        int hackWon        = 0;
        int hackParticipated = 0;
        int courses        = 0;
        int internships    = 0;

        for (Submission sub : approved) {
            String cat = sub.getCategoryName() == null ? "" : sub.getCategoryName();
            String ach = sub.getAchievementType() == null ? "" : sub.getAchievementType().toLowerCase();

            if (isHackathonType(cat)) {
                if (ach.contains("winner") || ach.contains("finalist")
                        || ach.contains("rank") || ach.contains("1st")) {
                    hackWon++;
                } else {
                    hackParticipated++;
                }
            } else if (isCourseType(cat)) {
                courses++;
            } else if (isInternshipType(cat)) {
                internships++;
            }
        }

        // ── 4. Bar-chart factor counts ────────────────────────────────────
        Map<String, Integer> factorCounts = new LinkedHashMap<>();
        factorCounts.put("Hackathons",     (int) approved.stream().filter(s -> isHackathonType(s.getCategoryName())).count());
        factorCounts.put("Certifications", (int) approved.stream().filter(s -> isCourseType(s.getCategoryName())).count());
        factorCounts.put("Internships",    (int) approved.stream().filter(s -> isInternshipType(s.getCategoryName())).count());
        factorCounts.put("Projects",       (int) approved.stream().filter(s -> isProjectType(s.getCategoryName())).count());
        factorCounts.put("Publications",   (int) approved.stream().filter(s -> isPublicationType(s.getCategoryName())).count());

        // ── 5. Monthly skill trend (Jan – Dec) ───────────────────────────
        List<HodDto.SkillTrendEntry> skillTrend = buildMonthlyTrend(approved);

        // ── 6. Student performance (credits, stars, badge, factors) ──────
        Map<String, Integer> creditByStudent = approved.stream()
                .collect(Collectors.groupingBy(Submission::getStudentId,
                         Collectors.summingInt(Submission::getAwardedCredits)));

        List<HodDto.StudentPerformance> studentPerformances = students.stream()
                .map(s -> {
                    List<Submission> sSubs = approved.stream()
                            .filter(sub -> sub.getStudentId().equals(s.getId()))
                            .collect(Collectors.toList());
                    int credits = creditByStudent.getOrDefault(s.getId(), 0);
                    int stars   = computeStars(credits);
                    return HodDto.StudentPerformance.builder()
                            .id(s.getId())
                            .name(s.getName())
                            .email(s.getEmail())
                            .avatarUrl(s.getAvatarUrl())
                            .rollNo(s.getRollNo())
                            .department(s.getDepartmentName())
                            .credits(credits)
                            .activitiesCount(sSubs.size())
                            .starsCount(stars)
                            .badge(computeBadge(stars))
                            .factors(buildFactors(sSubs))
                            .build();
                })
                .sorted(Comparator.comparingInt(HodDto.StudentPerformance::getCredits).reversed())
                .collect(Collectors.toList());

        List<HodDto.StudentPerformance> topStudents = studentPerformances.stream()
                .limit(3)
                .collect(Collectors.toList());

        // ── 7. Mentor performance (success rate, credits guided) ──────────
        List<HodDto.MentorPerformance> mentorPerformances = mentors.stream()
                .map(m -> {
                    List<Submission> mSubs = allSubs.stream()
                            .filter(s -> m.getId().equals(s.getMentorId()))
                            .collect(Collectors.toList());
                    int approvCount  = (int) mSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.APPROVED).count();
                    int processed    = (int) mSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.APPROVED
                                                                     || s.getStatus() == SubmissionStatus.REJECTED).count();
                    int successRate  = processed > 0 ? Math.round((approvCount * 100f) / processed) : 0;
                    int credGuided   = mSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.APPROVED)
                                           .mapToInt(Submission::getAwardedCredits).sum();
                    return HodDto.MentorPerformance.builder()
                            .id(m.getId())
                            .name(m.getName())
                            .email(m.getEmail())
                            .avatarUrl(m.getAvatarUrl())
                            .department(m.getDepartmentName())
                            .creditsGuided(credGuided)
                            .reviewsHandled(mSubs.size())
                            .approvalsCount(approvCount)
                            .successRate(successRate)
                            .build();
                })
                .sorted(Comparator.comparingInt(HodDto.MentorPerformance::getSuccessRate).reversed())
                .collect(Collectors.toList());

        List<HodDto.MentorPerformance> topMentors = mentorPerformances.stream()
                .limit(3)
                .collect(Collectors.toList());

        // ── 8. Pending mentors (for mentor-approvals page) ───────────────
        List<HodDto.UserSummary> pendingMentors = filterByRoleAndStatus(deptUsers, UserRole.MENTOR, UserStatus.PENDING)
                .stream().map(this::mapToUserSummary).collect(Collectors.toList());

        // ── 9. Approved mentors (for mentors page) ───────────────────────
        List<HodDto.UserSummary> departmentMentors = mentors.stream()
                .map(m -> {
                    List<Submission> mSubs = allSubs.stream()
                            .filter(s -> m.getId().equals(s.getMentorId()))
                            .collect(Collectors.toList());
                    int approvedCount = (int) mSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.APPROVED).count();
                    int rejectedCount = (int) mSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.REJECTED).count();
                    int pendingCount  = (int) mSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.PENDING).count();
                    int processed     = approvedCount + rejectedCount;
                    int successRate   = processed > 0 ? Math.round((approvedCount * 100f) / processed) : 0;
                    int credGuided    = mSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.APPROVED)
                                           .mapToInt(Submission::getAwardedCredits).sum();
                    int studentCount  = (int) students.stream().filter(s -> m.getId().equals(s.getMentorId())).count();
                    
                    HodDto.UserSummary summary = mapToUserSummary(m);
                    summary.setStudentCount(studentCount);
                    summary.setReviewsHandled(mSubs.size());
                    summary.setApprovalsCount(approvedCount);
                    summary.setRejectedCount(rejectedCount);
                    summary.setPendingCount(pendingCount);
                    summary.setSuccessRate(successRate);
                    summary.setCreditsGuided(credGuided);
                    return summary;
                }).collect(Collectors.toList());

        return HodDto.DeptStatsResponse.builder()
                .totalMentors(mentors.size())
                .totalStudents(students.size())
                .hackathonsWon(hackWon)
                .hackathonsParticipated(hackParticipated)
                .coursesDone(courses)
                .internshipsDone(internships)
                .factorCounts(factorCounts)
                .skillTrendData(skillTrend)
                .topStudents(topStudents)
                .topMentors(topMentors)
                .departmentMentors(departmentMentors)
                .pendingMentors(pendingMentors)
                .build();
    }

    // =====================================================================
    // PROFILE
    // =====================================================================

    @Override
    @Transactional(readOnly = true)
    public HodDto.HodProfile getProfile(String authUserId) {
        log.info("HOD getProfile: userId={}", authUserId);
        User hod = findUser(authUserId);
        return mapToHodProfile(hod);
    }

    // =====================================================================
    // DEPARTMENT MENTORS
    // =====================================================================

    @Override
    @Transactional(readOnly = true)
    public List<HodDto.UserSummary> getDepartmentMentors(String authUserId) {
        log.info("HOD getDepartmentMentors: userId={}", authUserId);
        User hod = findUser(authUserId);
        String deptId = requireDepartmentId(hod);

        List<User> mentors = userRepository.findByDepartmentIdAndRole(deptId, UserRole.MENTOR)
                .stream()
                .filter(u -> u.getStatus() == UserStatus.APPROVED)
                .collect(Collectors.toList());

        List<User> students = userRepository.findByDepartmentIdAndRole(deptId, UserRole.STUDENT)
                .stream()
                .filter(u -> u.getStatus() == UserStatus.APPROVED)
                .collect(Collectors.toList());

        List<String> studentIds = students.stream().map(User::getId).collect(Collectors.toList());
        List<Submission> allSubs = studentIds.isEmpty()
                ? Collections.emptyList()
                : submissionRepository.findByStudentIdIn(studentIds);

        return mentors.stream()
                .map(m -> {
                    List<Submission> mSubs = allSubs.stream()
                            .filter(s -> m.getId().equals(s.getMentorId()))
                            .collect(Collectors.toList());
                    int approvedCount = (int) mSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.APPROVED).count();
                    int rejectedCount = (int) mSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.REJECTED).count();
                    int pendingCount  = (int) mSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.PENDING).count();
                    int processed     = approvedCount + rejectedCount;
                    int successRate   = processed > 0 ? Math.round((approvedCount * 100f) / processed) : 0;
                    int credGuided    = mSubs.stream().filter(s -> s.getStatus() == SubmissionStatus.APPROVED)
                                           .mapToInt(Submission::getAwardedCredits).sum();
                    int studentCount  = (int) students.stream().filter(s -> m.getId().equals(s.getMentorId())).count();
                    
                    HodDto.UserSummary summary = mapToUserSummary(m);
                    summary.setStudentCount(studentCount);
                    summary.setReviewsHandled(mSubs.size());
                    summary.setApprovalsCount(approvedCount);
                    summary.setRejectedCount(rejectedCount);
                    summary.setPendingCount(pendingCount);
                    summary.setSuccessRate(successRate);
                    summary.setCreditsGuided(credGuided);
                    return summary;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HodDto.UserSummary> getPendingMentors(String authUserId) {
        log.info("HOD getPendingMentors: userId={}", authUserId);
        User hod = findUser(authUserId);
        String deptId = requireDepartmentId(hod);
        return userRepository.findByDepartmentIdAndRole(deptId, UserRole.MENTOR)
                .stream()
                .filter(u -> u.getStatus() == UserStatus.PENDING)
                .map(this::mapToUserSummary)
                .collect(Collectors.toList());
    }

    // =====================================================================
    // PRIVATE HELPERS
    // =====================================================================

    private User findUser(String identifier) {
        if (identifier == null) throw SaptException.badRequest("User identifier cannot be null");
        return userRepository.findByEmail(identifier)
                .orElseGet(() -> userRepository.findById(identifier)
                .orElseThrow(() -> SaptException.notFound("User not found: " + identifier)));
    }

    private String requireDepartmentId(User hod) {
        if (hod.getDepartmentId() == null || hod.getDepartmentId().isBlank()) {
            throw SaptException.badRequest("HOD is not assigned to a department");
        }
        return hod.getDepartmentId();
    }

    private List<User> filterByRoleAndStatus(List<User> users, UserRole role, UserStatus status) {
        return users.stream()
                .filter(u -> role == u.getRole() && status == u.getStatus())
                .collect(Collectors.toList());
    }

    private List<Submission> filterByStatus(List<Submission> subs, SubmissionStatus status) {
        return subs.stream().filter(s -> status == s.getStatus()).collect(Collectors.toList());
    }

    // ── Category classification (mirrors HODDashboard.jsx logic) ─────────

    private boolean isHackathonType(String cat) {
        if (cat == null) return false;
        String c = cat.toLowerCase();
        return c.contains("hackathon") || c.contains("ideathon") || c.contains("coding competition");
    }

    private boolean isCourseType(String cat) {
        if (cat == null) return false;
        String c = cat.toLowerCase();
        return c.contains("certif") || c.contains("workshop") || c.contains("seminar")
                || c.contains("guest lecture") || c.contains("online course");
    }

    private boolean isInternshipType(String cat) {
        if (cat == null) return false;
        return cat.toLowerCase().contains("internship");
    }

    private boolean isProjectType(String cat) {
        if (cat == null) return false;
        String c = cat.toLowerCase();
        return c.contains("project") || c.contains("freelanc");
    }

    private boolean isPublicationType(String cat) {
        if (cat == null) return false;
        String c = cat.toLowerCase();
        return c.contains("conference") || c.contains("research") || c.contains("publication");
    }

    // ── Star / badge thresholds (mirrors STAR_THRESHOLDS in frontend/src/utils/mockData.js) ─
    // 1★ = 100 credits | 2★ = 250 | 3★ = 500 | 4★ = 1000 | 5★ = 2000

    private int computeStars(int credits) {
        if (credits >= 2000) return 5;
        if (credits >= 1000) return 4;
        if (credits >= 500)  return 3;
        if (credits >= 250)  return 2;
        if (credits >= 100)  return 1;
        return 0;
    }

    private String computeBadge(int stars) {
        switch (stars) {
            case 5:  return "Diamond";
            case 4:  return "Platinum";
            case 3:  return "Gold";
            case 2:  return "Silver";
            case 1:  return "Bronze";
            default: return "Beginner";
        }
    }

    // ── Factor breakdown per student ─────────────────────────────────────

    private HodDto.FactorsBreakdown buildFactors(List<Submission> approvedSubs) {
        int hackathons     = (int) approvedSubs.stream().filter(s -> isHackathonType(s.getCategoryName())).count();
        int certifications = (int) approvedSubs.stream().filter(s -> isCourseType(s.getCategoryName())).count();
        int internships    = (int) approvedSubs.stream().filter(s -> isInternshipType(s.getCategoryName())).count();
        int projects       = (int) approvedSubs.stream().filter(s -> isProjectType(s.getCategoryName())).count();
        int publications   = (int) approvedSubs.stream().filter(s -> isPublicationType(s.getCategoryName())).count();
        return HodDto.FactorsBreakdown.builder()
                .hackathons(hackathons)
                .certifications(certifications)
                .internships(internships)
                .projects(projects)
                .publications(publications)
                .build();
    }

    // ── Monthly trend (Jan – Dec) ─────────────────────────────────────────

    private List<HodDto.SkillTrendEntry> buildMonthlyTrend(List<Submission> approvedSubs) {
        List<HodDto.SkillTrendEntry> trend = new ArrayList<>();
        for (Month month : Month.values()) {
            int m = month.getValue();
            long count = approvedSubs.stream()
                    .filter(s -> s.getSubmittedAt() != null && s.getSubmittedAt().getMonthValue() == m)
                    .count();
            trend.add(HodDto.SkillTrendEntry.builder()
                    .month(month.getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .achievements((int) count)
                    .build());
        }
        return trend;
    }

    // ── Mappers ───────────────────────────────────────────────────────────

    private HodDto.HodProfile mapToHodProfile(User u) {
        return HodDto.HodProfile.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .position(u.getPosition())
                .avatarUrl(u.getAvatarUrl())
                .adminId(u.getAdminId())
                .role(u.getRole())
                .status(u.getStatus())
                .collegeId(u.getCollegeId())
                .collegeName(u.getCollegeName())
                .departmentId(u.getDepartmentId())
                .departmentName(u.getDepartmentName())
                .lastLoginAt(u.getLastLoginAt())
                .createdAt(u.getCreatedAt())
                .build();
    }

    private HodDto.UserSummary mapToUserSummary(User u) {
        return HodDto.UserSummary.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .position(u.getPosition())
                .avatarUrl(u.getAvatarUrl())
                .adminId(u.getAdminId())
                .rollNo(u.getRollNo())
                .role(u.getRole())
                .status(u.getStatus())
                .collegeId(u.getCollegeId())
                .collegeName(u.getCollegeName())
                .departmentId(u.getDepartmentId())
                .departmentName(u.getDepartmentName())
                .mentorId(u.getMentorId())
                .mentorName(u.getMentorName())
                .hodId(u.getHodId())
                .createdAt(u.getCreatedAt())
                .lastLoginAt(u.getLastLoginAt())
                .build();
    }
}
