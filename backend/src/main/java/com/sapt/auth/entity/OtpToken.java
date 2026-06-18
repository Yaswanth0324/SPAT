package com.sapt.auth.entity;

/**
 * @deprecated OTP tokens are no longer stored in a separate table.
 *
 * OTP is now stored directly on the User entity:
 *   - users.otp_code       → the 6-digit OTP
 *   - users.otp_expires_at → expiry timestamp
 *
 * After successful OTP verification both fields are set to null.
 * A null otp_code signals "email verified".
 *
 * Use {@link User} and {@link com.sapt.auth.repository.UserRepository} instead.
 */
@Deprecated(since = "2.0", forRemoval = true)
public class OtpToken {
    // REMOVED — OTP fields moved to com.sapt.auth.entity.User
}
