package com.sapt.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * ============================================================
 * CustomUserDetailsService
 * ============================================================
 * Loads user-specific data for Spring Security authentication.
 * This is the bridge between your User entity (DB) and Spring Security.
 *
 * TODO (Auth Team):
 *  - Inject your User repository
 *  - Query the user by email (or username) from the database
 *  - Return a UserDetails object (can use Spring's User.builder())
 *  - Include roles/authorities for role-based access control
 *  - Throw UsernameNotFoundException if user not found
 * ============================================================
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    // TODO: Inject user repository
    // private final AuthUserRepository authUserRepository;

    /**
     * Load user by username (email in SAPT context).
     *
     * TODO: Implement this method:
     *  1. Query user by email from repository
     *  2. If not found, throw new UsernameNotFoundException("User not found: " + username)
     *  3. Return UserDetails with username, password, and roles
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // TODO: Implement user lookup from database
        //
        // AuthUser user = authUserRepository.findByEmail(username)
        //     .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        //
        // return org.springframework.security.core.userdetails.User.builder()
        //     .username(user.getEmail())
        //     .password(user.getPassword())
        //     .roles(user.getRole().name())
        //     .build();

        throw new UsernameNotFoundException("CustomUserDetailsService not yet implemented");
    }
}
