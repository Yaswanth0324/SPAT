package com.sapt.hod.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * Hod - Head of Department MySQL Entity.
 * TODO (HOD Team): Add department, college reference, etc.
 */
@Entity
@Table(name = "hods")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Hod {

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

    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
