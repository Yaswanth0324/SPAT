package com.sapt.collegeadmin.entity;

import com.sapt.common.enums.CollegeStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ============================================================
 * College — Institution Entity
 * ============================================================
 * Represents a partner college registered in the SPAT system.
 * Created and managed by System Admins.
 *
 * Departments are stored in the separate `departments` table
 * (see Department entity) via Department.collegeId.
 *
 * Counts (total_users, hods_count, etc.) are denormalized
 * for fast dashboard stats; updated whenever users are
 * created or deactivated.
 *
 * Table: colleges
 * ============================================================
 */
@Entity
@Table(
    name = "colleges",
    indexes = {
        @Index(name = "idx_colleges_status",       columnList = "status"),
        @Index(name = "idx_colleges_state",        columnList = "state"),
        @Index(name = "idx_colleges_contract_end", columnList = "contract_end")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class College {

    // ─── Primary Key (UUID) ───────────────────────────────────
    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false, columnDefinition = "CHAR(36)")
    private String id;

    // ─── College Info ─────────────────────────────────────────
    @Column(nullable = false, unique = true, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(name = "official_email", length = 255)
    private String officialEmail;

    @Column(name = "chairman_name", length = 255)
    private String chairmanName;

    // ─── Contract Period ──────────────────────────────────────
    @Column(name = "contract_start")
    private LocalDate contractStart;

    @Column(name = "contract_end")
    private LocalDate contractEnd;

    // ─── Status ──────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CollegeStatus status = CollegeStatus.ACTIVE;

    // ─── Denormalized Counters (updated by service layer) ────
    @Column(name = "total_users", nullable = false)
    @Builder.Default
    private int totalUsers = 0;

    @Column(name = "hods_count", nullable = false)
    @Builder.Default
    private int hodsCount = 0;

    @Column(name = "mentors_count", nullable = false)
    @Builder.Default
    private int mentorsCount = 0;

    @Column(name = "students_count", nullable = false)
    @Builder.Default
    private int studentsCount = 0;

    // ─── Timestamps ──────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
