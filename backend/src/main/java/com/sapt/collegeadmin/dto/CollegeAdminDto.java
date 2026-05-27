package com.sapt.collegeadmin.dto;

import lombok.Data;

/**
 * CollegeAdminDto - DTOs for CollegeAdmin module.
 * TODO (CollegeAdmin Team): Define request/response shapes.
 */
public class CollegeAdminDto {

    @Data
    public static class CollegeAdminProfile {
        private Long id;
        private String fullName;
        private String employeeId;
        private Long collegeId;
        // TODO: Add more fields
    }

    @Data
    public static class UpdateProfileRequest {
        private String fullName;
        // TODO: Add more fields
    }
}
