package com.sapt.security.filter;

import com.sapt.security.jwt.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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
 * TODO (Auth Team):
 *  - Implement doFilterInternal()
 *  - Extract Authorization header (Bearer token)
 *  - Validate JWT token using JwtUtil
 *  - Set authentication in SecurityContextHolder if valid
 *  - Pass request down the filter chain
 * ============================================================
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    /**
     * Core filter logic — intercepts every HTTP request.
     *
     * TODO: Implement the following steps:
     *  1. Extract the "Authorization" header
     *  2. Check if it starts with "Bearer "
     *  3. Extract the JWT token from the header
     *  4. Extract username from the token using jwtUtil
     *  5. Load UserDetails from userDetailsService
     *  6. Validate token using jwtUtil.validateToken()
     *  7. Create UsernamePasswordAuthenticationToken
     *  8. Set it in SecurityContextHolder
     *  9. Continue filter chain: filterChain.doFilter(request, response)
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // TODO: Implement JWT extraction and validation logic here
        //
        // String authHeader = request.getHeader("Authorization");
        // String token = null;
        // String username = null;
        //
        // if (authHeader != null && authHeader.startsWith("Bearer ")) {
        //     token = authHeader.substring(7);
        //     username = jwtUtil.extractUsername(token);
        // }
        //
        // if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        //     UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        //     if (jwtUtil.validateToken(token, userDetails)) {
        //         UsernamePasswordAuthenticationToken authToken =
        //             new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        //         authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        //         SecurityContextHolder.getContext().setAuthentication(authToken);
        //     }
        // }
        //
        // filterChain.doFilter(request, response);

        filterChain.doFilter(request, response); // PLACEHOLDER - replace with real logic above
    }
}
