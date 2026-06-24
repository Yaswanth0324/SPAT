package com.sapt.auth.repository;

/**
 * @deprecated OTP tokens are no longer in a separate table.
 * OTP logic moved to {@link UserRepository} / User entity inline fields.
 * Use {@link UserRepository} to find users and read/write otp_code + otp_expires_at.
 */
@Deprecated(since = "2.0", forRemoval = true)
public interface OtpTokenRepository {
    // REMOVED — OTP fields moved to users table (com.sapt.auth.entity.User)
}
