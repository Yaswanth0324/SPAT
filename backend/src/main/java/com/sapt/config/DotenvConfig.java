package com.sapt.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * ============================================================
 * DotenvConfig - Load .env File at Application Startup
 * ============================================================
 * Loads environment variables from .env into the JVM System
 * properties so Spring can read them via @Value and ${...}.
 *
 * This bean must be initialized before any other bean that
 * reads environment variables.
 *
 * NOTE: .env must be placed in the backend/ root directory.
 * ============================================================
 */
@Configuration
public class DotenvConfig {

    @Bean
    public Dotenv dotenv() {
        Dotenv dotenv = Dotenv.configure()
                .directory("./")          // looks for .env in backend/ root
                .ignoreIfMissing()        // don't crash if .env is absent (CI/CD uses real env vars)
                .load();

        // Push all .env variables into System properties so Spring picks them up
        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue())
        );

        return dotenv;
    }
}
