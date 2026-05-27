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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * ============================================================
 * SecurityConfig - Spring Security Configuration
 * ============================================================
 * Configures:
 *  - HTTP security (CSRF, session, endpoint access rules)
 *  - JWT filter registration
 *  - Password encoding (BCrypt)
 *  - Authentication provider setup
 *
 * TODO (Auth Team):
 *  - Define which endpoints are public (permitAll)
 *  - Define which endpoints require specific roles
 *  - Wire JwtAuthFilter before the default auth filter
 *  - Configure CORS properly for your frontend origin
 * ============================================================
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    /**
     * Main security filter chain configuration.
     *
     * TODO: Configure the following:
     *  - CSRF: disable (REST API is stateless)
     *  - CORS: configure allowed origins from application.properties
     *  - Session: STATELESS (JWT based)
     *  - Public endpoints: /api/auth/**, /api/public/**
     *  - Protected endpoints: define role-based access per module
     *  - Add jwtAuthFilter before UsernamePasswordAuthenticationFilter
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // TODO: Replace this placeholder with actual security rules
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // TODO: Define your public and protected routes below
                // .requestMatchers("/api/auth/**").permitAll()
                // .requestMatchers("/api/admin/**").hasRole("SYSTEM_ADMIN")
                // .requestMatchers("/api/student/**").hasRole("STUDENT")
                .anyRequest().permitAll() // PLACEHOLDER - change to .authenticated() after implementing auth
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Password encoder — BCrypt with default strength (10).
     * Used for hashing passwords before storing in DB.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Authentication provider — uses UserDetailsService + PasswordEncoder.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
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
