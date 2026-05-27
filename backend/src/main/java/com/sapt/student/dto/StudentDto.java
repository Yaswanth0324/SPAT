package com.sapt.student.dto;

import lombok.Data;

/**
 * StudentDto - Data Transfer Objects for Student module.
 * TODO (Student Team): Define request/response fields here.
 */
public class StudentDto {

    /** Used to update student profile */
    @Data
    public static class UpdateProfileRequest {
        private String fullName;
        private String department;
        private String semester;
        // TODO: Add more fields
    }

    /** Returned in API responses for student profile */
    @Data
    public static class StudentProfile {
        private Long id;
        private String fullName;
        private String email;
        private String rollNumber;
        private String department;
        private String batch;
        private String semester;
        private Integer totalPoints;
        // TODO: Add more response fields
    }
}
