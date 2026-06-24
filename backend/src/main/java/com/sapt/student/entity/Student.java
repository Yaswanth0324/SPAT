package com.sapt.student.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * Student - MySQL Entity
 * Links to the unified users table via userId for authentication.
 * TODO (Student Team): Add department, batch, mentor reference, etc.
 */
@Entity
@Table(name = "students")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FK → users.id (UUID string) */
    @Column(nullable = false, unique = true, length = 36)
    private String userId;

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
