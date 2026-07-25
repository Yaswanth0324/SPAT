package com.sapt.config;

import com.sapt.auth.entity.User;
import com.sapt.auth.repository.UserRepository;
import com.sapt.common.enums.UserRole;
import com.sapt.common.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * ============================================================
 * DataSyncService — Syncs users table → role-specific tables
 * ============================================================
 * Uses plain JDBC (not JPA) to avoid Hibernate ID-generation
 * issues with TiDB when inserting manually-assigned UUIDs.
 *
 * The `hods`, `mentors`, and `students` tables are mirror tables
 * that reflect approved users from the unified `users` table.
 *
 * Safe to call multiple times — uses INSERT IGNORE / ON DUPLICATE
 * KEY UPDATE for idempotent upserts.
 * ============================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DataSyncService {

    private final UserRepository userRepository;
    private final JdbcTemplate   jdbcTemplate;

    // ============================================================
    // FULL SYNC (called on startup)
    // ============================================================

    /**
     * Syncs ALL approved users from the users table into
     * their respective role-specific tables.
     * Idempotent — uses UPSERT semantics.
     */
    @Transactional
    public void syncAllApprovedUsers() {
        log.info("DataSyncService: Starting full sync of approved users...");

        List<User> allApproved = userRepository.findAll().stream()
                .filter(u -> u.getStatus() == UserStatus.APPROVED)
                .toList();

        int hodCount = 0, mentorCount = 0, studentCount = 0;

        for (User user : allApproved) {
            try {
                if (user.getRole() == UserRole.HOD) {
                    upsertHod(user);
                    hodCount++;
                } else if (user.getRole() == UserRole.MENTOR) {
                    upsertMentor(user);
                    mentorCount++;
                } else if (user.getRole() == UserRole.STUDENT) {
                    upsertStudent(user);
                    studentCount++;
                }
            } catch (Exception e) {
                log.warn("DataSyncService: Failed to sync user {}: {}", user.getEmail(), e.getMessage());
            }
        }

        log.info("DataSyncService: Sync complete — HODs: {}, Mentors: {}, Students: {}",
                hodCount, mentorCount, studentCount);
    }

    // ============================================================
    // SINGLE USER SYNC (called after status → APPROVED)
    // ============================================================

    /**
     * Syncs a single user into the appropriate role-specific table.
     * Called by AuthService.updateUserStatus() when status = APPROVED.
     */
    public void syncUserIfApproved(User user) {
        if (user.getStatus() != UserStatus.APPROVED) return;

        try {
            if (user.getRole() == UserRole.HOD) {
                upsertHod(user);
            } else if (user.getRole() == UserRole.MENTOR) {
                upsertMentor(user);
            } else if (user.getRole() == UserRole.STUDENT) {
                upsertStudent(user);
            }
        } catch (Exception e) {
            log.warn("DataSyncService: Failed to sync user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    // ============================================================
    // PRIVATE UPSERT HELPERS (JDBC-based)
    // ============================================================

    private void upsertHod(User user) {
        String sql = """
            INSERT INTO hods (id, name, email, college_id, department_id, status)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name          = VALUES(name),
                email         = VALUES(email),
                college_id    = VALUES(college_id),
                department_id = VALUES(department_id),
                status        = VALUES(status)
            """;
        jdbcTemplate.update(sql,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCollegeId(),
                user.getDepartmentId(),
                user.getStatus().name());
        log.info("DataSyncService: Upserted HOD {} in hods table", user.getEmail());
    }

    private void upsertMentor(User user) {
        String sql = """
            INSERT INTO mentors (id, name, email, college_id, department_id, status)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name          = VALUES(name),
                email         = VALUES(email),
                college_id    = VALUES(college_id),
                department_id = VALUES(department_id),
                status        = VALUES(status)
            """;
        jdbcTemplate.update(sql,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCollegeId(),
                user.getDepartmentId(),
                user.getStatus().name());
        log.info("DataSyncService: Upserted Mentor {} in mentors table", user.getEmail());
    }

    private void upsertStudent(User user) {
        String sql = """
            INSERT INTO students (id, name, email, college_id, department_id, roll_no, mentor_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name          = VALUES(name),
                email         = VALUES(email),
                college_id    = VALUES(college_id),
                department_id = VALUES(department_id),
                roll_no       = VALUES(roll_no),
                mentor_id     = VALUES(mentor_id),
                status        = VALUES(status)
            """;
        jdbcTemplate.update(sql,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCollegeId(),
                user.getDepartmentId(),
                user.getRollNo(),
                user.getMentorId(),
                user.getStatus().name());
        log.info("DataSyncService: Upserted Student {} in students table", user.getEmail());
    }
}
