package com.sapt.notification;

import com.sapt.notification.mail.MailService;
import com.sapt.notification.otp.OtpMailService;
import com.sapt.notification.templates.MailTemplates;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * ============================================================
 * NotificationService - Central Notification Dispatcher
 * ============================================================
 * Single entry point for all notification-related operations
 * used across modules (auth, submission, mentor, etc.).
 *
 * All methods are @Async — fire-and-forget.
 * Failures are logged but do NOT propagate to the caller.
 *
 * Other modules should inject this service to send notifications.
 * Do NOT inject MailService or OtpMailService directly from
 * other modules — always go through NotificationService.
 * ============================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final MailService     mailService;
    private final OtpMailService  otpMailService;

    // ============================================================
    // OTP NOTIFICATIONS (used by Auth module)
    // ============================================================

    /**
     * Sends an email verification OTP to the newly registered user.
     *
     * @param email    Recipient email
     * @param fullName Recipient's full name (shown in email body)
     * @param otp      The 6-digit OTP
     */
    @Async
    public void sendEmailVerificationOtp(String email, String fullName, String otp) {
        try {
            otpMailService.sendEmailVerificationOtp(email, fullName, otp);
        } catch (Exception e) {
            log.error("Failed to dispatch email verification OTP to {}: {}", email, e.getMessage());
        }
    }

    /**
     * Sends a password reset OTP email.
     *
     * @param email Recipient email
     * @param otp   The 6-digit OTP
     */
    @Async
    public void sendPasswordResetOtp(String email, String otp) {
        try {
            otpMailService.sendPasswordResetOtp(email, otp);
        } catch (Exception e) {
            log.error("Failed to dispatch password reset OTP to {}: {}", email, e.getMessage());
        }
    }

    // ============================================================
    // WELCOME EMAIL (used by Auth module after registration)
    // ============================================================

    /**
     * Sends a welcome email to a newly registered user.
     *
     * @param userEmail Recipient email address
     * @param fullName  Recipient's full name
     * @param role      The user's role (e.g., "STUDENT", "MENTOR")
     */
    @Async
    public void sendWelcomeEmail(String userEmail, String fullName, String role) {
        try {
            String subject  = "Welcome to SAPT - Student Activity Point Tracker";
            String htmlBody = MailTemplates.buildWelcomeEmail(fullName, role);
            mailService.sendHtmlMail(userEmail, subject, htmlBody);
            log.info("Welcome email sent to: {}", userEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", userEmail, e.getMessage());
        }
    }

    // ============================================================
    // SUBMISSION NOTIFICATIONS (used by Submission/Mentor module)
    // ============================================================

    /**
     * Notifies a student when their submission status changes
     * (e.g., APPROVED, REJECTED, NEEDS_REVISION).
     *
     * Called by: Submission/Review service after mentor action
     *
     * @param studentEmail  Student's email address
     * @param studentName   Student's display name
     * @param activityTitle Title of the submitted activity
     * @param newStatus     New status string (e.g., "APPROVED")
     * @param remarks       Reviewer's remarks (nullable)
     */
    @Async
    public void notifySubmissionStatusChange(
            String studentEmail, String studentName,
            String activityTitle, String newStatus, String remarks) {
        try {
            String subject  = "SAPT - Your submission has been " + capitalize(newStatus);
            String htmlBody = MailTemplates.buildSubmissionStatusEmail(
                    studentName, activityTitle, newStatus, remarks);
            mailService.sendHtmlMail(studentEmail, subject, htmlBody);
            log.info("Submission status notification sent to: {} | status: {}", studentEmail, newStatus);
        } catch (Exception e) {
            log.error("Failed to send submission notification to {}: {}", studentEmail, e.getMessage());
        }
    }

    /**
     * Notifies a mentor when a new submission is assigned to them for review.
     *
     * Called by: Submission service when student submits an activity
     *
     * @param mentorEmail   Mentor's email address
     * @param mentorName    Mentor's display name
     * @param studentName   Student's display name
     * @param activityTitle Title of the activity submitted
     */
    @Async
    public void notifyMentorNewSubmission(
            String mentorEmail, String mentorName,
            String studentName, String activityTitle) {
        try {
            String subject  = "SAPT - New submission from " + studentName + " awaits your review";
            String htmlBody = MailTemplates.buildMentorNewSubmissionEmail(
                    mentorName, studentName, activityTitle);
            mailService.sendHtmlMail(mentorEmail, subject, htmlBody);
            log.info("Mentor new submission notification sent to: {}", mentorEmail);
        } catch (Exception e) {
            log.error("Failed to send mentor submission notification to {}: {}", mentorEmail, e.getMessage());
        }
    }

    // ============================================================
    // PRIVATE HELPERS
    // ============================================================

    private String capitalize(String input) {
        if (input == null || input.isEmpty()) return input;
        return input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase();
    }
}
