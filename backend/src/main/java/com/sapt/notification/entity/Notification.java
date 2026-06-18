package com.sapt.notification.entity;

import com.sapt.common.enums.NotificationType;
import com.sapt.common.enums.NotificationReferenceType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * ============================================================
 * Notification — In-System Notification Record
 * ============================================================
 * Stores all notifications sent within the SPARK system.
 * Used for the notification inbox/bell in each dashboard.
 *
 * recipient_id → users.id (who receives the notification)
 * sender_id    → users.id (who triggered it — nullable for system)
 *
 * reference_type + reference_id link the notification to the
 * entity that caused it (e.g., a submission, a user, etc.)
 *
 * Table: notifications
 * ============================================================
 */
@Entity
@Table(
    name = "notifications",
    indexes = {
        @Index(name = "idx_notifications_recipient", columnList = "recipient_id"),
        @Index(name = "idx_notifications_unread",    columnList = "recipient_id, is_read"),
        @Index(name = "idx_notifications_type",      columnList = "type"),
        @Index(name = "idx_notifications_created",   columnList = "created_at")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false, columnDefinition = "CHAR(36)")
    private String id;

    // ─── Participants ─────────────────────────────────────────
    /** FK → users.id — the user who receives this notification */
    @Column(name = "recipient_id", nullable = false, columnDefinition = "CHAR(36)")
    private String recipientId;

    /**
     * FK → users.id — the user who triggered this notification.
     * null for system-generated announcements.
     */
    @Column(name = "sender_id", columnDefinition = "CHAR(36)")
    private String senderId;

    // ─── Content ─────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private NotificationType type;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    // ─── Context Reference ────────────────────────────────────
    /**
     * Type of entity this notification references.
     * e.g., SUBMISSION, USER, COLLEGE, LOG
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", length = 20)
    private NotificationReferenceType referenceType;

    /**
     * UUID of the referenced entity.
     * e.g., submission_id when reference_type = SUBMISSION
     */
    @Column(name = "reference_id", columnDefinition = "CHAR(36)")
    private String referenceId;

    // ─── Read Status ─────────────────────────────────────────
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    // ─── Timestamps ──────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;
}
