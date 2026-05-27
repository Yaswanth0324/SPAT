package com.sapt.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * ============================================================
 * JwtUtil - JWT Token Utility
 * ============================================================
 * Responsibilities:
 *  - Generate JWT tokens for authenticated users
 *  - Validate incoming JWT tokens
 *  - Extract claims (username, role, expiration) from tokens
 *
 * TODO (Auth Team):
 *  - Implement generateToken()
 *  - Implement validateToken()
 *  - Implement extractUsername()
 *  - Implement extractRole() for role-based access
 *  - Handle token refresh logic if needed
 * ============================================================
 */
@Component
public class JwtUtil {

    @Value("${sapt.jwt.secret}")
    private String secret;

    @Value("${sapt.jwt.expiration}")
    private long expiration;

    // --------------------------------------------------------
    // Generate token for a user
    // TODO: Implement this method
    // --------------------------------------------------------
    public String generateToken(UserDetails userDetails) {
        // TODO: Build claims map with username and role
        // TODO: Call createToken() with claims and subject
        throw new UnsupportedOperationException("generateToken() not yet implemented");
    }

    // --------------------------------------------------------
    // Validate token against user details
    // TODO: Implement this method
    // --------------------------------------------------------
    public boolean validateToken(String token, UserDetails userDetails) {
        // TODO: Extract username from token
        // TODO: Check if username matches and token is not expired
        throw new UnsupportedOperationException("validateToken() not yet implemented");
    }

    // --------------------------------------------------------
    // Extract username from token
    // TODO: Implement this method
    // --------------------------------------------------------
    public String extractUsername(String token) {
        // TODO: Extract subject claim from token
        throw new UnsupportedOperationException("extractUsername() not yet implemented");
    }

    // --------------------------------------------------------
    // Extract expiration date from token
    // TODO: Implement this method
    // --------------------------------------------------------
    public Date extractExpiration(String token) {
        // TODO: Extract expiration claim from token
        throw new UnsupportedOperationException("extractExpiration() not yet implemented");
    }

    // --------------------------------------------------------
    // Check if token is expired
    // TODO: Implement this method
    // --------------------------------------------------------
    private boolean isTokenExpired(String token) {
        // TODO: Compare expiration date with current date
        throw new UnsupportedOperationException("isTokenExpired() not yet implemented");
    }

    // --------------------------------------------------------
    // Internal: Create token with claims
    // TODO: Implement this method
    // --------------------------------------------------------
    private String createToken(Map<String, Object> claims, String subject) {
        // TODO: Use Jwts.builder() with claims, subject, issuedAt, expiration, signing key
        throw new UnsupportedOperationException("createToken() not yet implemented");
    }

    // --------------------------------------------------------
    // Internal: Get signing key
    // TODO: Implement this method
    // --------------------------------------------------------
    private Key getSigningKey() {
        // TODO: Decode secret and return Keys.hmacShaKeyFor(...)
        throw new UnsupportedOperationException("getSigningKey() not yet implemented");
    }

    // --------------------------------------------------------
    // Internal: Extract a specific claim
    // TODO: Implement this method
    // --------------------------------------------------------
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        // TODO: Extract all claims and apply resolver function
        throw new UnsupportedOperationException("extractClaim() not yet implemented");
    }
}
