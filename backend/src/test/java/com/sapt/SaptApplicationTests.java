package com.sapt;

import io.github.cdimascio.dotenv.Dotenv;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * ============================================================
 * SaptApplicationTests - Application Context Load Test
 * ============================================================
 * Verifies that the Spring application context loads correctly.
 * This test will fail if any bean configuration is broken.
 * ============================================================
 */
@SpringBootTest
@ActiveProfiles("dev")
class SaptApplicationTests {

    static {
        Dotenv dotenv = Dotenv.configure()
                .directory("./")          // looks for .env in backend/ root
                .ignoreIfMissing()        // don't crash if .env is absent
                .load();

        dotenv.entries().forEach(entry -> {
            if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });
    }

    @org.springframework.beans.factory.annotation.Autowired
    private javax.sql.DataSource dataSource;

    @org.springframework.beans.factory.annotation.Autowired
    private com.sapt.systemadmin.service.SystemAdminService systemAdminService;

    @org.springframework.beans.factory.annotation.Autowired
    private com.sapt.auth.service.AuthService authService;

    @org.springframework.beans.factory.annotation.Autowired
    private com.sapt.auth.repository.UserRepository userRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private com.sapt.collegeadmin.repository.CollegeRepository collegeRepository;

    @Test
    void contextLoads() {
        // Verifies that the Spring application context starts successfully.
        // If this test fails, check your bean configurations and .env values.
    }

    /**
     * Manual utility — NOT a @Test. Run manually via IDE if you need to reset tables.
     */
    void dropProblematicTables() {
        try (java.sql.Connection conn = dataSource.getConnection();
             java.sql.Statement stmt = conn.createStatement()) {

            System.out.println("========== DROPPING TABLES ==========");

            String[] tables = {
                "submissions", "students", "mentors", "hods",
                "college_admins", "departments", "colleges",
                "auth_users", "system_admins", "users"
            };

            stmt.execute("SET FOREIGN_KEY_CHECKS = 0");
            for (String table : tables) {
                try {
                    stmt.execute("DROP TABLE IF EXISTS " + table);
                    System.out.println("Dropped table: " + table);
                } catch (Exception e) {
                    System.out.println("Failed to drop table " + table + ": " + e.getMessage());
                }
            }
            stmt.execute("SET FOREIGN_KEY_CHECKS = 1");
            System.out.println("=====================================");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Test
    @org.springframework.transaction.annotation.Transactional
    void testCollegeAdminCreationVerificationAndLogin() {
        System.out.println("========== TESTING COLLEGE ADMIN FLOW ==========");

        String testEmail = "verifadmin_" + System.currentTimeMillis() + "@example.com";

        // 1. Build create request
        com.sapt.systemadmin.dto.SystemAdminDto.CreateCollegeAdminRequest request =
            new com.sapt.systemadmin.dto.SystemAdminDto.CreateCollegeAdminRequest();
        request.setCollegeName("Verification Test College");
        request.setCollegeAddress("456 Test Road");
        request.setCollegeState("Delhi");
        request.setCollegePhone("9876543210");
        request.setCollegeEmail("contact@veriftest.edu");
        request.setCollegeWebsite("http://veriftest.edu");
        request.setAdminFullName("Verification Admin");
        request.setAdminEmail(testEmail);
        request.setAdminPassword("secretPassword");
        request.setAdminPhone("9876543211");
        request.setAdminEmployeeId("VCA-001");

        // 2. Execute creation — pass a dummy UUID as the "created by" system admin id
        systemAdminService.createCollegeAdmin(request, java.util.UUID.randomUUID().toString());

        // 3. Verify record exists in users table with correct initial state
        com.sapt.auth.entity.User user = userRepository.findByEmail(testEmail)
                .orElseThrow(() -> new AssertionError("User was not created in users table"));
        org.junit.jupiter.api.Assertions.assertFalse(user.isEmailVerified(), "Should not be verified initially");
        org.junit.jupiter.api.Assertions.assertFalse(user.isActive(), "Should not be active initially");
        org.junit.jupiter.api.Assertions.assertEquals("PENDING", user.getStatus(), "Status should be PENDING");
        org.junit.jupiter.api.Assertions.assertEquals("Verification Test College", user.getCollegeName());

        // 4. Simulate verification link click
        authService.verifyEmailDirect(testEmail);

        // Reload and verify state changed
        user = userRepository.findByEmail(testEmail).get();
        org.junit.jupiter.api.Assertions.assertTrue(user.isEmailVerified(), "Should be verified after activation");
        org.junit.jupiter.api.Assertions.assertTrue(user.isActive(), "Should be active after activation");
        org.junit.jupiter.api.Assertions.assertEquals("APPROVED", user.getStatus());

        // 5. Login with verified credentials
        com.sapt.auth.dto.LoginRequest loginRequest = new com.sapt.auth.dto.LoginRequest();
        loginRequest.setEmail(testEmail);
        loginRequest.setPassword("secretPassword");
        loginRequest.setRole(com.sapt.common.enums.UserRole.COLLEGE_ADMIN);

        com.sapt.auth.dto.LoginResponse loginResponse = authService.login(loginRequest);

        // 6. Assert response fields
        org.junit.jupiter.api.Assertions.assertNotNull(loginResponse.getToken(), "Token should not be null");
        org.junit.jupiter.api.Assertions.assertEquals(testEmail, loginResponse.getEmail());
        org.junit.jupiter.api.Assertions.assertEquals(com.sapt.common.enums.UserRole.COLLEGE_ADMIN, loginResponse.getRole());
        org.junit.jupiter.api.Assertions.assertEquals("Verification Admin", loginResponse.getFullName());
        org.junit.jupiter.api.Assertions.assertEquals(user.getId(), loginResponse.getId());
        org.junit.jupiter.api.Assertions.assertEquals("Verification Test College", loginResponse.getCollege());

        System.out.println("========== COLLEGE ADMIN FLOW SUCCESS ==========");
    }
}
