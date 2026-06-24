package com.sapt.auth.entity;

import com.sapt.common.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * @deprecated Replaced by {@link com.sapt.auth.entity.User} which maps to the unified `users` table.
 * This entity is kept as a stub so Hibernate does NOT try to manage auth_users.
 */
@Deprecated
@Entity
@Table(name = "_auth_users_deprecated")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique email used for login */
    @Column(nullable = false, unique = true)
    private String email;

    /** BCrypt-hashed password — NEVER store plain text */
    @Column(nullable = false)
    private String password;

    /** Role determines which module's features this user can access */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    /** Whether the email has been verified via OTP */
    @Column(nullable = false)
    private boolean emailVerified;

    /** Whether this account is active (soft-delete support) */
    @Column(nullable = false)
    private boolean active;

    /** Timestamp of last login */
    private LocalDateTime lastLoginAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
