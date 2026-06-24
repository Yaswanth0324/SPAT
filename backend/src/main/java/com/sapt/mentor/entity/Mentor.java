package com.sapt.mentor.entity;

/**
 * @deprecated The separate `mentors` table no longer exists.
 *
 * All mentor data is now stored in the unified `users` table
 * with role = MENTOR. Fields (phone, department, collegeName, etc.)
 * are columns on the User entity.
 *
 * Succession requests are handled by {@link SuccessionRequest} entity
 * (stored in the `succession_requests` table).
 *
 * Use {@link com.sapt.auth.entity.User} with role filter MENTOR.
 */
@Deprecated(since = "2.0", forRemoval = true)
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
