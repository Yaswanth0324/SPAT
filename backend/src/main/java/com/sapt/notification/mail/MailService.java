package com.sapt.notification.mail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * ============================================================
 * MailService - SMTP Email Sender
 * ============================================================
 * Handles all outgoing email communication in SAPT.
 *
 * Responsibilities:
 *  - Send plain text emails
 *  - Send HTML template emails
 *  - Used by: OtpMailService, NotificationService
 *
 * TODO (Notification Team):
 *  - Implement sendHtmlMail() with HTML body support
 *  - Implement sendPlainMail() for simple text emails
 *  - Add retry logic for failed sends
 *  - Add async sending with @Async annotation
 * ============================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    /**
     * Sends an HTML email.
     *
     * @param to      Recipient email address
     * @param subject Email subject line
     * @param htmlBody HTML content of the email body
     *
     * TODO: Implement this method:
     *  1. Create MimeMessage using mailSender.createMimeMessage()
     *  2. Use MimeMessageHelper with multipart=true, encoding=UTF-8
     *  3. Set to, subject, and htmlBody (setHtml=true)
     *  4. Call mailSender.send(message)
     *  5. Log success or catch MessagingException
     */
    public void sendHtmlMail(String to, String subject, String htmlBody) {
        // TODO: Implement HTML mail sending
        //
        // try {
        //     MimeMessage message = mailSender.createMimeMessage();
        //     MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        //     helper.setTo(to);
        //     helper.setSubject(subject);
        //     helper.setText(htmlBody, true);
        //     mailSender.send(message);
        //     log.info("HTML email sent to: {}", to);
        // } catch (MessagingException e) {
        //     log.error("Failed to send email to {}: {}", to, e.getMessage());
        //     throw new SaptException("Failed to send email", HttpStatus.INTERNAL_SERVER_ERROR);
        // }

        log.warn("MailService.sendHtmlMail() - NOT YET IMPLEMENTED. Recipient: {}", to);
    }

    /**
     * Sends a plain text email.
     *
     * @param to      Recipient email address
     * @param subject Email subject line
     * @param text    Plain text content
     *
     * TODO: Implement this method
     */
    public void sendPlainMail(String to, String subject, String text) {
        // TODO: Implement plain text mail sending
        log.warn("MailService.sendPlainMail() - NOT YET IMPLEMENTED. Recipient: {}", to);
    }
}
