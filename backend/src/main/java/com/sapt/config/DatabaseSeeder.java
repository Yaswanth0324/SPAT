package com.sapt.config;

import com.sapt.auth.entity.User;
import com.sapt.auth.repository.UserRepository;
import com.sapt.collegeadmin.entity.College;
import com.sapt.collegeadmin.repository.CollegeRepository;
import com.sapt.common.enums.CollegeStatus;
import com.sapt.common.enums.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DatabaseSeeder - Seeds default users and migrates legacy auth_users data on startup.
 *
 * On first run after migration:
 *  1. Copies any college admins from auth_users+college_admins into the users table.
 *  2. Drops auth_users table (no longer needed).
 *  3. Seeds/updates System Admin and default College Admin.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("DatabaseSeeder running...");

        // Step 0: Migrate any existing auth_users data → users table, then drop auth_users
        migrateFromAuthUsersIfExists();

        // Step 1: Seed Demo College
        String collegeName = "Demo Engineering College";
        College college = collegeRepository.findByName(collegeName).orElseGet(() -> {
            College newCollege = College.builder()
                    .name(collegeName)
                    .address("Plot 45, Knowledge City, Madhapur, Hyderabad - 500081")
                    .state("Telangana")
                    .phone("9000000002")
                    .email("principal@democollege.edu.in")
                    .website("http://democollege.edu.in")
                    .status(CollegeStatus.ACTIVE)
                    .contractStart(LocalDate.now())
                    .contractEnd(LocalDate.now().plusYears(2))
                    .build();
            log.info("Demo College created.");
            return collegeRepository.save(newCollege);
        });

        // Step 2: Seed/update System Admin
        String adminEmail = "intouract.spark@gmail.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User sysAdmin = User.builder()
                    .id(UUID.randomUUID().toString())
                    .role(UserRole.SYSTEM_ADMIN)
                    .name("System Administrator")
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode("spark@2403"))
                    .adminId("SYS-001")
                    .phone("9000000001")
                    .position("System Administrator")
                    .status("APPROVED")
                    .isActive(true)
                    .emailVerified(true)
                    .build();
            userRepository.save(sysAdmin);
            log.info("System Admin seeded: {}", adminEmail);
        } else {
            userRepository.findByEmail(adminEmail).ifPresent(u -> {
                u.setPasswordHash(passwordEncoder.encode("spark@2403"));
                u.setActive(true);
                u.setEmailVerified(true);
                u.setStatus("APPROVED");
                userRepository.save(u);
                log.info("System Admin updated: {}", adminEmail);
            });
        }

        // Step 3: Seed/update default College Admin
        String caEmail = "yashyashu95632@gmail.com";
        if (!userRepository.existsByEmail(caEmail)) {
            User collegeAdmin = User.builder()
                    .id(UUID.randomUUID().toString())
                    .role(UserRole.COLLEGE_ADMIN)
                    .name("College Administrator")
                    .email(caEmail)
                    .passwordHash(passwordEncoder.encode("collegeAdmin@2403"))
                    .adminId("CA-001")
                    .phone("9000000002")
                    .position("College Administrator")
                    .collegeId(college.getId() != null ? String.valueOf(college.getId()) : null)
                    .collegeName(collegeName)
                    .status("APPROVED")
                    .isActive(true)
                    .emailVerified(true)
                    .build();
            userRepository.save(collegeAdmin);
            log.info("Default College Admin seeded: {}", caEmail);
        } else {
            userRepository.findByEmail(caEmail).ifPresent(u -> {
                u.setPasswordHash(passwordEncoder.encode("collegeAdmin@2403"));
                u.setActive(true);
                u.setEmailVerified(true);
                u.setStatus("APPROVED");
                u.setCollegeName(collegeName);
                userRepository.save(u);
                log.info("Default College Admin updated: {}", caEmail);
            });
        }

        log.info("DatabaseSeeder complete.");
    }

    /**
     * Checks if the old auth_users table still exists in the database.
     * If yes: migrates all college admin rows (joining college_admins + colleges) into the users table,
     * then drops auth_users so it is never seen again.
     */
    private void migrateFromAuthUsersIfExists() {
        // Check if auth_users table still exists
        boolean authUsersExists;
        try {
            jdbcTemplate.execute("SELECT 1 FROM auth_users LIMIT 1");
            authUsersExists = true;
        } catch (Exception e) {
            authUsersExists = false;
        }

        if (!authUsersExists) {
            log.info("auth_users table not found — migration already done.");
            return;
        }

        log.info("auth_users table found. Starting migration → users table...");

        try {
            // Query all rows from auth_users joined with college_admins and colleges
            String sql = """
                SELECT
                    au.id          AS au_id,
                    au.email       AS au_email,
                    au.password    AS au_password,
                    au.role        AS au_role,
                    au.active      AS au_active,
                    au.email_verified AS au_email_verified,
                    ca.full_name   AS ca_full_name,
                    ca.employee_id AS ca_employee_id,
                    ca.phone       AS ca_phone,
                    c.id           AS college_id,
                    c.name         AS college_name
                FROM auth_users au
                LEFT JOIN college_admins ca ON ca.auth_user_id = au.id
                LEFT JOIN colleges c ON c.id = ca.college_id
                """;

            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
            int migrated = 0;

            for (Map<String, Object> row : rows) {
                String email = (String) row.get("au_email");

                // Skip if already in users table
                if (userRepository.existsByEmail(email)) {
                    log.info("Skipping migration of {} — already in users table.", email);
                    continue;
                }

                String roleStr = (String) row.get("au_role");
                UserRole role;
                try {
                    role = UserRole.valueOf(roleStr);
                } catch (Exception ex) {
                    role = UserRole.COLLEGE_ADMIN;
                }

                Object activeObj = row.get("au_active");
                boolean active = activeObj != null && (activeObj.equals(true) || activeObj.equals(1) || "1".equals(activeObj.toString()));

                Object verifiedObj = row.get("au_email_verified");
                boolean verified = verifiedObj != null && (verifiedObj.equals(true) || verifiedObj.equals(1) || "1".equals(verifiedObj.toString()));

                String collegeName = (String) row.get("college_name");
                Object collegeIdObj = row.get("college_id");
                String collegeId = collegeIdObj != null ? collegeIdObj.toString() : null;

                User migratedUser = User.builder()
                        .id(UUID.randomUUID().toString())
                        .role(role)
                        .name(row.get("ca_full_name") != null ? (String) row.get("ca_full_name") : email.split("@")[0])
                        .email(email)
                        .passwordHash((String) row.get("au_password"))  // already BCrypt hashed
                        .adminId(row.get("ca_employee_id") != null ? (String) row.get("ca_employee_id") : null)
                        .phone(row.get("ca_phone") != null ? (String) row.get("ca_phone") : null)
                        .position(role == UserRole.COLLEGE_ADMIN ? "College Administrator" : role.name())
                        .collegeId(collegeId)
                        .collegeName(collegeName)
                        .status(active && verified ? "APPROVED" : "PENDING")
                        .isActive(active)
                        .emailVerified(verified)
                        .build();

                userRepository.save(migratedUser);
                log.info("Migrated user '{}' (role={}) → users table.", email, role);
                migrated++;
            }

            log.info("Migration complete. {} user(s) moved from auth_users to users table.", migrated);

        } catch (Exception e) {
            log.error("Error during auth_users migration: {}", e.getMessage(), e);
        }

        // Drop auth_users table after migration
        try {
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
            jdbcTemplate.execute("DROP TABLE IF EXISTS auth_users");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            log.info("auth_users table dropped successfully.");
        } catch (Exception e) {
            log.warn("Could not drop auth_users table: {}", e.getMessage());
        }
    }
}
