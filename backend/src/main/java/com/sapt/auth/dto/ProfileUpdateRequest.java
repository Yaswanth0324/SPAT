package com.sapt.auth.dto;

import lombok.Data;

/**
 * ProfileUpdateRequest — Request DTO for updating user profile details.
 * Contains optional fields for name, email, phone, avatar/profileImage,
 * password, and assigned mentor details.
 */
@Data
public class ProfileUpdateRequest {
    private String name;
    private String email;
    private String phone;
    private String avatar;
    private String profileImage;
    private String password;
    private String currentPassword;
    private String mentorId;
    private String mentorName;
}
