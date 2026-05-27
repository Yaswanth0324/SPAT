package com.sapt.student.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * Student - MySQL Entity
 * Links to AuthUser via authUserId for authentication.
 * TODO (Student Team): Add department, batch, mentor reference, etc.
 */
@Entity
@Table(name = "students")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Foreign key to auth_users table */
    @Column(nullable = false, unique = true)
    private Long authUserId;

    private String fullName;
    private String rollNumber;
    private String department;
    private String batch;
    private String semester;
    private Long mentorId;
    private Integer totalPoints;

    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
