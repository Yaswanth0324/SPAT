package com.sapt.config;

import com.sapt.auth.entity.User;
import com.sapt.auth.repository.UserRepository;
import com.sapt.collegeadmin.entity.College;
import com.sapt.collegeadmin.repository.CollegeRepository;
import com.sapt.common.enums.CollegeStatus;
import com.sapt.common.enums.NotificationType;
import com.sapt.common.enums.UserRole;
import com.sapt.common.enums.UserStatus;
import com.sapt.notification.entity.Notification;
import com.sapt.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.sapt.student.entity.StarThreshold;
import com.sapt.student.repository.StarThresholdRepository;
import com.sapt.submission.entity.ActivityCategory;
import com.sapt.submission.entity.ActivitySubType;
import com.sapt.submission.repository.ActivityCategoryRepository;
import com.sapt.submission.repository.ActivitySubTypeRepository;
import com.sapt.collegeadmin.entity.Department;
import com.sapt.collegeadmin.repository.DepartmentRepository;
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
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final StarThresholdRepository starThresholdRepository;
    private final ActivityCategoryRepository activityCategoryRepository;
    private final ActivitySubTypeRepository activitySubTypeRepository;
    private final DataSyncService dataSyncService;
    private final NotificationRepository notificationRepository;

    @Override
    public void run(String... args) {
        log.info("DatabaseSeeder running...");



        // Fix for email_verified constraint if it exists in MySQL
        try {
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN email_verified TINYINT(1) NULL");
            log.info("DatabaseSeeder: Modified email_verified to be nullable.");
        } catch (Exception e) {
            log.debug("DatabaseSeeder: email_verified column skipped or not present: {}", e.getMessage());
        }

        // Cleanup: clear admin_id from database table users if present
        try {
            jdbcTemplate.execute("UPDATE users SET admin_id = NULL WHERE admin_id IS NOT NULL");
            log.info("DatabaseSeeder: Cleared admin_id values from users table.");
        } catch (Exception e) {
            log.debug("DatabaseSeeder: admin_id cleanup skipped: {}", e.getMessage());
        }

        // Step 0: Migrate any existing auth_users data → users table, then drop auth_users
        migrateFromAuthUsersIfExists();

        // Step 0b: Fix any college admins stuck as PENDING/inactive due to prior bug in createCollegeAdmin.
        //           System Admin-created accounts are pre-vetted and must always be APPROVED + active.
        fixStuckCollegeAdmins();

        // Step 1: Seed Demo College
        String collegeName = "Demo Engineering College";
        College college = collegeRepository.findByName(collegeName).orElseGet(() -> {
            College newCollege = College.builder()
                    .name(collegeName)
                    .address("Plot 45, Knowledge City, Madhapur, Hyderabad - 500081")
                    .state("Telangana")
                    .officialEmail("principal@democollege.edu.in")
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
                    .phone("9000000001")
                    .position("System Administrator")
                    .status(UserStatus.APPROVED)
                    .isActive(true)
                    .build();
            userRepository.save(sysAdmin);
            log.info("System Admin seeded: {}", adminEmail);
        } else {
            userRepository.findByEmail(adminEmail).ifPresent(u -> {
                u.setPasswordHash(passwordEncoder.encode("spark@2403"));
                u.setActive(true);
                u.setStatus(UserStatus.APPROVED);
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
                    .phone("9000000002")
                    .position("College Administrator")
                    .collegeId(college.getId())
                    .collegeName(collegeName)
                    .status(UserStatus.APPROVED)
                    .isActive(true)
                    .build();
            userRepository.save(collegeAdmin);
            log.info("Default College Admin seeded: {}", caEmail);
        } else {
            userRepository.findByEmail(caEmail).ifPresent(u -> {
                u.setPasswordHash(passwordEncoder.encode("collegeAdmin@2403"));
                u.setActive(true);
                u.setStatus(UserStatus.APPROVED);
                u.setCollegeName(collegeName);
                userRepository.save(u);
                log.info("Default College Admin updated: {}", caEmail);
            });
        }

        // Step 4: Seed default Department (CSE) for Demo College
        String deptName = "Computer Science and Engineering";
        Department csDept = departmentRepository.findByCollegeId(college.getId()).stream()
                .filter(d -> d.getName().equalsIgnoreCase(deptName))
                .findFirst()
                .orElseGet(() -> {
                    Department d = Department.builder()
                            .collegeId(college.getId())
                            .name(deptName)
                            .isActive(true)
                            .build();
                    log.info("Default CSE Department created.");
                    return departmentRepository.save(d);
                });

        // Step 5: Seed/update default HOD
        String hodEmail = "hod.cse@democollege.edu.in";
        if (!userRepository.existsByEmail(hodEmail)) {
            User hodUser = User.builder()
                    .id(UUID.randomUUID().toString())
                    .role(UserRole.HOD)
                    .name("Dr. Rajesh Kumar")
                    .email(hodEmail)
                    .passwordHash(passwordEncoder.encode("hod@2403"))
                    .phone("9000000003")
                    .position("Head of Department")
                    .collegeId(college.getId())
                    .collegeName(collegeName)
                    .departmentId(csDept.getId())
                    .departmentName(deptName)
                    .status(UserStatus.APPROVED)
                    .isActive(true)
                    .build();
            userRepository.save(hodUser);
            log.info("Default HOD seeded: {}", hodEmail);
        } else {
            userRepository.findByEmail(hodEmail).ifPresent(u -> {
                u.setPasswordHash(passwordEncoder.encode("hod@2403"));
                u.setActive(true);
                u.setStatus(UserStatus.APPROVED);
                u.setCollegeId(college.getId());
                u.setCollegeName(collegeName);
                u.setDepartmentId(csDept.getId());
                u.setDepartmentName(deptName);
                userRepository.save(u);
                log.info("Default HOD updated: {}", hodEmail);
            });
        }

        // Seed Star Thresholds if empty
        if (starThresholdRepository.count() == 0) {
            starThresholdRepository.save(new StarThreshold(1, 1, 100, "Bronze"));
            starThresholdRepository.save(new StarThreshold(2, 2, 250, "Silver"));
            starThresholdRepository.save(new StarThreshold(3, 3, 500, "Gold"));
            starThresholdRepository.save(new StarThreshold(4, 4, 1000, "Platinum"));
            starThresholdRepository.save(new StarThreshold(5, 5, 2000, "Diamond"));
            log.info("DatabaseSeeder: Star thresholds seeded.");
        }

        // Seed Activity Categories and SubTypes if empty
        if (activityCategoryRepository.count() == 0) {
            seedActivityCategory("Hackathons", List.of(
                new SubTypeDto("Participation", 20),
                new SubTypeDto("College-Level Winner", 35),
                new SubTypeDto("State-Level Winner", 50),
                new SubTypeDto("National-Level Winner", 75),
                new SubTypeDto("International-Level Winner", 100),
                new SubTypeDto("Top Finalist", 40),
                new SubTypeDto("Organizer / Coordinator", 25)
            ));
            seedActivityCategory("Ideathons", List.of(
                new SubTypeDto("Participation", 15),
                new SubTypeDto("Shortlisted Idea", 25),
                new SubTypeDto("Winner", 40),
                new SubTypeDto("State/National Recognition", 60)
            ));
            seedActivityCategory("Coding Competitions", List.of(
                new SubTypeDto("Participation", 15),
                new SubTypeDto("Top 10 Rank", 35),
                new SubTypeDto("Winner", 50),
                new SubTypeDto("Online Platform Milestone", 20)
            ));
            seedActivityCategory("Workshops", List.of(
                new SubTypeDto("1-Day Workshop", 5),
                new SubTypeDto("2-3 Day Workshop", 10),
                new SubTypeDto("Certified Workshop", 15),
                new SubTypeDto("Hands-On Technical Workshop", 20),
                new SubTypeDto("Workshop Organizer", 20)
            ));
            seedActivityCategory("Seminars & Guest Lectures", List.of(
                new SubTypeDto("Attendance", 3),
                new SubTypeDto("Certified Participation", 5),
                new SubTypeDto("Presenter / Speaker", 20),
                new SubTypeDto("Organizer", 15)
            ));
            seedActivityCategory("Conferences", List.of(
                new SubTypeDto("Participation", 10),
                new SubTypeDto("Paper Presentation", 30),
                new SubTypeDto("Best Paper Award", 60),
                new SubTypeDto("International Conference Paper", 80)
            ));
            seedActivityCategory("Research & Publications", List.of(
                new SubTypeDto("Research Participation", 25),
                new SubTypeDto("Journal Publication", 60),
                new SubTypeDto("Scopus Indexed Publication", 100),
                new SubTypeDto("IEEE Publication", 90),
                new SubTypeDto("Patent Filed", 120),
                new SubTypeDto("Patent Granted", 200)
            ));
            seedActivityCategory("Internships", List.of(
                new SubTypeDto("1-4 Week Internship", 25),
                new SubTypeDto("1-2 Month Internship", 40),
                new SubTypeDto("3+ Month Internship", 60),
                new SubTypeDto("Paid Internship Bonus", 15),
                new SubTypeDto("Internship Report Submission", 10),
                new SubTypeDto("Internship with PPO", 100)
            ));
            seedActivityCategory("Industrial Visits", List.of(
                new SubTypeDto("Participation", 5),
                new SubTypeDto("Report Submission", 10),
                new SubTypeDto("Coordinator", 15)
            ));
            seedActivityCategory("Mini Projects", List.of(
                new SubTypeDto("Mini Project Completion", 20),
                new SubTypeDto("Innovative Project", 35),
                new SubTypeDto("Project Demonstration", 15),
                new SubTypeDto("Department Recognition", 40)
            ));
            seedActivityCategory("Major Projects", List.of(
                new SubTypeDto("Major Project Completion", 50),
                new SubTypeDto("Industry-Based Project", 75),
                new SubTypeDto("Sponsored Project", 100),
                new SubTypeDto("Best Project Award", 120)
            ));
            seedActivityCategory("Open Source Contributions", List.of(
                new SubTypeDto("First Contribution", 20),
                new SubTypeDto("Regular Contributions", 40),
                new SubTypeDto("Maintainer Role", 75),
                new SubTypeDto("Significant Repository Contribution", 60)
            ));
            seedActivityCategory("Startup & Innovation", List.of(
                new SubTypeDto("Startup Idea Submission", 20),
                new SubTypeDto("Incubation Selection", 60),
                new SubTypeDto("Prototype Development", 40),
                new SubTypeDto("Startup Registration", 100),
                new SubTypeDto("Funding Received", 150)
            ));
            seedActivityCategory("Certifications & Online Courses", List.of(
                new SubTypeDto("Basic Certification", 10),
                new SubTypeDto("Industry Certification", 25),
                new SubTypeDto("Advanced Technical Certification", 40),
                new SubTypeDto("Global Certification (AWS/GCP/Cisco/MS/Oracle)", 60)
            ));
            seedActivityCategory("Competitive Exams", List.of(
                new SubTypeDto("Exam Qualification", 25),
                new SubTypeDto("National Rank Achievement", 75),
                new SubTypeDto("Advanced Round Qualification", 40)
            ));
            seedActivityCategory("Sports & Games", List.of(
                new SubTypeDto("Participation", 10),
                new SubTypeDto("College-Level Winner", 20),
                new SubTypeDto("State-Level Winner", 40),
                new SubTypeDto("National-Level Winner", 70),
                new SubTypeDto("Team Captain", 20),
                new SubTypeDto("Organizer", 15)
            ));
            seedActivityCategory("Cultural Activities", List.of(
                new SubTypeDto("Participation", 10),
                new SubTypeDto("Performer", 15),
                new SubTypeDto("Winner", 30),
                new SubTypeDto("State/National Recognition", 60),
                new SubTypeDto("Organizer", 20)
            ));
            seedActivityCategory("NSS / NCC / Social Service", List.of(
                new SubTypeDto("Camp Participation", 20),
                new SubTypeDto("Leadership Role", 35),
                new SubTypeDto("Community Service Initiative", 40),
                new SubTypeDto("Blood Donation", 15),
                new SubTypeDto("Awareness Program Organizer", 20)
            ));
            seedActivityCategory("Leadership & Student Bodies", List.of(
                new SubTypeDto("Club Member", 10),
                new SubTypeDto("Club Coordinator", 25),
                new SubTypeDto("Student Representative", 30),
                new SubTypeDto("Event Lead", 35),
                new SubTypeDto("Department Representative", 40)
            ));
            seedActivityCategory("Event Organization", List.of(
                new SubTypeDto("Volunteer", 10),
                new SubTypeDto("Coordinator", 20),
                new SubTypeDto("Core Organizer", 35),
                new SubTypeDto("Event Lead", 50)
            ));
            seedActivityCategory("Placement Preparation", List.of(
                new SubTypeDto("Aptitude Training Completion", 10),
                new SubTypeDto("Mock Interview Participation", 10),
                new SubTypeDto("Placement Readiness Program", 20),
                new SubTypeDto("Placement Offer Received", 100)
            ));
            seedActivityCategory("Academic Performance", List.of(
                new SubTypeDto("Semester Grade Sheet Upload", 10),
                new SubTypeDto("SGPA Above 8.0", 25),
                new SubTypeDto("SGPA Above 9.0", 40),
                new SubTypeDto("Department Topper", 75),
                new SubTypeDto("University Rank", 120)
            ));
            seedActivityCategory("Attendance & Discipline", List.of(
                new SubTypeDto("90%+ Attendance", 15),
                new SubTypeDto("95%+ Attendance", 25),
                new SubTypeDto("No Disciplinary Issues", 10)
            ));
            seedActivityCategory("Daily Logs & Consistency", List.of(
                new SubTypeDto("Daily Log Submission (Reviewed)", 1),
                new SubTypeDto("7-Day Consistency Streak", 5),
                new SubTypeDto("30-Day Consistency Streak", 25),
                new SubTypeDto("Mentor Excellence Remark", 10)
            ));
            seedActivityCategory("Freelancing & Real-World Work", List.of(
                new SubTypeDto("Freelance Project Completion", 30),
                new SubTypeDto("Client Appreciation", 20),
                new SubTypeDto("Revenue Milestone", 50)
            ));
            seedActivityCategory("Content Creation & Technical Community", List.of(
                new SubTypeDto("Technical Blog Published", 15),
                new SubTypeDto("YouTube Educational Content", 20),
                new SubTypeDto("Technical Community Contribution", 25),
                new SubTypeDto("Public Speaking", 30)
            ));
            seedActivityCategory("Entrepreneurship & Business", List.of(
                new SubTypeDto("Business Plan Submission", 25),
                new SubTypeDto("Startup Competition Participation", 30),
                new SubTypeDto("Revenue Generation Milestone", 75),
                new SubTypeDto("Registered Business Entity", 120)
            ));
            seedActivityCategory("Faculty Recommendations & Excellence", List.of(
                new SubTypeDto("Exceptional Contribution Recognition", 25),
                new SubTypeDto("Mentor Special Recommendation", 30),
                new SubTypeDto("Institutional Excellence Award", 75)
            ));
            seedActivityCategory("Presentations", List.of(
                new SubTypeDto("In-Class Presentation", 5),
                new SubTypeDto("Department-Level Presentation", 15),
                new SubTypeDto("Inter-College Presentation", 25),
                new SubTypeDto("National-Level Presentation", 40),
                new SubTypeDto("International Presentation", 60),
                new SubTypeDto("Best Presenter Award", 50)
            ));
            log.info("DatabaseSeeder: Default activity categories and sub-types seeded.");
        }

        // Step N: Ensure role-mirror tables have correct utf8mb4 charset for UUID columns
        fixRoleTableCharsets();

        // Step N+1: Sync approved users → hods / mentors / students tables
        dataSyncService.syncAllApprovedUsers();

        // Step N+2: Seed welcome notifications for new users
        seedWelcomeNotifications();

        log.info("DatabaseSeeder complete.");
    }

    /**
     * Seeds a "Welcome to SAPT" notification for each approved user
     * (HOD, MENTOR, STUDENT) who doesn't already have one.
     * Ensures the notifications table is never empty after startup.
     */
    private void seedWelcomeNotifications() {
        try {
            java.util.List<com.sapt.auth.entity.User> approvedUsers =
                    userRepository.findAll().stream()
                            .filter(u -> u.getStatus() == UserStatus.APPROVED
                                    && (u.getRole() == UserRole.HOD
                                    || u.getRole() == UserRole.MENTOR
                                    || u.getRole() == UserRole.STUDENT))
                            .toList();

            int seeded = 0;
            for (com.sapt.auth.entity.User u : approvedUsers) {
                boolean alreadyHasWelcome = notificationRepository
                        .findByRecipientIdOrderByCreatedAtDesc(u.getId())
                        .stream()
                        .anyMatch(n -> n.getTitle() != null && n.getTitle().contains("Welcome"));
                if (!alreadyHasWelcome) {
                    Notification notif = Notification.builder()
                            .recipientId(u.getId())
                            .title("Welcome to SAPT!")
                            .body("Hello " + u.getName() + "! Welcome to the Student Activity & Performance Tracker. Your account is active.")
                            .type(NotificationType.SYSTEM_ANNOUNCEMENT)
                            .isRead(false)
                            .build();
                    notificationRepository.save(notif);
                    seeded++;
                }
            }
            if (seeded > 0) {
                log.info("DatabaseSeeder: Seeded {} welcome notifications.", seeded);
            }
        } catch (Exception e) {
            log.warn("DatabaseSeeder: Could not seed notifications: {}", e.getMessage());
        }
    }

    /**
     * Ensures the hods, mentors, and students tables have the correct column
     * charset (utf8mb4) so that UUID string values can be inserted.
     * Uses ALTER TABLE ... CONVERT TO CHARACTER SET to fix existing tables
     * created with wrong charset by Hibernate DDL.
     */
    private void fixRoleTableCharsets() {
        log.info("DatabaseSeeder: Fixing role-table charsets to utf8mb4...");

        // First, drop any wrongly-created tables (idempotent — OK if already dropped)
        for (String table : List.of("hods", "mentors", "students")) {
            try {
                jdbcTemplate.execute("DROP TABLE IF EXISTS " + table);
                log.info("DatabaseSeeder: Dropped existing {} table for recreation.", table);
            } catch (Exception e) {
                log.debug("DatabaseSeeder: Could not drop {}: {}", table, e.getMessage());
            }
        }

        // Recreate with explicit utf8mb4 charset
        try {
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS hods (" +
                "  id VARCHAR(36) CHARACTER SET utf8mb4 NOT NULL," +
                "  name VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL," +
                "  email VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL," +
                "  college_id VARCHAR(36) CHARACTER SET utf8mb4," +
                "  department_id VARCHAR(36) CHARACTER SET utf8mb4," +
                "  status VARCHAR(20) CHARACTER SET utf8mb4," +
                "  PRIMARY KEY (id)," +
                "  UNIQUE KEY uk_hods_email (email)" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
            );
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS mentors (" +
                "  id VARCHAR(36) CHARACTER SET utf8mb4 NOT NULL," +
                "  name VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL," +
                "  email VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL," +
                "  college_id VARCHAR(36) CHARACTER SET utf8mb4," +
                "  department_id VARCHAR(36) CHARACTER SET utf8mb4," +
                "  status VARCHAR(20) CHARACTER SET utf8mb4," +
                "  PRIMARY KEY (id)," +
                "  UNIQUE KEY uk_mentors_email (email)" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
            );
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS students (" +
                "  id VARCHAR(36) CHARACTER SET utf8mb4 NOT NULL," +
                "  name VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL," +
                "  email VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL," +
                "  college_id VARCHAR(36) CHARACTER SET utf8mb4," +
                "  department_id VARCHAR(36) CHARACTER SET utf8mb4," +
                "  roll_no VARCHAR(50) CHARACTER SET utf8mb4," +
                "  mentor_id VARCHAR(36) CHARACTER SET utf8mb4," +
                "  status VARCHAR(20) CHARACTER SET utf8mb4," +
                "  PRIMARY KEY (id)," +
                "  UNIQUE KEY uk_students_email (email)" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
            );
            log.info("DatabaseSeeder: Role tables recreated with utf8mb4 charset.");
        } catch (Exception e) {
            log.warn("DatabaseSeeder: Could not recreate role tables: {}", e.getMessage());
        }
    }



    /**
     * One-time fix: approve & activate any COLLEGE_ADMIN accounts that are
     * stuck as PENDING / isActive=false due to the prior bug in createCollegeAdmin().
     * Safe to run on every startup — skips already-approved accounts.
     */
    private void fixStuckCollegeAdmins() {
        List<com.sapt.auth.entity.User> stuck = userRepository.findByRole(com.sapt.common.enums.UserRole.COLLEGE_ADMIN)
                .stream()
                .filter(u -> !u.isActive() || u.getStatus() != com.sapt.common.enums.UserStatus.APPROVED)
                .collect(java.util.stream.Collectors.toList());

        if (stuck.isEmpty()) {
            log.info("fixStuckCollegeAdmins: no stuck accounts found.");
            return;
        }

        for (com.sapt.auth.entity.User u : stuck) {
            u.setActive(true);
            u.setStatus(com.sapt.common.enums.UserStatus.APPROVED);
            userRepository.save(u);
            log.info("fixStuckCollegeAdmins: activated & approved college admin: {}", u.getEmail());
        }
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
                        .phone(row.get("ca_phone") != null ? (String) row.get("ca_phone") : null)
                        .position(role == UserRole.COLLEGE_ADMIN ? "College Administrator" : role.name())
                        .collegeId(collegeId)
                        .collegeName(collegeName)
                        .status(active && verified ? UserStatus.APPROVED : UserStatus.PENDING)
                        .isActive(active)
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

    private void seedActivityCategory(String name, List<SubTypeDto> subTypes) {
        ActivityCategory cat = activityCategoryRepository.save(
                ActivityCategory.builder()
                        .name(name)
                        .isCustom(false)
                        .isActive(true)
                        .build()
        );
        for (SubTypeDto sub : subTypes) {
            activitySubTypeRepository.save(
                    ActivitySubType.builder()
                            .categoryId(cat.getId())
                            .label(sub.label)
                            .points(sub.points)
                            .isActive(true)
                            .build()
            );
        }
    }

    private static class SubTypeDto {
        String label;
        int points;
        SubTypeDto(String label, int points) {
            this.label = label;
            this.points = points;
        }
    }
}
