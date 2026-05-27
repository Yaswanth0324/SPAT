package com.sapt.mentor.dto;

import lombok.Data;

/**
 * MentorDto - DTOs for Mentor module.
 * TODO (Mentor Team): Define request/response shapes.
 */
public class MentorDto {

    @Data
    public static class MentorProfile {
        private Long id;
        private String fullName;
        private String employeeId;
        private String department;
        // TODO: Add more fields
    }

    @Data
    public static class UpdateProfileRequest {
        private String fullName;
        private String department;
        // TODO: Add more fields
    }
}
