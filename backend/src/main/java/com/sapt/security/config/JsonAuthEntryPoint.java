package com.sapt.security.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * ============================================================
 * JsonAuthEntryPoint - Custom 401 Unauthorized Response
 * ============================================================
 * Replaces Spring Security's default HTML 401 response with a
 * proper JSON ApiResponse so the frontend can parse the error.
 *
 * Triggered when:
 *  - No JWT token is provided
 *  - JWT token is expired or invalid
 *  - Any protected endpoint is accessed without authentication
 * ============================================================
 */
@Component
public class JsonAuthEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException, ServletException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");

        // Build a response matching ApiResponse<Void> structure
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", "Session expired. Please login again.");
        body.put("data", null);

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
