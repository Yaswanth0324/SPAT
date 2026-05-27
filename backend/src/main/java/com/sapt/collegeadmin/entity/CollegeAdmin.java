package com.sapt.collegeadmin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * CollegeAdmin - College Administrator MySQL Entity.
 * TODO (CollegeAdmin Team): Add college reference, permissions, etc.
 */
@Entity
@Table(name = "college_admins")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CollegeAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long authUserId;

    private String fullName;
    private String employeeId;
    private Long collegeId;

    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
