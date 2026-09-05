package com.sapt.security;

import com.sapt.auth.entity.User;
import com.sapt.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * ============================================================
 * CustomUserDetailsService
 * ============================================================
 * Loads the unified User entity from MySQL and bridges it
 * with Spring Security for authentication.
 *
 * Password stored in: users.password_hash
 * Role authority format: "ROLE_<ROLE_NAME>"
 *   e.g., ROLE_STUDENT, ROLE_MENTOR, ROLE_HOD, etc.
 * ============================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Load user by email (used as the username in SAPT).
     * Called by Spring Security during authentication.
     *
     * NOTE: There is a naming conflict between:
     *   - com.sapt.auth.entity.User   (our DB entity)
     *   - org.springframework.security.core.userdetails.User (Spring Security builder)
     * We use the fully-qualified Spring Security class below.
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User saptUser = userRepository.findByEmail(username)
                .orElseThrow(() -> {
                    log.warn("User not found with email: {}", username);
                    return new UsernameNotFoundException("User not found: " + username);
                });

        if (!saptUser.isActive()) {
            log.warn("Attempt to load deactivated account: {}", username);
            throw new UsernameNotFoundException("Account is deactivated: " + username);
        }

        // Use fully-qualified Spring Security User builder to avoid naming conflict
        return org.springframework.security.core.userdetails.User.builder()
                .username(saptUser.getEmail())
                .password(saptUser.getPasswordHash())           // BCrypt hash from users.password_hash
                .authorities(Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + saptUser.getRole().name())
                ))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!saptUser.isActive())
                .build();
    }
}
