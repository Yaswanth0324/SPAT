package com.sapt.notification.otp;

import com.sapt.notification.mail.MailService;
import com.sapt.notification.templates.MailTemplates;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * ============================================================
 * OtpMailService - OTP Email Notification Service
 * ============================================================
 * Responsible for sending OTP emails for:
 *  - Email verification (during registration)
 *  - Password reset (forgot password flow)
 *
 * Methods are @Async — they run in a background thread so
 * that the API response is not delayed by mail sending.
 * ============================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OtpMailService {

    private final MailService mailService;

    /**
     * Sends an OTP email for email address verification.
     * Called after user registration.
     *
     * @param toEmail  Recipient's email address
     * @param fullName Recipient's display name (used in email body)
     * @param otp      The 6-digit OTP string
     */
    @Async
    public void sendEmailVerificationOtp(String toEmail, String fullName, String otp) {
        try {
            String subject  = "SAPT - Verify Your Email Address";
            String htmlBody = MailTemplates.buildOtpEmail(otp, "Email Verification", fullName);
            mailService.sendHtmlMail(toEmail, subject, htmlBody);
            log.info("Email verification OTP sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email verification OTP to {}: {}", toEmail, e.getMessage());
        }
    }

    /**
     * Sends an OTP email for password reset.
     * Called when user requests forgot-password flow.
     *
     * @param toEmail Recipient's email address
     * @param otp     The 6-digit OTP string
     */
    @Async
    public void sendPasswordResetOtp(String toEmail, String otp) {
        try {
            String subject  = "SAPT - Password Reset OTP";
            String htmlBody = MailTemplates.buildOtpEmail(otp, "Password Reset", null);
            mailService.sendHtmlMail(toEmail, subject, htmlBody);
            log.info("Password reset OTP sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset OTP to {}: {}", toEmail, e.getMessage());
        }
    }
}
