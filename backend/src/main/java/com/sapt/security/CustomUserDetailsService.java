package com.sapt.security;

import com.sapt.auth.entity.User;
import com.sapt.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * CustomUserDetailsService - Spring Security UserDetailsService implementation.
 *
 * IMPORTANT: In SAPT the JWT subject is the user.id (UUID string).
 * So loadUserByUsername receives the UUID id as a string.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Load user by user.id (UUID string stored as subject in JWT).
     *
     * @param username The user.id UUID string (from JWT subject)
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findById(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + username));

        if (!user.isActive()) {
            throw new UsernameNotFoundException("User account is deactivated: " + username);
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getId())                  // subject = UUID id
                .password(user.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();
    }
}
