package com.sapt.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * ============================================================
 * Session — Refresh Token / Login Session Tracker
 * ============================================================
 * Tracks active refresh token sessions for each user.
 * Enables features such as:
 *  - "Logout from all devices" (revoke all sessions)
 *  - Refresh token rotation
 *  - Active session audit log
 *
 * Flow:
 *   User logs in       → Session row created (revoked = false)
 *   User refreshes JWT → refresh_token_hash updated (rotation)
 *   User logs out      → Session.revoked = true
 *   Token expires      → Session.revoked = true (or pruned by scheduler)
 *
 * user_id → users.id (CASCADE DELETE)
 *
 * Table: sessions
 * ============================================================
 */
@Entity
@Table(
    name = "sessions",
    indexes = {
        @Index(name = "idx_sessions_user",    columnList = "user_id"),
        @Index(name = "idx_sessions_token",   columnList = "refresh_token_hash"),
        @Index(name = "idx_sessions_expires", columnList = "expires_at")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Session {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false, columnDefinition = "CHAR(36)")
    private String id;

    // ─── User Reference ───────────────────────────────────────
    /** FK → users.id (CASCADE DELETE) */
    @Column(name = "user_id", nullable = false, columnDefinition = "CHAR(36)")
    private String userId;

    // ─── Token ────────────────────────────────────────────────
    /**
     * BCrypt hash of the refresh token.
     * Never store the raw token — only its hash.
     * Indexed for lookup during token refresh validation.
     */
    @Column(name = "refresh_token_hash", nullable = false, length = 255)
    private String refreshTokenHash;

    // ─── Device / Client Info ─────────────────────────────────
    /** Browser or device description (e.g., "Chrome on Windows 11") */
    @Column(name = "device_info", length = 500)
    private String deviceInfo;

    /** Client IP address (IPv4 or IPv6) */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    // ─── Lifecycle ────────────────────────────────────────────
    /** When this refresh token expires */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /**
     * Whether this session has been explicitly revoked.
     * true  → this session is invalid regardless of expiry
     * false → active (valid until expires_at)
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean revoked = false;

    // ─── Timestamps ──────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;
}
