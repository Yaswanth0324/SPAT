package com.sapt.security.config;

import com.sapt.security.filter.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
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
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * SecurityConfig - Spring Security Configuration.
 *
 * NOTE: PasswordEncoder bean is defined in PasswordEncoderConfig (auth module) — injected here.
 *
 * Rules:
 *  - Stateless JWT auth (no sessions, no CSRF)
 *  - Public: /api/auth/** (login, register, OTP)
 *  - All other /api/** routes require authentication
 *  - Role-based access is enforced via @PreAuthorize on individual controllers
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter           jwtAuthFilter;
    private final UserDetailsService      userDetailsService;
    private final PasswordEncoder         passwordEncoder;     // from PasswordEncoderConfig
    private final CorsConfigurationSource corsConfigurationSource;

    // ─────────────────────────────────────────────────────────────────────────
    // Main Security Filter Chain
    // ─────────────────────────────────────────────────────────────────────────

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF — REST API is stateless
            .csrf(csrf -> csrf.disable())

            // Wire CORS from CorsConfig bean
            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            // Stateless sessions — no HttpSession
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Endpoint access rules
            .authorizeHttpRequests(auth -> auth
                // Public: auth endpoints (login, register, OTP, verify)
                .requestMatchers("/auth/**").permitAll()
                // Everything else requires a valid JWT
                .anyRequest().authenticated()
            )

            // Custom JSON error responses (no empty body on 401/403)
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(jsonAuthEntryPoint())
                .accessDeniedHandler(jsonAccessDeniedHandler())
            )

            // Custom auth provider (UserDetailsService + BCrypt)
            .authenticationProvider(authenticationProvider())

            // JWT filter runs before Spring's default auth filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Returns a JSON 401 response instead of Spring Security's default empty 401.
     * Prevents "Unexpected end of JSON input" in the frontend.
     */
    @Bean
    public AuthenticationEntryPoint jsonAuthEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"success\":false,\"message\":\"Unauthorized — please log in again.\"," +
                "\"timestamp\":\"" + java.time.LocalDateTime.now() + "\"}"
            );
        };
    }

    /**
     * Returns a JSON 403 response instead of an empty body.
     */
    @Bean
    public AccessDeniedHandler jsonAccessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"success\":false,\"message\":\"Access denied — you don't have permission.\"," +
                "\"timestamp\":\"" + java.time.LocalDateTime.now() + "\"}"
            );
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Authentication Provider
    // ─────────────────────────────────────────────────────────────────────────

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);   // injected — no duplicate bean
        return provider;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Authentication Manager
    // ─────────────────────────────────────────────────────────────────────────

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
