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

    /**
     * Builds an HTML welcome email for newly created College Admins.
     */
    public static String buildCollegeAdminWelcomeEmail(
            String fullName, String email, String password, String employeeId, String verifyLink) {
        return "<html><body style='font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif; background-color: #fafafa; margin: 0; padding: 20px; color: #333333;'>"
            + "<div style='max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #fed7aa; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);'>"
            + "<div style='background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 30px; text-align: center; color: #ffffff;'>"
            + "<h1 style='margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px;'>SAPT</h1>"
            + "<p style='margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;'>Student Performance & Activity Tracker</p>"
            + "</div>"
            + "<div style='padding: 30px; line-height: 1.6;'>"
            + "<h2 style='color: #ea580c; margin-top: 0;'>Welcome, " + fullName + "!</h2>"
            + "<p>Your College Administrator account has been registered successfully on SAPT by the Platform Admin.</p>"
            + "<p style='margin-bottom: 25px;'>Please find your initial login credentials and administrator details below:</p>"
            
            + "<div style='background-color: #fff7ed; border: 1px dashed #fdba74; border-radius: 12px; padding: 20px; margin-bottom: 30px;'>"
            + "<table style='width: 100%; border-collapse: collapse;'>"
            + "<tr><td style='padding: 6px 0; font-weight: 600; color: #9a3412; width: 120px;'>Official Email:</td><td style='padding: 6px 0; font-family: monospace; font-size: 14px;'>" + email + "</td></tr>"
            + "<tr><td style='padding: 6px 0; font-weight: 600; color: #9a3412;'>Password:</td><td style='padding: 6px 0; font-family: monospace; font-size: 14px; font-weight: bold; color: #ea580c;'>" + password + "</td></tr>"
            + "<tr><td style='padding: 6px 0; font-weight: 600; color: #9a3412;'>Employee ID:</td><td style='padding: 6px 0; font-family: monospace; font-size: 14px;'>" + (employeeId != null && !employeeId.isEmpty() ? employeeId : "Not Assigned") + "</td></tr>"
            + "<tr><td style='padding: 6px 0; font-weight: 600; color: #9a3412;'>Access Role:</td><td style='padding: 6px 0; font-weight: 600; color: #475569;'>COLLEGE_ADMIN</td></tr>"
            + "</table>"
            + "</div>"

            + "<p style='margin-bottom: 30px;'>To activate your account and start managing your institution, please verify your email address by clicking the button below:</p>"
            + "<div style='text-align: center; margin-bottom: 30px;'>"
            + "<a href='" + verifyLink + "' style='display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; font-weight: bold; padding: 14px 35px; border-radius: 10px; font-size: 15px; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25); transition: background-color 0.2s;'>Verify &amp; Activate Account</a>"
            + "</div>"
            
            + "<p style='color: #64748b; font-size: 13px; border-top: 1px solid #f1f5f9; padding-top: 20px;'>Note: For security reasons, we strongly recommend that you change your password immediately after logging in for the first time.</p>"
            + "</div>"
            + "<div style='background-color: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9;'>"
            + "This is an automated security email from SAPT. Please do not reply directly to this message."
            + "</div>"
            + "</div>"
            + "</body></html>";
    }
}
