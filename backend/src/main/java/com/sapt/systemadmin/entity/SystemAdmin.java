package com.sapt.systemadmin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * SystemAdmin - Top-level System Administrator MySQL Entity.
 * TODO (SystemAdmin Team): Add system-wide permission flags, etc.
 */
@Entity
@Table(name = "system_admins")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SystemAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FK → users.id (UUID string) */
    @Column(nullable = false, unique = true, length = 36)
    private String userId;

    private String fullName;
    private String employeeId;

    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
