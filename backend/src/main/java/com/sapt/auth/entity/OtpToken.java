package com.sapt.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * ============================================================
 * OtpToken - OTP Verification Token Entity
 * ============================================================
 * Stores OTPs generated for email verification and
 * password reset flows.
 *
 * Table: otp_tokens
 *
 * TODO (Auth Team):
 *  - Implement OTP generation in AuthService
 *  - Implement OTP validation logic
 *  - Clean up expired OTPs with a scheduled job
 * ============================================================
 */
@Entity
@Table(name = "otp_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The email this OTP was sent to */
    @Column(nullable = false)
    private String email;

    /** The 6-digit OTP value */
    @Column(nullable = false)
    private String otpValue;

    /** Purpose of OTP: EMAIL_VERIFICATION or PASSWORD_RESET */
    @Column(nullable = false)
    private String purpose;

    /** Whether this OTP has already been used */
    @Column(nullable = false)
    private boolean used;

    /** When this OTP expires */
    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
