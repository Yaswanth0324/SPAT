package com.sapt.systemadmin.entity;

/**
 * @deprecated The separate `system_admins` table no longer exists.
 *
 * All system admin data is now stored in the unified `users` table
 * with role = SYSTEM_ADMIN.
 *
 * Use {@link com.sapt.auth.entity.User} with role filter SYSTEM_ADMIN.
 */
@Deprecated(since = "2.0", forRemoval = true)
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
