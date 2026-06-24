package com.sapt.mentor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * Mentor - MySQL Entity
 * TODO (Mentor Team): Add college reference, department, assigned students list, etc.
 */
@Entity
@Table(name = "mentors")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Mentor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FK → users.id (UUID string) */
    @Column(nullable = false, unique = true, length = 36)
    private String userId;

    private String fullName;
    private String employeeId;
    private String department;
    private Long collegeId;
    private Long hodId;

    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
