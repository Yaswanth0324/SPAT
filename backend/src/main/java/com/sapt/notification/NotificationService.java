package com.sapt.notification;

import com.sapt.notification.mail.MailService;
import com.sapt.notification.templates.MailTemplates;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * ============================================================
 * NotificationService - Central Notification Dispatcher
 * ============================================================
 * Single entry point for all notification-related operations.
 * Use @Async methods so notifications don't block main API response.
 *
 * TODO (Notification Team):
 *  - Implement all notification methods
 *  - Add @EnableAsync to a config class to enable async
 *  - All methods should be fire-and-forget (void, @Async)
 * ============================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final MailService mailService;

    /**
     * Notifies student when their submission status changes.
     * TODO: Implement
     */
    @Async
    public void notifySubmissionStatusChange(
            String studentEmail, String studentName,
            String activityTitle, String newStatus, String remarks) {
        // TODO: Build email using MailTemplates.buildSubmissionStatusEmail()
        // TODO: Call mailService.sendHtmlMail()
        log.warn("NotificationService.notifySubmissionStatusChange() - NOT YET IMPLEMENTED");
    }

    /**
     * Notifies mentor when a new submission is assigned.
     * TODO: Implement
     */
    @Async
    public void notifyMentorNewSubmission(
            String mentorEmail, String mentorName,
            String studentName, String activityTitle) {
        // TODO: Implement
        log.warn("NotificationService.notifyMentorNewSubmission() - NOT YET IMPLEMENTED");
    }

    /**
     * Sends welcome email to newly registered user.
     * TODO: Implement
     */
    @Async
    public void sendWelcomeEmail(String userEmail, String fullName, String role) {
        // TODO: Build email using MailTemplates.buildWelcomeEmail()
        // TODO: Call mailService.sendHtmlMail()
        log.warn("NotificationService.sendWelcomeEmail() - NOT YET IMPLEMENTED");
    }
}
