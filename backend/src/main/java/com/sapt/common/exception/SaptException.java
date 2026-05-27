package com.sapt.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * ============================================================
 * SaptException - Base Custom Exception
 * ============================================================
 * Use this exception class for all business-logic errors.
 * The GlobalExceptionHandler will catch this and return
 * a proper ApiResponse with the correct HTTP status.
 *
 * Usage:
 *   throw new SaptException("User not found", HttpStatus.NOT_FOUND);
 *   throw new SaptException("Email already exists", HttpStatus.CONFLICT);
 *   throw new SaptException("Invalid OTP", HttpStatus.BAD_REQUEST);
 * ============================================================
 */
@Getter
public class SaptException extends RuntimeException {

    private final HttpStatus status;

    public SaptException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    // Convenience constructors for common HTTP statuses
    public static SaptException notFound(String message) {
        return new SaptException(message, HttpStatus.NOT_FOUND);
    }

    public static SaptException badRequest(String message) {
        return new SaptException(message, HttpStatus.BAD_REQUEST);
    }

    public static SaptException conflict(String message) {
        return new SaptException(message, HttpStatus.CONFLICT);
    }

    public static SaptException unauthorized(String message) {
        return new SaptException(message, HttpStatus.UNAUTHORIZED);
    }

    public static SaptException forbidden(String message) {
        return new SaptException(message, HttpStatus.FORBIDDEN);
    }
}
