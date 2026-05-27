package com.sapt.systemadmin.dto;

import lombok.Data;

/**
 * SystemAdminDto - DTOs for SystemAdmin module.
 * TODO (SystemAdmin Team): Define request/response shapes.
 */
public class SystemAdminDto {

    @Data
    public static class SystemAdminProfile {
        private Long id;
        private String fullName;
        private String employeeId;
        // TODO: Add more fields
    }

    @Data
    public static class CreateCollegeAdminRequest {
        private String fullName;
        private String email;
        private String password;
        private Long collegeId;
        // TODO: Add more fields
    }
}
