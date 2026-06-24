package com.sapt.security.filter;

import com.sapt.security.jwt.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * ============================================================
 * JwtAuthFilter - JWT Authentication Filter
 * ============================================================
 * Intercepts every HTTP request and validates the JWT token
 * from the Authorization header before it reaches controllers.
 *
 * Filter Order: Runs BEFORE UsernamePasswordAuthenticationFilter
 *
 * Flow:
 *  1. Extract "Authorization: Bearer <token>" header
 *  2. Parse JWT and extract username (email)
 *  3. Load UserDetails from DB via CustomUserDetailsService
 *  4. Validate token signature and expiry
 *  5. Set authentication in SecurityContextHolder
 *  6. Continue filter chain
 * ============================================================
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // Skip if no Authorization header or not a Bearer token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7); // remove "Bearer " prefix
        String username = null;

        try {
            username = jwtUtil.extractUsername(token);
        } catch (Exception e) {
            log.warn("Could not extract username from JWT: {}", e.getMessage());
        }

        // Authenticate only if username is extracted and not already authenticated
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtUtil.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("JWT authentication successful for user: {}", username);
                } else {
                    log.warn("JWT token validation failed for user: {}", username);
                }
            } catch (Exception e) {
                log.warn("JWT filter error for user {}: {}", username, e.getMessage());
                // Clear any partial auth state
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
