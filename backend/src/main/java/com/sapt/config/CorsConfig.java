package com.sapt.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * ============================================================
 * CorsConfig - Cross-Origin Resource Sharing Configuration
 * ============================================================
 * Configures CORS so the frontend (React/Vite) can communicate
 * with this backend API across different origins.
 *
 * Allowed origins are read from application.properties,
 * which reads from .env → sapt.cors.allowed-origins
 *
 * TODO (Backend Team):
 *  - Wire this CorsConfigurationSource into SecurityConfig
 *  - Add production frontend URL to .env → ALLOWED_ORIGINS
 * ============================================================
 */
@Configuration
public class CorsConfig {

    @Value("${sapt.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Set allowed origins from environment variable
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        config.setAllowedOrigins(origins);

        // Allowed HTTP methods
        config.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        // Allowed headers
        config.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept"
        ));

        // Allow credentials (needed for JWT auth)
        config.setAllowCredentials(true);

        // Cache preflight response for 1 hour
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
