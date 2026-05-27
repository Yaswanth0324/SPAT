package com.sapt.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ============================================================
 * ApiResponse<T> - Standard API Response Wrapper
 * ============================================================
 * All REST endpoints MUST return this wrapper for consistency.
 *
 * Usage examples:
 *
 *   // Success with data
 *   return ResponseEntity.ok(ApiResponse.success("User fetched", user));
 *
 *   // Success without data
 *   return ResponseEntity.ok(ApiResponse.success("Operation successful"));
 *
 *   // Error
 *   return ResponseEntity.badRequest().body(ApiResponse.error("Invalid input"));
 *
 * ============================================================
 * @param <T> The type of the data payload
 * ============================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    /** HTTP-level status (true = success, false = error) */
    private boolean success;

    /** Human-readable message for the frontend */
    private String message;

    /** The actual data payload (nullable on error) */
    private T data;

    /** Timestamp of the response */
    private LocalDateTime timestamp;

    // --------------------------------------------------------
    // Static factory methods
    // --------------------------------------------------------

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message, T data) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
