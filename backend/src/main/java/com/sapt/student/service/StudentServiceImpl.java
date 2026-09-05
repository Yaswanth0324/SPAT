package com.sapt.student.service;

import com.sapt.auth.entity.User;
import com.sapt.auth.repository.UserRepository;
import com.sapt.common.enums.SubmissionStatus;
import com.sapt.common.exception.SaptException;
import com.sapt.student.dto.DailyLogDto;
import com.sapt.student.dto.StudentDto;
import com.sapt.student.entity.DailyLog;
import com.sapt.student.entity.StarThreshold;
import com.sapt.student.entity.StudentCreditSnapshot;
import com.sapt.student.repository.DailyLogRepository;
import com.sapt.student.repository.StarThresholdRepository;
import com.sapt.student.repository.StudentCreditSnapshotRepository;
import com.sapt.submission.entity.ActivityCategory;
import com.sapt.submission.entity.ActivitySubType;
import com.sapt.submission.entity.Submission;
import com.sapt.submission.entity.SubmissionFile;
import com.sapt.submission.repository.ActivityCategoryRepository;
import com.sapt.submission.repository.ActivitySubTypeRepository;
import com.sapt.submission.repository.SubmissionFileRepository;
import com.sapt.submission.repository.SubmissionRepository;
import com.sapt.submission.dto.SubmissionDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final UserRepository userRepository;
    private final DailyLogRepository dailyLogRepository;
    private final StudentCreditSnapshotRepository studentCreditSnapshotRepository;
    private final StarThresholdRepository starThresholdRepository;
    private final ActivityCategoryRepository activityCategoryRepository;
    private final ActivitySubTypeRepository activitySubTypeRepository;
    private final SubmissionRepository submissionRepository;
    private final SubmissionFileRepository submissionFileRepository;

    private User findStudent(String emailOrId) {
        return userRepository.findByEmail(emailOrId)
                .orElseGet(() -> userRepository.findById(emailOrId)
                .orElseThrow(() -> SaptException.notFound("Student not found: " + emailOrId)));
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDto.StudentDashboardStats getStudentDashboardStats(String authUserId) {
        log.info("Fetching dashboard stats for student: {}", authUserId);

        User student = findStudent(authUserId);
        String studentId = student.getId();

        // Fetch submissions & count by status
        List<Submission> studentSubmissions = submissionRepository.findByStudentIdOrderBySubmittedAtDesc(studentId);
        int approvedCount = 0;
        int rejectedCount = 0;
        int pendingCount = 0;
        int totalCredits = 0;

        List<Submission> approvedSubs = new ArrayList<>();
        List<SubmissionDto.SubmissionResponse> mappedSubmissions = new ArrayList<>();

        for (Submission s : studentSubmissions) {
            mappedSubmissions.add(mapSubmissionToResponse(s));
            if (s.getStatus() == SubmissionStatus.APPROVED) {
                approvedCount++;
                approvedSubs.add(s);
                totalCredits += s.getAwardedCredits();
            } else if (s.getStatus() == SubmissionStatus.REJECTED) {
                rejectedCount++;
                // Deduct 10%-ceiling penalty from net credits
                totalCredits -= (int) Math.ceil(s.getSuggestedCredits() * 0.10);
            } else if (s.getStatus() == SubmissionStatus.PENDING) {
                pendingCount++;
            }
        }
        // Never let credits go below 0
        totalCredits = Math.max(0, totalCredits);

        // Star Calculation
        int stars = 0;
        String badge = "Beginner";
        List<StarThreshold> thresholds = starThresholdRepository.findAll();
        thresholds.sort(Comparator.comparing(StarThreshold::getMinCredits));
        for (StarThreshold t : thresholds) {
            if (totalCredits >= t.getMinCredits()) {
                stars = t.getStars();
                badge = t.getBadgeName();
            }
        }

        // Monthly credit growth chart data
        List<Submission> sortedApproved = approvedSubs.stream()
                .sorted(Comparator.comparing(Submission::getSubmittedAt))
                .collect(Collectors.toList());

        List<StudentDto.CreditGrowthPoint> growthData = new ArrayList<>();
        int cumulative = 0;
        for (Submission s : sortedApproved) {
            cumulative += s.getAwardedCredits();
            String dateStr = s.getSubmittedAt() != null 
                    ? s.getSubmittedAt().toString().substring(0, 7) 
                    : s.getActivityDate().toString().substring(0, 7); // "YYYY-MM"
            growthData.add(new StudentDto.CreditGrowthPoint(dateStr, cumulative));
        }

        // Daily Logs
        List<DailyLogDto.Response> mappedLogs = getStudentLogs(studentId);

        return StudentDto.StudentDashboardStats.builder()
                .totalCredits(totalCredits)
                .totalApproved(approvedCount)
                .totalRejected(rejectedCount)
                .totalPending(pendingCount)
                .stars(stars)
                .badge(badge)
                .growthData(growthData)
                .submissions(mappedSubmissions)
                .logs(mappedLogs)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyLogDto.Response> getStudentLogs(String authUserId) {
        log.info("Fetching daily logs for student: {}", authUserId);
        User student = findStudent(authUserId);
        return dailyLogRepository.findByStudentIdOrderByLogDateDesc(student.getId()).stream()
                .map(this::mapLogToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DailyLogDto.Response createDailyLog(String authUserId, DailyLogDto.CreateRequest request) {
        log.info("Creating daily log for student: {}", authUserId);
        User student = findStudent(authUserId);
        
        DailyLog logEntity = DailyLog.builder()
                .studentId(student.getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .referenceLinks(request.getLinks())
                .logDate(LocalDate.now())
                .reviewStatus("pending")
                .build();

        DailyLog saved = dailyLogRepository.save(logEntity);
        return mapLogToResponse(saved);
    }

    @Override
    @Transactional
    public DailyLogDto.Response updateDailyLog(String authUserId, String logId, DailyLogDto.CreateRequest request) {
        log.info("Updating daily log {} for student: {}", logId, authUserId);
        User student = findStudent(authUserId);
        DailyLog dailyLog = dailyLogRepository.findById(logId)
                .orElseThrow(() -> SaptException.notFound("Daily log not found"));
                
        if (!dailyLog.getStudentId().equals(student.getId())) {
            throw SaptException.forbidden("You are not authorized to edit this log");
        }
        
        dailyLog.setTitle(request.getTitle());
        dailyLog.setDescription(request.getDescription());
        dailyLog.setReferenceLinks(request.getLinks());
        dailyLog.setReviewStatus("pending");
        dailyLog.setMentorRemark(null);
        dailyLog.setRemarkedBy(null);
        dailyLog.setRemarkedAt(null);
        
        DailyLog saved = dailyLogRepository.save(dailyLog);
        return mapLogToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, List<Map<String, Object>>> getAllCategories() {
        log.info("Fetching all activity categories and sub-types");
        List<ActivityCategory> categories = activityCategoryRepository.findByIsActiveTrue();
        Map<String, List<Map<String, Object>>> result = new HashMap<>();

        for (ActivityCategory cat : categories) {
            List<ActivitySubType> subTypes = activitySubTypeRepository.findByCategoryIdAndIsActiveTrue(cat.getId());
            List<Map<String, Object>> mappedSubs = subTypes.stream().map(sub -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", sub.getId());
                map.put("label", sub.getLabel());
                map.put("points", sub.getPoints());
                map.put("categoryId", cat.getId());
                return map;
            }).collect(Collectors.toList());
            result.put(cat.getName(), mappedSubs);
        }
        return result;
    }

    @Override
    @Transactional
    public StudentDto.CustomCategoryResponse createCustomCategory(String authUserId, StudentDto.CustomCategoryRequest request) {
        log.info("Creating custom category for user {}: {}", authUserId, request.getCategoryName());
        User student = findStudent(authUserId);
        
        String trimmedName = request.getCategoryName().trim();
        String trimmedLabel = request.getAchievementType().trim();
        int points = request.getSuggestedPoints() != null ? request.getSuggestedPoints() : 15;

        // Resolve or create category (case-insensitive lookup first)
        ActivityCategory category = activityCategoryRepository.findByNameIgnoreCase(trimmedName)
                .orElse(null);
        if (category == null) {
            try {
                category = activityCategoryRepository.save(
                        ActivityCategory.builder()
                                .name(trimmedName)
                                .isCustom(true)
                                .createdBy(student.getId())
                                .isActive(true)
                                .build()
                );
            } catch (Exception e) {
                category = activityCategoryRepository.findByNameIgnoreCase(trimmedName)
                        .orElseThrow(() -> SaptException.badRequest("Could not create activity category: " + e.getMessage()));
            }
        }

        // Resolve or create sub-type (case-insensitive lookup first)
        final String catId = category.getId();
        ActivitySubType subType = activitySubTypeRepository.findByCategoryIdAndLabelIgnoreCase(catId, trimmedLabel)
                .orElse(null);
        if (subType == null) {
            try {
                subType = activitySubTypeRepository.save(
                        ActivitySubType.builder()
                                .categoryId(catId)
                                .label(trimmedLabel)
                                .points(points)
                                .isActive(true)
                                .build()
                );
            } catch (Exception e) {
                subType = activitySubTypeRepository.findByCategoryIdAndLabelIgnoreCase(catId, trimmedLabel)
                        .orElseThrow(() -> SaptException.badRequest("Could not create achievement sub-type: " + e.getMessage()));
            }
        }

        return StudentDto.CustomCategoryResponse.builder()
                .categoryId(category.getId())
                .subTypeId(subType.getId())
                .categoryName(category.getName())
                .achievementType(subType.getLabel())
                .points(subType.getPoints())
                .build();
    }

    @Override
    @Transactional
    public void recalculateCreditSnapshot(String studentId) {
        log.info("Recalculating credit snapshot for student: {}", studentId);

        StudentCreditSnapshot snapshot = studentCreditSnapshotRepository.findByStudentId(studentId)
                .orElseGet(() -> StudentCreditSnapshot.builder()
                        .studentId(studentId)
                        .build());

        List<Submission> submissions = submissionRepository.findByStudentIdOrderBySubmittedAtDesc(studentId);
        int approvedCount = 0;
        int rejectedCount = 0;
        int pendingCount = 0;
        int totalCredits = 0;

        for (Submission s : submissions) {
            if (s.getStatus() == SubmissionStatus.APPROVED) {
                approvedCount++;
                totalCredits += s.getAwardedCredits();
            } else if (s.getStatus() == SubmissionStatus.REJECTED) {
                rejectedCount++;
                // Deduct 10%-ceiling penalty from net credits
                totalCredits -= (int) Math.ceil(s.getSuggestedCredits() * 0.10);
            } else if (s.getStatus() == SubmissionStatus.PENDING) {
                pendingCount++;
            }
        }
        // Never let credits go below 0
        totalCredits = Math.max(0, totalCredits);

        // Star / badge thresholds mapping
        int stars = 0;
        String badge = "Beginner";
        List<StarThreshold> thresholds = starThresholdRepository.findAll();
        thresholds.sort(Comparator.comparing(StarThreshold::getMinCredits));
        for (StarThreshold t : thresholds) {
            if (totalCredits >= t.getMinCredits()) {
                stars = t.getStars();
                badge = t.getBadgeName();
            }
        }

        snapshot.setTotalCredits(totalCredits);
        snapshot.setTotalApproved(approvedCount);
        snapshot.setTotalRejected(rejectedCount);
        snapshot.setTotalPending(pendingCount);
        snapshot.setStars(stars);
        snapshot.setBadge(badge);
        snapshot.setLastCalculatedAt(LocalDateTime.now());

        studentCreditSnapshotRepository.save(snapshot);
        log.info("Recalculated credits: {} pts, {} stars, badge: {}", totalCredits, stars, badge);
    }

    private DailyLogDto.Response mapLogToResponse(DailyLog logEntity) {
        return DailyLogDto.Response.builder()
                .id(logEntity.getId())
                .studentId(logEntity.getStudentId())
                .title(logEntity.getTitle())
                .description(logEntity.getDescription())
                .links(logEntity.getReferenceLinks())
                .date(logEntity.getLogDate())
                .mentorRemark(logEntity.getMentorRemark())
                .remarkedBy(logEntity.getRemarkedBy())
                .reviewStatus(logEntity.getReviewStatus())
                .remarkedAt(logEntity.getRemarkedAt())
                .createdAt(logEntity.getCreatedAt())
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
        r.setStatus(s.getStatus());
        r.setReview(s.getReviewText());
        r.setStudentName(s.getStudentName());
        r.setResubmission(s.isResubmission());
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
}
