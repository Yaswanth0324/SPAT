package com.sapt.collegeadmin.entity;

import com.sapt.common.enums.CollegeStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * College - Represents a registered college/institution in the SPARK platform.
 *
 * Lifecycle: Created by System Admin when a College Admin is onboarded.
 * All users (CollegeAdmin, HOD, Mentor, Student) belong to a College.
 */
@Entity
@Table(name = "colleges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class College {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Full official name of the college */
    @Column(nullable = false, unique = true)
    private String name;

    /** Street address, city, PIN */
    private String address;

    /** State in India */
    private String state;

    /** Current operational status */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CollegeStatus status = CollegeStatus.ACTIVE;

    /** Contract / subscription start date */
    private LocalDate contractStart;

    /** Contract / subscription end date */
    private LocalDate contractEnd;

    /** Phone number of the college (optional) */
    private String phone;

    /** Official college email (optional) */
    private String email;

    /** Website URL (optional) */
    private String website;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
