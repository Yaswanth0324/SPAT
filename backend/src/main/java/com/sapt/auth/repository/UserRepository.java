package com.sapt.auth.repository;

import com.sapt.auth.entity.User;
import com.sapt.common.enums.UserRole;
import com.sapt.common.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ============================================================
 * UserRepository — JPA Repository for the unified users table
 * ============================================================
 * All five roles (SYSTEM_ADMIN, COLLEGE_ADMIN, HOD, MENTOR, STUDENT)
 * are stored in a single `users` table.
 * Filter by role/college/department as needed.
 * ============================================================
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {

    // ─── Auth lookups ────────────────────────────────────────
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // ─── Role lookups ────────────────────────────────────────
    List<User> findByRole(UserRole role);
    List<User> findByRoleAndIsActiveTrue(UserRole role);

    // ─── College-scoped lookups ───────────────────────────────
    List<User> findByCollegeId(String collegeId);
    List<User> findByCollegeIdAndRole(String collegeId, UserRole role);
    List<User> findByCollegeIdAndRoleAndIsActiveTrue(String collegeId, UserRole role);
    List<User> findByCollegeIdAndRoleAndStatus(String collegeId, UserRole role, UserStatus status);
    List<User> findByCollegeNameAndRole(String collegeName, UserRole role);

    // ─── Department-scoped lookups ────────────────────────────
    List<User> findByDepartmentId(String departmentId);
    List<User> findByDepartmentIdAndRole(String departmentId, UserRole role);

    // ─── Student ↔ Mentor / HOD links ────────────────────────
    List<User> findByMentorId(String mentorId);
    List<User> findByHodId(String hodId);

    // ─── Status filter ────────────────────────────────────────
    List<User> findByCollegeIdAndStatus(String collegeId, UserStatus status);

    // ─── OTP Cleanup (used by OtpCleanupScheduler) ────────────
    /**
     * Clears expired OTP codes from all user rows.
     * Sets otp_code = null and otp_expires_at = null
     * where otp_expires_at is in the past.
     */
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(
        "UPDATE User u SET u.otpCode = null, u.otpExpiresAt = null " +
        "WHERE u.otpExpiresAt IS NOT NULL AND u.otpExpiresAt < :now"
    )
    void clearExpiredOtps(@org.springframework.data.repository.query.Param("now") java.time.LocalDateTime now);
}
