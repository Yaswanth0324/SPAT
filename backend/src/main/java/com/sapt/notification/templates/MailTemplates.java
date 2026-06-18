package com.sapt.notification.templates;

/**
 * ============================================================
 * MailTemplates - HTML Email Template Builder
 * ============================================================
 * Static factory methods that return fully-formed HTML email
 * strings, ready to be passed to MailService.sendHtmlMail().
 *
 * Design rules:
 *  - All CSS is INLINE (email clients don't support <style> tags)
 *  - Dark themed, branded with SAPT orange (#FF6B35)
 *  - Mobile-responsive with max-width container
 *  - No external image or font links (email clients block them)
 * ============================================================
 */
public final class MailTemplates {

    private MailTemplates() {} // Utility class — no instantiation

    // ---- Brand design tokens --------------------------------
    private static final String PRIMARY     = "#FF6B35";
    private static final String PRIMARY_DIM = "#e05a27";
    private static final String BG_OUTER    = "#0f0f0f";
    private static final String BG_CARD     = "#1c1c1e";
    private static final String BG_FOOTER   = "#111111";
    private static final String TEXT_MAIN   = "#f0f0f0";
    private static final String TEXT_MUTED  = "#888888";
    private static final String BORDER      = "#2c2c2e";
    private static final String SUCCESS_CLR = "#30d158";
    private static final String DANGER_CLR  = "#ff453a";
    private static final String WARN_CLR    = "#ffd60a";

    // --------------------------------------------------------
    // SHARED LAYOUT HELPERS
    // --------------------------------------------------------

    /** Outer wrapper + card open */
    private static String cardOpen(String preheader) {
        return "<!DOCTYPE html>"
            + "<html lang='en'>"
            + "<head>"
            +   "<meta charset='UTF-8'>"
            +   "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
            +   "<title>SAPT Notification</title>"
            + "</head>"
            + "<body style='"
            +   "margin:0; padding:0; background-color:" + BG_OUTER + ";"
            +   "font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;"
            + "'>"
            // Preheader text (hidden, shown in email client previews)
            + "<div style='display:none; max-height:0; overflow:hidden; color:" + BG_OUTER + ";'>"
            +   preheader
            + "</div>"
            + "<table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color:" + BG_OUTER + "; padding: 40px 16px;'>"
            + "<tr><td align='center'>"
            + "<table width='100%' cellpadding='0' cellspacing='0' border='0' style='"
            +   "max-width:560px; background-color:" + BG_CARD + ";"
            +   "border-radius:16px; border:1px solid " + BORDER + ";"
            + "'>"
            // Header bar
            + "<tr>"
            + "<td style='background: linear-gradient(135deg," + PRIMARY + " 0%," + PRIMARY_DIM + " 100%); "
            +       "padding: 28px 32px; border-radius:16px 16px 0 0; text-align:center;'>"
            + "<p style='margin:0; font-size:28px; font-weight:800; color:#ffffff; letter-spacing:-0.5px;'>SAPT</p>"
            + "<p style='margin:4px 0 0; font-size:12px; color:rgba(255,255,255,0.8); letter-spacing:1px; text-transform:uppercase;'>"
            +   "Student Activity Point Tracker"
            + "</p>"
            + "</td>"
            + "</tr>"
            // Card body open
            + "<tr><td style='padding: 32px 32px 24px;'>";
    }

    /** Card close + footer */
    private static String cardClose() {
        return "</td></tr>"
            // Footer
            + "<tr>"
            + "<td style='background-color:" + BG_FOOTER + "; padding:20px 32px; "
            +       "border-radius:0 0 16px 16px; border-top:1px solid " + BORDER + "; text-align:center;'>"
            + "<p style='margin:0; font-size:12px; color:" + TEXT_MUTED + ";'>"
            +   "This is an automated email from SAPT. Please do not reply to this message."
            + "</p>"
            + "<p style='margin:8px 0 0; font-size:12px; color:" + TEXT_MUTED + ";'>"
            +   "&copy; 2025 SAPT &mdash; All rights reserved."
            + "</p>"
            + "</td>"
            + "</tr>"
            + "</table>"
            + "</td></tr>"
            + "</table>"
            + "</body></html>";
    }

    // --------------------------------------------------------
    // TEMPLATE 1: OTP EMAIL (Verification & Password Reset)
    // --------------------------------------------------------

    /**
     * Builds a branded OTP email.
     *
     * @param otp      The 6-digit OTP
     * @param purpose  Human-readable purpose string
     *                 (e.g., "Email Verification", "Password Reset")
     * @param fullName Optional: recipient's full name. Pass null to omit greeting.
     * @return HTML string ready to send
     */
    public static String buildOtpEmail(String otp, String purpose, String fullName) {
        String greeting = (fullName != null && !fullName.isBlank())
                ? "<p style='margin:0 0 16px; font-size:16px; color:" + TEXT_MAIN + ";'>Hi <strong>" + escapeHtml(fullName) + "</strong>,</p>"
                : "";

        String otpDigits = buildOtpDigitBoxes(otp);

        return cardOpen("Your " + purpose + " OTP is " + otp + " — valid for 10 minutes.")
            + greeting
            + "<p style='margin:0 0 24px; font-size:15px; color:" + TEXT_MAIN + "; line-height:1.6;'>"
            +   "Use the following One-Time Password (OTP) to complete your "
            +   "<strong style='color:" + PRIMARY + ";'>" + escapeHtml(purpose) + "</strong>:"
            + "</p>"
            // OTP digit boxes
            + "<div style='text-align:center; margin: 8px 0 28px;'>"
            +   otpDigits
            + "</div>"
            + "<p style='margin:0 0 8px; font-size:13px; color:" + TEXT_MUTED + "; text-align:center;'>"
            +   "&#128274;&nbsp; This OTP is valid for <strong style='color:" + TEXT_MAIN + ";'>10 minutes</strong>"
            + "</p>"
            + "<p style='margin:0 0 24px; font-size:13px; color:" + TEXT_MUTED + "; text-align:center;'>"
            +   "If you did not request this, you can safely ignore this email."
            + "</p>"
            // Divider
            + "<hr style='border:none; border-top:1px solid " + BORDER + "; margin:0;'>"
            + cardClose();
    }

    /** Generates styled individual digit boxes for the OTP */
    private static String buildOtpDigitBoxes(String otp) {
        StringBuilder boxes = new StringBuilder();
        for (char c : otp.toCharArray()) {
            boxes.append("<span style='"
                + "display:inline-block; width:44px; height:52px; line-height:52px;"
                + "font-size:26px; font-weight:800; color:" + PRIMARY + ";"
                + "background-color:" + BG_OUTER + "; border:2px solid " + PRIMARY + ";"
                + "border-radius:10px; margin:0 4px; text-align:center;"
                + "letter-spacing:0;"
                + "'>" + c + "</span>");
        }
        return boxes.toString();
    }

    // --------------------------------------------------------
    // TEMPLATE 2: WELCOME EMAIL
    // --------------------------------------------------------

    /**
     * Builds a welcome email for newly registered users.
     *
     * @param fullName The user's full name
     * @param role     The user's role (e.g., "STUDENT", "MENTOR")
     * @return HTML email body string
     */
    public static String buildWelcomeEmail(String fullName, String role) {
        String roleLabel = formatRole(role);
        String roleColor = getRoleColor(role);

        return cardOpen("Welcome to SAPT, " + fullName + "! Your account is ready.")
            + "<p style='margin:0 0 16px; font-size:18px; font-weight:700; color:" + TEXT_MAIN + ";'>"
            +   "Welcome aboard, " + escapeHtml(fullName) + "! &#127881;"
            + "</p>"
            + "<p style='margin:0 0 20px; font-size:15px; color:" + TEXT_MUTED + "; line-height:1.6;'>"
            +   "Your account has been successfully created on SAPT. You're registered as:"
            + "</p>"
            // Role badge
            + "<div style='text-align:center; margin:0 0 24px;'>"
            + "<span style='"
            +   "display:inline-block; padding:10px 24px;"
            +   "background-color:" + roleColor + "22;"
            +   "border:1.5px solid " + roleColor + ";"
            +   "color:" + roleColor + "; font-size:14px; font-weight:700;"
            +   "border-radius:20px; letter-spacing:0.5px; text-transform:uppercase;"
            + "'>" + escapeHtml(roleLabel) + "</span>"
            + "</div>"
            + "<p style='margin:0 0 20px; font-size:15px; color:" + TEXT_MUTED + "; line-height:1.6;'>"
            +   "Please verify your email using the OTP sent in the previous email to activate your account."
            + "</p>"
            + "<hr style='border:none; border-top:1px solid " + BORDER + "; margin:0 0 0;'>"
            + cardClose();
    }

    // --------------------------------------------------------
    // TEMPLATE 3: SUBMISSION STATUS UPDATE (Student)
    // --------------------------------------------------------

    /**
     * Builds an email informing a student of their submission status change.
     *
     * @param studentName   Student's display name
     * @param activityTitle Title of the submitted activity
     * @param status        New status string (APPROVED, REJECTED, NEEDS_REVISION)
     * @param remarks       Reviewer's optional remarks
     * @return HTML email body string
     */
    public static String buildSubmissionStatusEmail(
            String studentName, String activityTitle, String status, String remarks) {

        String statusEmoji = getStatusEmoji(status);
        String statusColor = getStatusColor(status);
        String statusLabel = formatStatus(status);

        String remarksHtml = (remarks != null && !remarks.isBlank())
                ? "<div style='margin:16px 0 0; padding:14px 16px; background-color:" + BG_OUTER + ";"
                +       "border-left:3px solid " + PRIMARY + "; border-radius:0 8px 8px 0;'>"
                +   "<p style='margin:0 0 4px; font-size:12px; color:" + TEXT_MUTED + "; text-transform:uppercase; letter-spacing:0.5px;'>Reviewer's Remarks</p>"
                +   "<p style='margin:0; font-size:14px; color:" + TEXT_MAIN + "; line-height:1.5;'>" + escapeHtml(remarks) + "</p>"
                + "</div>"
                : "";

        return cardOpen(statusEmoji + " Your submission has been " + statusLabel + ".")
            + "<p style='margin:0 0 16px; font-size:16px; color:" + TEXT_MAIN + ";'>Hi <strong>" + escapeHtml(studentName) + "</strong>,</p>"
            + "<p style='margin:0 0 20px; font-size:15px; color:" + TEXT_MUTED + "; line-height:1.6;'>"
            +   "Your activity submission has been reviewed. Here's the update:"
            + "</p>"
            // Activity card
            + "<div style='padding:16px; background-color:" + BG_OUTER + "; border-radius:10px; border:1px solid " + BORDER + "; margin:0 0 20px;'>"
            +   "<p style='margin:0 0 6px; font-size:12px; color:" + TEXT_MUTED + "; text-transform:uppercase; letter-spacing:0.5px;'>Activity</p>"
            +   "<p style='margin:0 0 14px; font-size:15px; font-weight:600; color:" + TEXT_MAIN + ";'>" + escapeHtml(activityTitle) + "</p>"
            +   "<p style='margin:0 0 6px; font-size:12px; color:" + TEXT_MUTED + "; text-transform:uppercase; letter-spacing:0.5px;'>Status</p>"
            +   "<span style='display:inline-block; padding:5px 14px; background-color:" + statusColor + "22; "
            +       "border:1px solid " + statusColor + "; color:" + statusColor + "; "
            +       "font-size:13px; font-weight:700; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;'>"
            +       statusEmoji + " " + statusLabel
            +   "</span>"
            +   remarksHtml
            + "</div>"
            + "<p style='margin:0 0 24px; font-size:14px; color:" + TEXT_MUTED + "; line-height:1.6;'>"
            +   "Log in to SAPT to view full details and track your activity points."
            + "</p>"
            + "<hr style='border:none; border-top:1px solid " + BORDER + "; margin:0;'>"
            + cardClose();
    }

    // --------------------------------------------------------
    // TEMPLATE 4: MENTOR NEW SUBMISSION ALERT
    // --------------------------------------------------------

    /**
     * Builds an email alerting a mentor about a new submission pending review.
     *
     * @param mentorName    Mentor's display name
     * @param studentName   Student's display name
     * @param activityTitle Title of the activity submitted
     * @return HTML email body string
     */
    public static String buildMentorNewSubmissionEmail(
            String mentorName, String studentName, String activityTitle) {

        return cardOpen("Action required: " + studentName + " submitted an activity for your review.")
            + "<p style='margin:0 0 16px; font-size:16px; color:" + TEXT_MAIN + ";'>Hi <strong>" + escapeHtml(mentorName) + "</strong>,</p>"
            + "<p style='margin:0 0 20px; font-size:15px; color:" + TEXT_MUTED + "; line-height:1.6;'>"
            +   "A student has submitted an activity that is awaiting your review:"
            + "</p>"
            // Info card
            + "<div style='padding:16px; background-color:" + BG_OUTER + "; border-radius:10px; border:1px solid " + BORDER + "; margin:0 0 24px;'>"
            +   "<p style='margin:0 0 6px; font-size:12px; color:" + TEXT_MUTED + "; text-transform:uppercase; letter-spacing:0.5px;'>Student</p>"
            +   "<p style='margin:0 0 14px; font-size:15px; font-weight:600; color:" + TEXT_MAIN + ";'>" + escapeHtml(studentName) + "</p>"
            +   "<p style='margin:0 0 6px; font-size:12px; color:" + TEXT_MUTED + "; text-transform:uppercase; letter-spacing:0.5px;'>Activity</p>"
            +   "<p style='margin:0; font-size:15px; font-weight:600; color:" + TEXT_MAIN + ";'>" + escapeHtml(activityTitle) + "</p>"
            + "</div>"
            + "<p style='margin:0 0 24px; font-size:14px; color:" + TEXT_MUTED + "; line-height:1.6;'>"
            +   "Please log in to SAPT to review this submission and take action."
            + "</p>"
            + "<hr style='border:none; border-top:1px solid " + BORDER + "; margin:0;'>"
            + cardClose();
    }

    // --------------------------------------------------------
    // PRIVATE HELPERS
    // --------------------------------------------------------

    /** Basic HTML escape to prevent XSS in email content */
    private static String escapeHtml(String input) {
        if (input == null) return "";
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private static String formatRole(String role) {
        if (role == null) return "User";
        return switch (role.toUpperCase()) {
            case "STUDENT"       -> "Student";
            case "MENTOR"        -> "Faculty Mentor";
            case "HOD"           -> "Head of Department";
            case "COLLEGE_ADMIN" -> "College Admin";
            case "SYSTEM_ADMIN"  -> "System Admin";
            default              -> role;
        };
    }

    private static String getRoleColor(String role) {
        if (role == null) return PRIMARY;
        return switch (role.toUpperCase()) {
            case "STUDENT"       -> "#30d158"; // green
            case "MENTOR"        -> "#0a84ff"; // blue
            case "HOD"           -> "#bf5af2"; // purple
            case "COLLEGE_ADMIN" -> "#ff9f0a"; // amber
            case "SYSTEM_ADMIN"  -> "#ff453a"; // red
            default              -> PRIMARY;
        };
    }

    private static String formatStatus(String status) {
        if (status == null) return "Updated";
        return switch (status.toUpperCase()) {
            case "APPROVED"         -> "Approved";
            case "REJECTED"         -> "Rejected";
            case "PENDING"          -> "Pending Review";
            case "NEEDS_REVISION"   -> "Needs Revision";
            default                 -> status;
        };
    }

    private static String getStatusColor(String status) {
        if (status == null) return TEXT_MUTED;
        return switch (status.toUpperCase()) {
            case "APPROVED"         -> SUCCESS_CLR;
            case "REJECTED"         -> DANGER_CLR;
            case "NEEDS_REVISION"   -> WARN_CLR;
            default                 -> TEXT_MUTED;
        };
    }

    private static String getStatusEmoji(String status) {
        if (status == null) return "📋";
        return switch (status.toUpperCase()) {
            case "APPROVED"         -> "✅";
            case "REJECTED"         -> "❌";
            case "NEEDS_REVISION"   -> "✏️";
            default                 -> "📋";
        };
    }
}
