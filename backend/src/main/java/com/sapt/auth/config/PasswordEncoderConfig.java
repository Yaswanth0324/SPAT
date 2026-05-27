package com.sapt.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * ============================================================
 * PasswordEncoderConfig - BCrypt Password Encoder
 * ============================================================
 * Provides a BCryptPasswordEncoder bean for the auth module.
 *
 * BCrypt is the industry-standard for password hashing:
 *  - Automatically salts passwords
 *  - Work factor (strength) defaults to 10
 *  - NEVER store plain-text passwords
 *
 * This bean is also used in SecurityConfig.
 * Defined here (auth module) to keep auth concerns together.
 *
 * Usage:
 *   @Autowired PasswordEncoder passwordEncoder;
 *   String hashed = passwordEncoder.encode(rawPassword);
 *   boolean match = passwordEncoder.matches(raw, hashed);
 * ============================================================
 */
@Configuration
public class PasswordEncoderConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
