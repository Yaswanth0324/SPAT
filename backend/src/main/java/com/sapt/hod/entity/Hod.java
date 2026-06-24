package com.sapt.hod.entity;

/**
 * @deprecated The separate `hods` table no longer exists.
 *
 * All HOD data is now stored in the unified `users` table
 * with role = HOD.
 *
 * Use {@link com.sapt.auth.entity.User} with role filter HOD.
 */
@Deprecated(since = "2.0", forRemoval = true)
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
