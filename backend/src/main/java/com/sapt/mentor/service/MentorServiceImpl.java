package com.sapt.mentor.service;

import com.sapt.auth.entity.User;
import com.sapt.auth.repository.UserRepository;
import com.sapt.common.exception.SaptException;
import com.sapt.mentor.dto.MentorDashboardDto;
import com.sapt.mentor.dto.MentorDto;
import com.sapt.mentor.entity.SuccessionRequest;
import com.sapt.mentor.repository.SuccessionRequestRepository;
import com.sapt.student.entity.DailyLog;
import com.sapt.student.repository.DailyLogRepository;
import com.sapt.submission.dto.SubmissionDto;
import com.sapt.submission.entity.Submission;
import com.sapt.submission.entity.SubmissionFile;
import com.sapt.submission.entity.ActivityCategory;
import com.sapt.submission.repository.ActivityCategoryRepository;
import com.sapt.submission.repository.SubmissionFileRepository;
import com.sapt.submission.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MentorServiceImpl implements MentorService {

    private final UserRepository userRepository;
    private final SuccessionRequestRepository successionRequestRepository;
    private final DailyLogRepository dailyLogRepository;
    private final SubmissionRepository submissionRepository;
    private final SubmissionFileRepository submissionFileRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityCategoryRepository activityCategoryRepository;

    @Override
    @Transactional(readOnly = true)
    public MentorDto.MentorProfile getProfile(String authUserId) {
        log.info("Mentor getProfile: userId={}", authUserId);
        User mentor = findUser(authUserId);
        
        MentorDto.SuccessionRequestDto succession = getActiveSuccession(mentor.getId());
        
        return MentorDto.MentorProfile.builder()
                .id(mentor.getId())
                .name(mentor.getName())
                .email(mentor.getEmail())
                .phone(mentor.getPhone())
                .position(mentor.getPosition())
                .collegeId(mentor.getCollegeId())
                .collegeName(mentor.getCollegeName())
                .departmentId(mentor.getDepartmentId())
                .departmentName(mentor.getDepartmentName())
                .role(mentor.getRole())
                .status(mentor.getStatus())
                .avatarUrl(mentor.getAvatarUrl())
                .successionRequest(succession)
                .lastLoginAt(mentor.getLastLoginAt())
                .createdAt(mentor.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorDto.StudentSummary> getAssignedStudents(String mentorId) {
        log.info("Mentor getAssignedStudents: mentorId={}", mentorId);
        User mentor = userRepository.findById(mentorId).orElse(null);
        List<User> students = userRepository.findByMentorId(mentorId).stream()
                .filter(s -> s.getStatus() == com.sapt.common.enums.UserStatus.APPROVED && s.isActive())
                .collect(Collectors.toCollection(ArrayList::new));
        
        if (students.isEmpty() && mentor != null && mentor.getDepartmentId() != null) {
            List<User> deptStudents = userRepository.findByDepartmentIdAndRole(mentor.getDepartmentId(), com.sapt.common.enums.UserRole.STUDENT).stream()
                    .filter(s -> s.getStatus() == com.sapt.common.enums.UserStatus.APPROVED && s.isActive())
                    .collect(Collectors.toList());
            students.addAll(deptStudents);
        }

        return students.stream()
                .map(this::mapToStudentSummary)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MentorDashboardDto getDashboardStats(String authUserId) {
        log.info("Mentor getDashboardStats: userId={}", authUserId);
        User mentor = findUser(authUserId);
        String mentorId = mentor.getId();
        
        List<User> students = userRepository.findByMentorId(mentorId).stream()
                .filter(s -> s.getStatus() == com.sapt.common.enums.UserStatus.APPROVED && s.isActive())
                .collect(Collectors.toCollection(ArrayList::new));
                
        if (students.isEmpty() && mentor.getDepartmentId() != null) {
            List<User> deptStudents = userRepository.findByDepartmentIdAndRole(mentor.getDepartmentId(), com.sapt.common.enums.UserRole.STUDENT).stream()
                    .filter(s -> s.getStatus() == com.sapt.common.enums.UserStatus.APPROVED && s.isActive())
                    .collect(Collectors.toList());
            students.addAll(deptStudents);
        }

        int totalStudents = students.size();
        
        int totalCredits = 0;
        List<MentorDto.StudentSummary> summaries = new ArrayList<>();
        for (User s : students) {
            MentorDto.StudentSummary sum = mapToStudentSummary(s);
            totalCredits += sum.getCredits();
            summaries.add(sum);
        }
        
        List<MentorDto.StudentSummary> topStudents = summaries.stream()
                .sorted((a, b) -> Integer.compare(b.getCredits(), a.getCredits()))
                .limit(3)
                .collect(Collectors.toList());

        List<String> studentIds = students.stream().map(User::getId).collect(Collectors.toList());
        long approvedCount = 0;
        long rejectedCount = 0;
        long pendingCount = 0;
        List<Submission> allSubs = new ArrayList<>();

        if (!studentIds.isEmpty()) {
            List<Submission> deptSubs = submissionRepository.findByStudentIdIn(studentIds);
            allSubs = deptSubs;
            approvedCount = deptSubs.stream().filter(s -> s.getStatus() == com.sapt.common.enums.SubmissionStatus.APPROVED).count();
            rejectedCount = deptSubs.stream().filter(s -> s.getStatus() == com.sapt.common.enums.SubmissionStatus.REJECTED).count();
            pendingCount = deptSubs.stream().filter(s -> s.getStatus() == com.sapt.common.enums.SubmissionStatus.PENDING).count();
        } else {
            approvedCount = submissionRepository.countByMentorIdAndStatus(mentorId, com.sapt.common.enums.SubmissionStatus.APPROVED);
            rejectedCount = submissionRepository.countByMentorIdAndStatus(mentorId, com.sapt.common.enums.SubmissionStatus.REJECTED);
            pendingCount = submissionRepository.countByMentorIdAndStatus(mentorId, com.sapt.common.enums.SubmissionStatus.PENDING);
            allSubs = submissionRepository.findByMentorId(mentorId, PageRequest.of(0, 100000)).getContent();
        }
        
        List<Submission> approvedSubs = allSubs.stream()
                .filter(s -> s.getStatus() == com.sapt.common.enums.SubmissionStatus.APPROVED)
                .collect(Collectors.toList());
                
        Map<String, Integer> factors = new LinkedHashMap<>();
        factors.put("Hackathons", 0);
        factors.put("Certifications", 0);
        factors.put("Internships", 0);
        factors.put("Projects", 0);
        factors.put("Publications", 0);
        
        for (Submission sub : approvedSubs) {
            String cat = sub.getCategoryName();
            if (isHackathonType(cat)) {
                factors.put("Hackathons", factors.get("Hackathons") + 1);
            } else if (isCourseType(cat)) {
                factors.put("Certifications", factors.get("Certifications") + 1);
            } else if (isInternshipType(cat)) {
                factors.put("Internships", factors.get("Internships") + 1);
            } else if (isProjectType(cat)) {
                factors.put("Projects", factors.get("Projects") + 1);
            } else if (isPublicationType(cat)) {
                factors.put("Publications", factors.get("Publications") + 1);
            }
        }
        
        List<MentorDashboardDto.SkillTrendEntry> skillTrend = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        for (int i = 0; i < 12; i++) {
            final int mVal = i + 1;
            long count = approvedSubs.stream()
                    .filter(s -> s.getSubmittedAt() != null && s.getSubmittedAt().getMonthValue() == mVal)
                    .count();
            skillTrend.add(new MentorDashboardDto.SkillTrendEntry(months[i], (int) count));
        }
        
        List<Submission> recentPendingList = submissionRepository.findByMentorIdAndStatus(mentorId, com.sapt.common.enums.SubmissionStatus.PENDING, PageRequest.of(0, 5)).getContent();
        List<SubmissionDto.SubmissionResponse> recentPending = recentPendingList.stream()
                .map(this::mapSubmissionToResponse)
                .collect(Collectors.toList());
                
        int processedCount = (int) (approvedCount + rejectedCount);
        int successRate = processedCount > 0 ? Math.round((approvedCount * 100f) / processedCount) : 0;

        return MentorDashboardDto.builder()
                .totalStudents(totalStudents)
                .totalCredits(totalCredits)
                .approvedCount((int) approvedCount)
                .rejectedCount((int) rejectedCount)
                .pendingCount((int) pendingCount)
                .successRate(successRate)
                .topStudents(topStudents)
                .factorCounts(factors)
                .skillTrendData(skillTrend)
                .recentPending(recentPending)
                .build();
    }

    @Override
    @Transactional
    public void submitSuccessionRequest(String mentorId, MentorDto.SuccessionSubmitRequest request) {
        log.info("Submitting succession request for mentor: {}", mentorId);
        Optional<SuccessionRequest> activeOpt = successionRequestRepository.findFirstByOutgoingUserIdAndStatusOrderByCreatedAtDesc(mentorId, "PENDING");
        if (activeOpt.isPresent()) {
            throw SaptException.badRequest("You already have an active pending succession request.");
        }

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw SaptException.conflict("The candidate email is already registered as an account.");
        }

        SuccessionRequest req = SuccessionRequest.builder()
                .outgoingUserId(mentorId)
                .outgoingRole(com.sapt.common.enums.SuccessionRole.MENTOR)
                .candidateName(request.getName().trim())
                .candidateEmail(request.getEmail().trim().toLowerCase())
                .candidatePhone(request.getPhone() != null ? request.getPhone().trim() : null)
                .candidatePasswordHash(passwordEncoder.encode(request.getPassword()))
                .status("PENDING")
                .build();

        successionRequestRepository.save(req);
    }

    @Override
    @Transactional
    public void cancelSuccessionRequest(String mentorId) {
        log.info("Canceling active succession request for mentor: {}", mentorId);
        SuccessionRequest req = successionRequestRepository.findFirstByOutgoingUserIdAndStatusOrderByCreatedAtDesc(mentorId, "PENDING")
                .orElseThrow(() -> SaptException.notFound("No active pending succession request found."));
        req.setStatus("CANCELLED");
        successionRequestRepository.save(req);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorDto.DailyLogResponse> getAssignedStudentsLogs(String mentorId) {
        log.info("Mentor getAssignedStudentsLogs: mentorId={}", mentorId);
        List<User> students = userRepository.findByMentorId(mentorId);
        List<String> studentIds = students.stream().map(User::getId).collect(Collectors.toList());
        
        if (studentIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<DailyLog> logs = dailyLogRepository.findByStudentIdInOrderByLogDateDesc(studentIds);
        Map<String, String> studentNames = students.stream().collect(Collectors.toMap(User::getId, User::getName));
        
        return logs.stream().map(l -> MentorDto.DailyLogResponse.builder()
                .id(l.getId())
                .studentId(l.getStudentId())
                .studentName(studentNames.getOrDefault(l.getStudentId(), "Unknown"))
                .title(l.getTitle())
                .description(l.getDescription())
                .links(l.getReferenceLinks())
                .date(l.getLogDate().toString())
                .reviewStatus(l.getReviewStatus() != null ? l.getReviewStatus() : "pending")
                .review(l.getMentorRemark())
                .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void reviewLog(String mentorId, String logId, String status, String remark) {
        log.info("Mentor {} reviewing log {} with status {}", mentorId, logId, status);
        DailyLog dailyLog = dailyLogRepository.findById(logId)
                .orElseThrow(() -> SaptException.notFound("Daily log not found"));
                
        User student = userRepository.findById(dailyLog.getStudentId())
                .orElseThrow(() -> SaptException.notFound("Student not found"));
                
        if (student.getMentorId() == null || !student.getMentorId().equals(mentorId)) {
            throw SaptException.forbidden("You are not authorized to review this student's log.");
        }
        
        dailyLog.setMentorRemark(remark);
        dailyLog.setRemarkedBy(mentorId);
        dailyLog.setRemarkedAt(LocalDateTime.now());
        dailyLog.setReviewStatus(status.toLowerCase());
        
        dailyLogRepository.save(dailyLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.sapt.submission.dto.SubmissionDto.SubmissionResponse> getStudentSubmissions(String mentorId, String studentId) {
        log.info("Mentor {} getting student {} submissions", mentorId, studentId);
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> SaptException.notFound("Student not found"));
        if (student.getMentorId() == null || !student.getMentorId().equals(mentorId)) {
            throw SaptException.forbidden("You are not authorized to view this student's submissions");
        }
        
        return submissionRepository.findByStudentIdOrderBySubmittedAtDesc(studentId).stream()
                .map(this::mapSubmissionToResponse)
                .collect(Collectors.toList());
    }

    private User findUser(String identifier) {
        if (identifier == null) throw SaptException.badRequest("User identifier cannot be null");
        return userRepository.findByEmail(identifier)
                .orElseGet(() -> userRepository.findById(identifier)
                .orElseThrow(() -> SaptException.notFound("User not found: " + identifier)));
    }

    private MentorDto.SuccessionRequestDto getActiveSuccession(String userId) {
        return successionRequestRepository.findFirstByOutgoingUserIdAndStatusOrderByCreatedAtDesc(userId, "PENDING")
                .map(r -> MentorDto.SuccessionRequestDto.builder()
                        .id(r.getId())
                        .name(r.getCandidateName())
                        .email(r.getCandidateEmail())
                        .phone(r.getCandidatePhone())
                        .status(r.getStatus().toLowerCase())
                        .requestedAt(r.getRequestedAt())
                        .build())
                .orElse(null);
    }

    private MentorDto.StudentSummary mapToStudentSummary(User s) {
        List<Submission> submissions = submissionRepository.findByStudentIdOrderBySubmittedAtDesc(s.getId());
        int approvedCredits = 0;
        int totalPenalty = 0;
        long approvedCount = 0;

        for (Submission sub : submissions) {
            if (sub.getStatus() == com.sapt.common.enums.SubmissionStatus.APPROVED) {
                approvedCount++;
                approvedCredits += sub.getAwardedCredits();
            } else if (sub.getStatus() == com.sapt.common.enums.SubmissionStatus.REJECTED) {
                int penalty = sub.getCreditPenalty() > 0 
                        ? sub.getCreditPenalty() 
                        : (int) Math.ceil(sub.getSuggestedCredits() * 0.10);
                totalPenalty += penalty;
            }
        }
        int netCredits = Math.max(0, approvedCredits - totalPenalty);

        int stars = computeStars(netCredits);
        String badge = computeBadge(stars);

        return MentorDto.StudentSummary.builder()
                .id(s.getId())
                .name(s.getName())
                .rollNo(s.getRollNo())
                .email(s.getEmail())
                .phone(s.getPhone())
                .avatar(s.getAvatarUrl())
                .department(s.getDepartmentName())
                .credits(netCredits)
                .activitiesCount((int) approvedCount)
                .starsCount(stars)
                .badge(badge)
                .build();
    }

    private SubmissionDto.SubmissionResponse mapSubmissionToResponse(Submission s) {
        List<SubmissionFile> files = submissionFileRepository.findBySubmissionId(s.getId());
        
        SubmissionDto.SubmissionResponse r = new SubmissionDto.SubmissionResponse();
        r.setId(s.getId());
        r.setStudentId(s.getStudentId());
        r.setMentorId(s.getMentorId());
        r.setCategoryId(s.getCategoryId());
        r.setSubTypeId(s.getSubTypeId());
        r.setParentSubmissionId(s.getParentSubmissionId());
        r.setType(s.getCategoryName());
        r.setAchievementType(s.getAchievementType());
        r.setTitle(s.getTitle());
        r.setDescription(s.getDescription());
        r.setDate(s.getActivityDate());
        r.setSuggestedCredits(s.getSuggestedCredits());
        r.setCredits(s.getAwardedCredits());
        r.setCreditPenalty(s.getCreditPenalty());
        r.setStatus(s.getStatus());
        r.setReview(s.getReviewText());
        r.setStudentName(s.getStudentName());
        r.setResubmission(s.isResubmission());
        boolean isCustom = s.getCategoryId() != null &&
                activityCategoryRepository.findById(s.getCategoryId())
                        .map(com.sapt.submission.entity.ActivityCategory::isCustom).orElse(false);
        if (!isCustom && s.getSuggestedCredits() == 0) {
            isCustom = true;
        }
        r.setCustomCategory(isCustom);
        r.setReviewedAt(s.getReviewedAt());
        r.setSubmittedAt(s.getSubmittedAt());
        r.setCreatedAt(s.getCreatedAt());

        List<SubmissionDto.DocumentInfo> docs = new ArrayList<>();
        for (SubmissionFile f : files) {
            SubmissionDto.DocumentInfo doc = new SubmissionDto.DocumentInfo();
            doc.setName(f.getOriginalFilename());
            doc.setUrl(f.getStoredPath());
            
            if (f.getFileType() == com.sapt.common.enums.SubmissionFileType.CERTIFICATE) {
                doc.setType("certificate");
                r.setFileUrl(f.getStoredPath());
                r.setCertificateFile(f.getOriginalFilename());
            } else if (f.getFileType() == com.sapt.common.enums.SubmissionFileType.PRESENTATION) {
                doc.setType("presentation");
                r.setPresentationUrl(f.getStoredPath());
                r.setPresentationFile(f.getOriginalFilename());
            } else if (f.getFileType() == com.sapt.common.enums.SubmissionFileType.DOCUMENT) {
                doc.setType("document");
                r.setDocumentUrl(f.getStoredPath());
                r.setDocumentFile(f.getOriginalFilename());
            }
            docs.add(doc);
        }
        r.setAllDocuments(docs);
        return r;
    }

    /**
     * Computes the star count for a given credit total.
     * Thresholds MUST match STAR_THRESHOLDS in frontend/src/utils/mockData.js:
     *   1★ = 100 credits
     *   2★ = 250 credits
     *   3★ = 500 credits
     *   4★ = 1000 credits
     *   5★ = 2000 credits
     */
    private int computeStars(int credits) {
        if (credits >= 2000) return 5;
        if (credits >= 1000) return 4;
        if (credits >= 500)  return 3;
        if (credits >= 250)  return 2;
        if (credits >= 100)  return 1;
        return 0;
    }

    /**
     * Maps star count to badge name.
     * MUST match getAchievementBadge() in frontend/src/utils/mockData.js:
     *   0 = Beginner, 1 = Bronze, 2 = Silver, 3 = Gold, 4 = Platinum, 5 = Diamond
     */
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
}
