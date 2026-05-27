package com.sapt.notification.otp;

import com.sapt.notification.mail.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * ============================================================
 * OtpMailService - OTP Email Notification Service
 * ============================================================
 * Responsible for sending OTP emails for:
 *  - Email verification (during registration)
 *  - Password reset (forgot password flow)
 *
 * TODO (Notification Team):
 *  - Implement sendEmailVerificationOtp()
 *  - Implement sendPasswordResetOtp()
 *  - Use MailTemplates to build HTML content
 *  - Use MailService to send the email
 * ============================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OtpMailService {

    private final MailService mailService;

    /**
     * Sends an OTP email for email verification.
     *
     * @param toEmail  The recipient's email address
     * @param otp      The 6-digit OTP to include in the email
     *
     * TODO: Implement this method:
     *  1. Build HTML body using MailTemplates.otpTemplate(otp, purpose)
     *  2. Call mailService.sendHtmlMail(toEmail, subject, htmlBody)
     */
    public void sendEmailVerificationOtp(String toEmail, String otp) {
        // TODO: Build HTML template and send
        // String subject = "SAPT - Email Verification OTP";
        // String htmlBody = MailTemplates.buildOtpEmail(otp, "Email Verification");
        // mailService.sendHtmlMail(toEmail, subject, htmlBody);
        log.warn("OtpMailService.sendEmailVerificationOtp() - NOT YET IMPLEMENTED for: {}", toEmail);
    }

    /**
     * Sends an OTP email for password reset.
     *
     * @param toEmail  The recipient's email address
     * @param otp      The 6-digit OTP to include in the email
     *
     * TODO: Implement this method
     */
    public void sendPasswordResetOtp(String toEmail, String otp) {
        // TODO: Build HTML template and send
        // String subject = "SAPT - Password Reset OTP";
        // String htmlBody = MailTemplates.buildOtpEmail(otp, "Password Reset");
        // mailService.sendHtmlMail(toEmail, subject, htmlBody);
        log.warn("OtpMailService.sendPasswordResetOtp() - NOT YET IMPLEMENTED for: {}", toEmail);
    }
}
