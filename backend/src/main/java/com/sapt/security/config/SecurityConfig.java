package com.sapt.security.config;

import com.sapt.security.filter.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * ============================================================
 * SecurityConfig - Spring Security Configuration
 * ============================================================
 * Configures:
 *  - HTTP security (CSRF disabled, stateless sessions, CORS)
 *  - Endpoint access rules per role
 *  - JWT filter registration
 *  - Password encoding (BCrypt)
 *  - Authentication provider setup
 *
 * Public endpoints (no token required):
 *   POST /api/auth/login
 *   POST /api/auth/register
 *   POST /api/auth/otp/send
 *   POST /api/auth/otp/verify
 *   POST /api/auth/password/reset
 *
 * All other endpoints require a valid JWT Bearer token.
 * Role-based access is enforced via @PreAuthorize in controllers.
 * ============================================================
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    /** Injected from CorsConfig — avoids duplicate bean definition */
    private final CorsConfigurationSource corsConfigurationSource;

    /**
     * Main security filter chain configuration.
     * - CSRF disabled (REST API is stateless)
     * - Sessions are STATELESS (JWT-based)
     * - Auth endpoints are public; all others require authentication
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // ---- Public Auth Endpoints ----
                // NOTE: context-path is /api, so Spring Security sees paths WITHOUT /api prefix
                .requestMatchers(
                    "/auth/login",
                    "/auth/register",
                    "/auth/otp/send",
                    "/auth/otp/verify",
                    "/auth/password/reset",
                    "/auth/logout",
                    "/auth/colleges",
                    "/auth/colleges/**",
                    "/auth/mentors"
                ).permitAll()

                // ---- All other requests require authentication ----
                // Role-specific access is enforced via @PreAuthorize in controllers
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Authentication provider — uses CustomUserDetailsService + BCryptPasswordEncoder.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    /**
     * AuthenticationManager — needed for manual authentication in AuthService.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
