package com.sapt.submission.service;

import com.sapt.auth.entity.User;
import com.sapt.auth.repository.UserRepository;
import com.sapt.common.enums.SubmissionStatus;
import com.sapt.common.exception.SaptException;
import com.sapt.notification.NotificationService;
import com.sapt.submission.dto.SubmissionDto;
import com.sapt.submission.entity.Submission;
import com.sapt.submission.entity.SubmissionFile;
import com.sapt.submission.entity.MongoSubmissionFile;
import com.sapt.submission.repository.SubmissionFileRepository;
import com.sapt.submission.repository.SubmissionRepository;
import com.sapt.submission.repository.ActivityCategoryRepository;
import com.sapt.submission.repository.ActivitySubTypeRepository;
import com.sapt.submission.repository.MongoSubmissionFileRepository;
import com.sapt.student.repository.StudentCreditSnapshotRepository;
import com.sapt.student.repository.StarThresholdRepository;
import com.sapt.submission.entity.ActivityCategory;
import com.sapt.submission.entity.ActivitySubType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import jakarta.annotation.PostConstruct;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final SubmissionFileRepository submissionFileRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ActivityCategoryRepository activityCategoryRepository;
    private final ActivitySubTypeRepository activitySubTypeRepository;
    private final StudentCreditSnapshotRepository studentCreditSnapshotRepository;
    private final StarThresholdRepository starThresholdRepository;
    private final MongoSubmissionFileRepository mongoSubmissionFileRepository;

    /**
     * On startup: recalculate every student's credit snapshot so that
     * any penalty changes (e.g., the new 10% rejection deduction) are
     * immediately reflected in the dashboard without manual intervention.
     */
    @PostConstruct
    @Transactional
    public void recalculateAllSnapshotsOnStartup() {
        log.info("[Startup] Recalculating credit snapshots for all students...");
        List<String> studentIds = submissionRepository.findAll()
                .stream()
                .map(Submission::getStudentId)
                .distinct()
                .collect(Collectors.toList());
        for (String studentId : studentIds) {
            try {
                recalculateCreditSnapshot(studentId);
            } catch (Exception e) {
                log.error("[Startup] Failed to recalculate snapshot for student {}: {}", studentId, e.getMessage());
            }
        }
        log.info("[Startup] Recalculated snapshots for {} students.", studentIds.size());
    }

    @Override
    @Transactional
    public SubmissionDto.SubmissionResponse createSubmission(String studentId, SubmissionDto.CreateSubmissionRequest request) {
        log.info("Creating submission for student: {}", studentId);
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> SaptException.notFound("Student not found"));

        String targetMentorId = student.getMentorId();
        if ((targetMentorId == null || targetMentorId.isBlank()) && request.getMentorId() != null && !request.getMentorId().isBlank()) {
            targetMentorId = request.getMentorId();
            student.setMentorId(targetMentorId);
            userRepository.findById(targetMentorId).ifPresent(m -> student.setMentorName(m.getName()));
            userRepository.save(student);
        }

        if (targetMentorId == null || targetMentorId.isBlank()) {
            // Auto-assign first active mentor in department if available
            List<User> deptMentors = userRepository.findByDepartmentIdAndRole(student.getDepartmentId(), com.sapt.common.enums.UserRole.MENTOR);
            if (!deptMentors.isEmpty()) {
                User defaultMentor = deptMentors.get(0);
                targetMentorId = defaultMentor.getId();
                student.setMentorId(targetMentorId);
                student.setMentorName(defaultMentor.getName());
                userRepository.save(student);
            } else {
                // Auto-assign any active mentor in system if department has no mentors
                List<User> anyMentors = userRepository.findByRole(com.sapt.common.enums.UserRole.MENTOR);
                if (!anyMentors.isEmpty()) {
                    User defaultMentor = anyMentors.get(0);
                    targetMentorId = defaultMentor.getId();
                    student.setMentorId(targetMentorId);
                    student.setMentorName(defaultMentor.getName());
                    userRepository.save(student);
                }
            }
        }

        if (targetMentorId == null || targetMentorId.isBlank()) {
            throw SaptException.badRequest("No mentor is currently registered in your department. Please contact your HOD.");
        }

        String categoryId = request.getCategoryId();
        String subTypeId = request.getSubTypeId();
        String categoryName = request.getCategoryName();
        String achievementType = request.getAchievementType();
        int suggestedCredits = request.getSuggestedCredits() != null ? request.getSuggestedCredits() : 0;

        // 1. Resolve Category
        ActivityCategory category = null;
        if (categoryId != null && !categoryId.isBlank()) {
            category = activityCategoryRepository.findById(categoryId).orElse(null);
        }
        if (category == null && categoryName != null && !categoryName.isBlank()) {
            final String cName = categoryName.trim();
            category = activityCategoryRepository.findByNameIgnoreCase(cName)
                    .orElse(null);
            if (category == null) {
                try {
                    category = activityCategoryRepository.save(
                            ActivityCategory.builder()
                                    .name(cName)
                                    .isCustom(true)
                                    .createdBy(studentId)
                                    .isActive(true)
                                    .build()
                    );
                } catch (Exception e) {
                    category = activityCategoryRepository.findByNameIgnoreCase(cName).orElse(null);
                }
            }
        }
        if (category == null) {
            throw SaptException.badRequest("Category could not be resolved. Please specify categoryId or categoryName.");
        }

        // 2. Resolve SubType
        final String resolvedCatId = category.getId();
        ActivitySubType subType = null;
        if (subTypeId != null && !subTypeId.isBlank()) {
            subType = activitySubTypeRepository.findById(subTypeId).orElse(null);
        }
        if (subType == null && achievementType != null && !achievementType.isBlank()) {
            final String aType = achievementType.trim();
            subType = activitySubTypeRepository.findByCategoryIdAndLabelIgnoreCase(resolvedCatId, aType)
                    .orElse(null);
            if (subType == null) {
                try {
                    subType = activitySubTypeRepository.save(
                            ActivitySubType.builder()
                                    .categoryId(resolvedCatId)
                                    .label(aType)
                                    .points(suggestedCredits)
                                    .isActive(true)
                                    .build()
                    );
                } catch (Exception e) {
                    subType = activitySubTypeRepository.findByCategoryIdAndLabelIgnoreCase(resolvedCatId, aType).orElse(null);
                }
            }
        }
        if (subType == null) {
            throw SaptException.badRequest("Achievement type could not be resolved. Please specify subTypeId or achievementType.");
        }

        Submission submission = Submission.builder()
                .studentId(studentId)
                .studentName(student.getName())
                .mentorId(student.getMentorId())
                .categoryId(category.getId())
                .subTypeId(subType.getId())
                .categoryName(category.getName())
                .achievementType(subType.getLabel())
                .title(request.getTitle())
                .description(request.getDescription())
                .activityDate(request.getActivityDate())
                .suggestedCredits(suggestedCredits)
                .status(SubmissionStatus.PENDING)
                .submittedAt(LocalDateTime.now())
                .isResubmission(request.getIsResubmission() != null ? request.getIsResubmission() : false)
                .parentSubmissionId(request.getParentSubmissionId())
                .build();

        Submission saved = submissionRepository.save(submission);

        // Attach files if names provided
        if (request.getCertificateFileName() != null && !request.getCertificateFileName().isBlank()) {
            long size = request.getCertificateBase64() != null ? calculateBytes(request.getCertificateBase64()) : 100L;
            String mime = detectMimeType(request.getCertificateFileName());
            
            SubmissionFile fileEntity = submissionFileRepository.save(SubmissionFile.builder()
                    .submissionId(saved.getId())
                    .fileType(com.sapt.common.enums.SubmissionFileType.CERTIFICATE)
                    .originalFilename(request.getCertificateFileName())
                    .storedPath("#")
                    .mimeType(mime)
                    .fileSizeBytes(size)
                    .build());
            
            if (request.getCertificateBase64() != null && !request.getCertificateBase64().isBlank()) {
                try {
                    MongoSubmissionFile mongoFile = mongoSubmissionFileRepository.save(MongoSubmissionFile.builder()
                            .submissionFileId(fileEntity.getId())
                            .submissionId(saved.getId())
                            .fileType("CERTIFICATE")
                            .originalFilename(request.getCertificateFileName())
                            .mimeType(mime)
                            .fileSizeBytes(size)
                            .base64Data(request.getCertificateBase64())
                            .uploadedAt(LocalDateTime.now())
                            .build());
                    fileEntity.setStoredPath("mongodb://" + mongoFile.getId());
                    submissionFileRepository.save(fileEntity);
                } catch (Exception e) {
                    log.error("Failed to store certificate in MongoDB: {}. Defaulting to placeholders.", e.getMessage());
                }
            }
        }
        if (request.getPresentationFileName() != null && !request.getPresentationFileName().isBlank()) {
            long size = request.getPresentationBase64() != null ? calculateBytes(request.getPresentationBase64()) : 100L;
            String mime = detectMimeType(request.getPresentationFileName());
            
            SubmissionFile fileEntity = submissionFileRepository.save(SubmissionFile.builder()
                    .submissionId(saved.getId())
                    .fileType(com.sapt.common.enums.SubmissionFileType.PRESENTATION)
                    .originalFilename(request.getPresentationFileName())
                    .storedPath("#")
                    .mimeType(mime)
                    .fileSizeBytes(size)
                    .build());
            
            if (request.getPresentationBase64() != null && !request.getPresentationBase64().isBlank()) {
                try {
                    MongoSubmissionFile mongoFile = mongoSubmissionFileRepository.save(MongoSubmissionFile.builder()
                            .submissionFileId(fileEntity.getId())
                            .submissionId(saved.getId())
                            .fileType("PRESENTATION")
                            .originalFilename(request.getPresentationFileName())
                            .mimeType(mime)
                            .fileSizeBytes(size)
                            .base64Data(request.getPresentationBase64())
                            .uploadedAt(LocalDateTime.now())
                            .build());
                    fileEntity.setStoredPath("mongodb://" + mongoFile.getId());
                    submissionFileRepository.save(fileEntity);
                } catch (Exception e) {
                    log.error("Failed to store presentation in MongoDB: {}. Defaulting to placeholders.", e.getMessage());
                }
            }
        }
        if (request.getDocumentFileName() != null && !request.getDocumentFileName().isBlank()) {
            long size = request.getDocumentBase64() != null ? calculateBytes(request.getDocumentBase64()) : 100L;
            String mime = detectMimeType(request.getDocumentFileName());
            
            SubmissionFile fileEntity = submissionFileRepository.save(SubmissionFile.builder()
                    .submissionId(saved.getId())
                    .fileType(com.sapt.common.enums.SubmissionFileType.DOCUMENT)
                    .originalFilename(request.getDocumentFileName())
                    .storedPath("#")
                    .mimeType(mime)
                    .fileSizeBytes(size)
                    .build());
            
            if (request.getDocumentBase64() != null && !request.getDocumentBase64().isBlank()) {
                try {
                    MongoSubmissionFile mongoFile = mongoSubmissionFileRepository.save(MongoSubmissionFile.builder()
                            .submissionFileId(fileEntity.getId())
                            .submissionId(saved.getId())
                            .fileType("DOCUMENT")
                            .originalFilename(request.getDocumentFileName())
                            .mimeType(mime)
                            .fileSizeBytes(size)
                            .base64Data(request.getDocumentBase64())
                            .uploadedAt(LocalDateTime.now())
                            .build());
                    fileEntity.setStoredPath("mongodb://" + mongoFile.getId());
                    submissionFileRepository.save(fileEntity);
                } catch (Exception e) {
                    log.error("Failed to store document in MongoDB: {}. Defaulting to placeholders.", e.getMessage());
                }
            }
        }
        
        // Recalculate credit snapshot
        recalculateCreditSnapshot(studentId);

        // Notify Mentor
        userRepository.findById(student.getMentorId()).ifPresent(mentor -> {
            notificationService.notifyMentorNewSubmission(mentor.getEmail(), mentor.getName(), student.getName(), saved.getTitle());
        });

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionDto.SubmissionResponse getSubmissionById(String submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> SaptException.notFound("Submission not found"));
        return mapToResponse(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SubmissionDto.SubmissionResponse> getStudentSubmissions(String studentId, Pageable pageable) {
        Page<Submission> page = submissionRepository.findByStudentId(studentId, pageable);
        List<SubmissionDto.SubmissionResponse> mapped = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageImpl<>(mapped, pageable, page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDto.SubmissionResponse> getMentorPendingSubmissions(String mentorId) {
        User mentor = userRepository.findById(mentorId).orElse(null);
        List<Submission> list = new ArrayList<>(submissionRepository.findByMentorIdAndStatus(mentorId, SubmissionStatus.PENDING, PageRequest.of(0, 1000)).getContent());
        if (mentor != null && mentor.getDepartmentId() != null) {
            List<User> deptStudents = userRepository.findByDepartmentIdAndRole(mentor.getDepartmentId(), com.sapt.common.enums.UserRole.STUDENT);
            List<String> studentIds = deptStudents.stream().map(User::getId).collect(Collectors.toList());
            if (!studentIds.isEmpty()) {
                List<Submission> extra = submissionRepository.findByStudentIdInAndStatus(studentIds, SubmissionStatus.PENDING);
                Set<String> existingIds = list.stream().map(Submission::getId).collect(Collectors.toSet());
                for (Submission s : extra) {
                    if (!existingIds.contains(s.getId())) {
                        list.add(s);
                    }
                }
            }
        }
        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SubmissionDto.SubmissionResponse> getMentorPendingSubmissions(String mentorId, Pageable pageable) {
        Page<Submission> page = submissionRepository.findByMentorIdAndStatus(mentorId, SubmissionStatus.PENDING, pageable);
        List<SubmissionDto.SubmissionResponse> mapped = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageImpl<>(mapped, pageable, page.getTotalElements());
    }

    @Override
    @Transactional
    public void reviewSubmission(String reviewerId, String submissionId, SubmissionDto.ReviewSubmissionRequest request) {
        log.info("Reviewing submission {} by reviewer {}", submissionId, reviewerId);
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> SaptException.notFound("Submission not found"));

        if (!submission.getMentorId().equals(reviewerId)) {
            // Also allow HOD review if department matches
            User reviewer = userRepository.findById(reviewerId)
                    .orElseThrow(() -> SaptException.notFound("Reviewer not found"));
            User student = userRepository.findById(submission.getStudentId())
                    .orElseThrow(() -> SaptException.notFound("Student not found"));
            
            boolean isDeptHod = reviewer.getRole() == com.sapt.common.enums.UserRole.HOD 
                    && reviewer.getDepartmentId() != null 
                    && reviewer.getDepartmentId().equals(student.getDepartmentId());
                    
            if (!isDeptHod) {
                throw SaptException.forbidden("You are not authorized to review this submission");
            }
        }

        submission.setStatus(request.getStatus());
        submission.setReviewText(request.getReview());
        if (request.getStatus() == SubmissionStatus.REJECTED) {
            submission.setAwardedCredits(0);
            // Store the 10%-ceiling penalty for credit snapshot deduction
            int penalty = request.getCreditPenalty() != null ? request.getCreditPenalty() : 0;
            submission.setCreditPenalty(penalty);
            log.info("Submission {} rejected. Credit penalty applied: {} pts", submissionId, penalty);
        } else {
            submission.setAwardedCredits(request.getCredits() != null ? request.getCredits() : 0);
            submission.setCreditPenalty(0);
        }
        submission.setReviewedAt(LocalDateTime.now());
        
        submissionRepository.save(submission);

        // Recalculate student credit snapshot
        recalculateCreditSnapshot(submission.getStudentId());

        // Notify student asynchronously
        userRepository.findById(submission.getStudentId()).ifPresent(student -> {
            notificationService.notifySubmissionStatusChange(
                    student.getEmail(),
                    student.getName(),
                    submission.getTitle(),
                    request.getStatus().name(),
                    request.getReview()
            );
        });
    }

    @Override
    @Transactional
    public void withdrawSubmission(String studentId, String submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> SaptException.notFound("Submission not found"));

        if (!submission.getStudentId().equals(studentId)) {
            throw SaptException.forbidden("You cannot withdraw other students' submissions");
        }

        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw SaptException.badRequest("You can only withdraw pending submissions");
        }

        submissionRepository.delete(submission);
        
        // Clean up files stored in MongoDB
        try {
            mongoSubmissionFileRepository.deleteBySubmissionId(submissionId);
        } catch (Exception e) {
            log.error("Failed to delete submission files from MongoDB for submission {}: {}", submissionId, e.getMessage());
        }

        // Recalculate student credit snapshot
        recalculateCreditSnapshot(studentId);
    }

    private SubmissionDto.SubmissionResponse mapToResponse(Submission s) {
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
        // Resolve custom-category flag so mentor UI can show credits input
        boolean isCustom = s.getCategoryId() != null &&
                activityCategoryRepository.findById(s.getCategoryId())
                        .map(ActivityCategory::isCustom).orElse(false);
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

    private void recalculateCreditSnapshot(String studentId) {
        log.info("Recalculating credit snapshot for student: {}", studentId);

        com.sapt.student.entity.StudentCreditSnapshot snapshot = studentCreditSnapshotRepository.findByStudentId(studentId)
                .orElseGet(() -> com.sapt.student.entity.StudentCreditSnapshot.builder()
                        .studentId(studentId)
                        .build());

        List<Submission> submissions = submissionRepository.findByStudentIdOrderBySubmittedAtDesc(studentId);
        int approvedCount = 0;
        int rejectedCount = 0;
        int pendingCount = 0;
        int totalCredits = 0;
        int totalPenalty = 0;

        for (Submission s : submissions) {
            if (s.getStatus() == SubmissionStatus.APPROVED) {
                approvedCount++;
                totalCredits += s.getAwardedCredits();
            } else if (s.getStatus() == SubmissionStatus.REJECTED) {
                rejectedCount++;
                // Always compute penalty dynamically from suggestedCredits so that
                // old rejections (stored creditPenalty=0 before this feature) are
                // correctly deducted. Formula: ceil(suggestedCredits * 10%).
                int penalty = (int) Math.ceil(s.getSuggestedCredits() * 0.10);
                totalPenalty += penalty;
                // Also persist the penalty so the frontend can display it
                if (s.getCreditPenalty() != penalty) {
                    s.setCreditPenalty(penalty);
                    submissionRepository.save(s);
                }
            } else if (s.getStatus() == SubmissionStatus.PENDING) {
                pendingCount++;
            }
        }

        // Subtract penalties from approved credits; floor at 0
        totalCredits = Math.max(0, totalCredits - totalPenalty);
        log.info("Student {}: approvedCredits={}, totalPenalty={}, netCredits={}",
                studentId, totalCredits + totalPenalty, totalPenalty, totalCredits);

        // Star / badge thresholds mapping
        int stars = 0;
        String badge = "Beginner";
        List<com.sapt.student.entity.StarThreshold> thresholds = starThresholdRepository.findAll();
        thresholds.sort(Comparator.comparing(com.sapt.student.entity.StarThreshold::getMinCredits));
        for (com.sapt.student.entity.StarThreshold t : thresholds) {
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
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionDto.FileDownloadResponse downloadFile(String path) {
        log.info("Downloading file from path: {}", path);
        if (path == null || path.equals("#") || path.isBlank()) {
            throw SaptException.notFound("File was not stored successfully. This is a placeholder path because MongoDB was unreachable during upload.");
        }
        if (!path.startsWith("mongodb://")) {
            throw SaptException.badRequest("Invalid file path");
        }
        
        String mongoId = path.substring("mongodb://".length());
        com.sapt.submission.entity.MongoSubmissionFile mongoFile = mongoSubmissionFileRepository.findById(mongoId)
                .orElseThrow(() -> SaptException.notFound("File not found in MongoDB"));
                
        String base64 = mongoFile.getBase64Data();
        if (base64 != null && base64.contains(",")) {
            base64 = base64.split(",")[1];
        }
        
        byte[] content = (base64 != null) ? java.util.Base64.getDecoder().decode(base64) : new byte[0];
        
        SubmissionDto.FileDownloadResponse response = new SubmissionDto.FileDownloadResponse();
        response.setContent(content);
        response.setContentType(mongoFile.getMimeType());
        response.setFilename(mongoFile.getOriginalFilename());
        return response;
    }

    private String detectMimeType(String filename) {
        if (filename == null) return "application/octet-stream";
        String lower = filename.toLowerCase();
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".ppt")) return "application/vnd.ms-powerpoint";
        if (lower.endsWith(".pptx")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        if (lower.endsWith(".doc")) return "application/msword";
        if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (lower.endsWith(".xls")) return "application/vnd.ms-excel";
        if (lower.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        if (lower.endsWith(".csv")) return "text/csv";
        return "application/octet-stream";
    }

    private long calculateBytes(String base64) {
        if (base64 == null) return 0;
        int commaIndex = base64.indexOf(',');
        String pureBase64 = commaIndex >= 0 ? base64.substring(commaIndex + 1) : base64;
        return (pureBase64.length() * 3L / 4L);
    }
}
