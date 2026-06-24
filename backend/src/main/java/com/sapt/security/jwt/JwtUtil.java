package com.sapt.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
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
 * ============================================================
 */
@Slf4j
@Component
public class JwtUtil {

    @Value("${sapt.jwt.secret}")
    private String secret;

    @Value("${sapt.jwt.expiration}")
    private long expiration;

    // --------------------------------------------------------
    // Generate token for a user
    // --------------------------------------------------------
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // Add any extra claims (e.g., roles) to the token payload
        String roles = userDetails.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .reduce("", (a, b) -> a.isEmpty() ? b : a + "," + b);
        claims.put("roles", roles);
        return createToken(claims, userDetails.getUsername());
    }

    // --------------------------------------------------------
    // Generate token with explicit extra claims
    // --------------------------------------------------------
    public String generateToken(String subject, Map<String, Object> extraClaims) {
        return createToken(extraClaims, subject);
    }

    // --------------------------------------------------------
    // Validate token against user details
    // --------------------------------------------------------
    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expired: {}", e.getMessage());
            return false;
        } catch (SignatureException | MalformedJwtException | UnsupportedJwtException e) {
            log.warn("JWT token invalid: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("JWT validation error: {}", e.getMessage());
            return false;
        }
    }

    // --------------------------------------------------------
    // Extract username (subject) from token
    // --------------------------------------------------------
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // --------------------------------------------------------
    // Extract expiration date from token
    // --------------------------------------------------------
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // --------------------------------------------------------
    // Extract a custom claim by key
    // --------------------------------------------------------
    public String extractClaim(String token, String claimKey) {
        Claims claims = extractAllClaims(token);
        Object value = claims.get(claimKey);
        return value != null ? value.toString() : null;
    }

    // --------------------------------------------------------
    // Get raw expiration millis (for LoginResponse)
    // --------------------------------------------------------
    public long getExpirationMs() {
        return expiration;
    }

    // --------------------------------------------------------
    // Check if token is expired
    // --------------------------------------------------------
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // --------------------------------------------------------
    // Internal: Create token with claims
    // --------------------------------------------------------
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // --------------------------------------------------------
    // Internal: Get signing key from secret
    // --------------------------------------------------------
    private Key getSigningKey() {
        byte[] keyBytes = secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        // Pad or trim to at least 32 bytes for HS256
        if (keyBytes.length < 32) {
            byte[] paddedKey = new byte[32];
            System.arraycopy(keyBytes, 0, paddedKey, 0, keyBytes.length);
            return Keys.hmacShaKeyFor(paddedKey);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // --------------------------------------------------------
    // Internal: Extract a specific claim using a resolver function
    // --------------------------------------------------------
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // --------------------------------------------------------
    // Internal: Parse and return all claims from token
    // --------------------------------------------------------
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
