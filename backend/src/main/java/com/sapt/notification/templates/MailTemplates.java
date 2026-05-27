package com.sapt.notification.templates;

/**
 * ============================================================
 * MailTemplates - HTML Email Template Builder
 * ============================================================
 * Provides static methods that return HTML email strings.
 * All templates must be responsive and branded for SAPT.
 *
 * TODO (Notification Team):
 *  - Implement buildOtpEmail() with branded HTML
 *  - Implement buildSubmissionStatusEmail() for review updates
 *  - Implement buildWelcomeEmail() for new registrations
 *  - Use inline CSS (no external stylesheets — email clients)
 * ============================================================
 */
public final class MailTemplates {

    // Prevent instantiation
    private MailTemplates() {}

    // Brand colors
    private static final String PRIMARY_COLOR  = "#FF6B35";
    private static final String BG_COLOR       = "#1a1a1a";
    private static final String TEXT_COLOR     = "#ffffff";

    /**
     * Builds an HTML email body for OTP delivery.
     *
     * @param otp     The OTP string (e.g. "482910")
     * @param purpose Human-readable purpose (e.g. "Email Verification")
     * @return HTML string ready to be sent as email body
     *
     * TODO: Implement with full branded HTML
     */
    public static String buildOtpEmail(String otp, String purpose) {
        // TODO: Replace this placeholder with actual branded HTML template
        return "<html><body style='font-family: Arial, sans-serif; background:" + BG_COLOR + "; color:" + TEXT_COLOR + "; padding: 40px;'>"
            + "<div style='max-width: 500px; margin: 0 auto; text-align: center;'>"
            + "<h1 style='color:" + PRIMARY_COLOR + ";'>SAPT</h1>"
            + "<h2>Student Activity Point Tracker</h2>"
            + "<p>" + purpose + " OTP:</p>"
            + "<div style='font-size: 36px; font-weight: bold; color:" + PRIMARY_COLOR + "; letter-spacing: 8px; padding: 20px;'>"
            + otp
            + "</div>"
            + "<p>This OTP is valid for <strong>10 minutes</strong>.</p>"
            + "<p style='color: #999; font-size: 12px;'>If you did not request this, please ignore this email.</p>"
            + "</div></body></html>";
    }

    /**
     * Builds an HTML email for submission status updates.
     *
     * @param studentName   Student's full name
     * @param activityTitle Title of the submitted activity
     * @param status        New status (e.g. "APPROVED", "REJECTED")
     * @param remarks       Reviewer remarks
     * @return HTML email body string
     *
     * TODO: Implement with full branded HTML
     */
    public static String buildSubmissionStatusEmail(
            String studentName, String activityTitle, String status, String remarks) {
        // TODO: Build proper HTML template
        return "<html><body style='font-family: Arial, sans-serif;'>"
            + "<h2>Hello " + studentName + ",</h2>"
            + "<p>Your submission <strong>" + activityTitle + "</strong> has been <strong>" + status + "</strong>.</p>"
            + (remarks != null ? "<p>Remarks: " + remarks + "</p>" : "")
            + "<p>Login to SAPT to view details.</p>"
            + "</body></html>";
    }

    /**
     * Builds a welcome email for newly registered users.
     *
     * @param fullName User's full name
     * @param role     User's role in the system
     * @return HTML email body string
     *
     * TODO: Implement with full branded HTML
     */
    public static String buildWelcomeEmail(String fullName, String role) {
        // TODO: Build proper HTML welcome template
        return "<html><body style='font-family: Arial, sans-serif;'>"
            + "<h2>Welcome to SAPT, " + fullName + "!</h2>"
            + "<p>Your account has been created with role: <strong>" + role + "</strong>.</p>"
            + "<p>Please verify your email to complete registration.</p>"
            + "</body></html>";
    }
}
