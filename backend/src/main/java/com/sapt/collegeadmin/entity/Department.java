package com.sapt.collegeadmin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * ============================================================
 * Department — Academic Department Entity
 * ============================================================
 * Each College has multiple Departments.
 * Students, Mentors, and HODs belong to a Department.
 *
 * Unique constraint: a department name must be unique per college.
 *
 * Table: departments
 * ============================================================
 */
@Entity
@Table(
    name = "departments",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_department_name", columnNames = {"college_id", "name"})
    },
    indexes = {
        @Index(name = "idx_departments_college", columnList = "college_id")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Department {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false, columnDefinition = "CHAR(36)")
    private String id;

    /** FK → colleges.id */
    @Column(name = "college_id", nullable = false, columnDefinition = "CHAR(36)")
    private String collegeId;

    /** Full department name (e.g., "Computer Science and Engineering") */
    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;
}
