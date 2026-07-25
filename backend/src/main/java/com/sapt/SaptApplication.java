package com.sapt;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ============================================================
 * SAPT - Student Activity Point Tracker
 * Main Application Entry Point
 * ============================================================
 *
 * This is the root Spring Boot application class.
 * Do NOT modify this file unless you know what you are doing.
 *
 * Author: SAPT Dev Team
 * ============================================================
 */
@SpringBootApplication
public class SaptApplication {

    static {
        System.err.println("[DEBUG] STATIC BLOCK OF SaptApplication CALLED");
        System.err.println("[DEBUG] user.dir = " + System.getProperty("user.dir"));
        
        Dotenv dotenv = Dotenv.configure()
                .directory("./")          // looks for .env in backend/ root
                .ignoreIfMissing()        // don't crash if .env is absent
                .load();

        System.err.println("[DEBUG] Dotenv loaded. Number of entries: " + dotenv.entries().size());
        dotenv.entries().forEach(entry -> {
            System.err.println("[DEBUG] Env entry: " + entry.getKey() + " = " + entry.getValue());
            if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });

        // Ensure app_reviews table is recreated with clean schema (id, name, email, college, role, rating, feedback, created_at)
        try {
            String url = System.getProperty("MYSQL_URL");
            String user = System.getProperty("MYSQL_USERNAME");
            String pass = System.getProperty("MYSQL_PASSWORD");
            if (url != null && user != null && pass != null) {
                try (java.sql.Connection conn = java.sql.DriverManager.getConnection(url, user, pass);
                     java.sql.Statement stmt = conn.createStatement()) {
                    stmt.executeUpdate("DROP TABLE IF EXISTS spat_app_reviews");
                    try (java.sql.ResultSet rs = stmt.executeQuery(
                            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'app_reviews' AND COLUMN_NAME IN ('category', 'dept', 'text')")) {
                        if (rs.next()) {
                            System.err.println("[INFO] Pre-start cleanup: Dropping legacy app_reviews table to remove legacy columns...");
                            stmt.executeUpdate("DROP TABLE IF EXISTS app_reviews");
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[WARN] Database pre-start check notice: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        SpringApplication.run(SaptApplication.class, args);
    }

}
