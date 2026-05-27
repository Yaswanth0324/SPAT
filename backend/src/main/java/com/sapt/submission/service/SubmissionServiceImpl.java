package com.sapt.submission.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * SubmissionServiceImpl - Submission service implementation.
 * TODO (Submission Team): Implement all SubmissionService methods here.
 * - Inject SubmissionRepository, StudentRepository, MentorRepository
 * - Inject NotificationService to notify mentor/student on status change
 * - Add @Transactional on write operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {
    // TODO: Inject dependencies
    // private final SubmissionRepository submissionRepository;
    // private final StudentRepository studentRepository;
    // private final NotificationService notificationService;
}
