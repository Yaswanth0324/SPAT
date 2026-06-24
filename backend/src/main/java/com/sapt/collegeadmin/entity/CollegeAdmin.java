package com.sapt.collegeadmin.entity;

/**
 * CollegeAdmin - College Administrator MySQL Entity.
 * Links an AuthUser (credentials) to a specific College.
 */
@Deprecated(since = "2.0", forRemoval = true)
public class CollegeAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FK → users.id (UUID string) */
    @Column(nullable = false, unique = true, length = 36)
    private String userId;

    @Column(nullable = false)
    private String fullName;

    /** Institutional employee / admin ID (e.g. "CA123456") */
    private String employeeId;

    /** FK → colleges.id */
    @Column(nullable = false)
    private Long collegeId;

    /** Phone / mobile number */
    private String phone;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
