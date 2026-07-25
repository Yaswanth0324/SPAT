package com.sapt.submission.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * ============================================================
 * ActivityCategory — Activity Category Configuration Entity
 * ============================================================
 * System-wide activity categories (seeded on startup):
 *   Technical, Cultural, Sports, Research, Social Service,
 *   Internship, Certification, Leadership, Other
 *
 * Colleges can add custom categories (is_custom = true).
 * created_by references the users(id) who added the category.
 *
 * Table: activity_categories
 * ============================================================
 */
@Entity
@Table(
    name = "activity_categories",
    indexes = {
        @Index(name = "idx_categories_custom", columnList = "is_custom")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityCategory {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false, columnDefinition = "CHAR(36)")
    private String id;

    @Column(nullable = false, unique = true, length = 255)
    private String name;

    @Column(name = "is_custom", nullable = false)
    @Builder.Default
    private boolean isCustom = false;

    /**
     * FK → users.id — the user (college admin) who created this category.
     * null for system-default categories.
     */
    @Column(name = "created_by", columnDefinition = "CHAR(36)")
    private String createdBy;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;
}
