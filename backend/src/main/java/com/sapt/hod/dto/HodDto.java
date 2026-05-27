package com.sapt.hod.dto;

import lombok.Data;

/**
 * HodDto - DTOs for HOD module.
 * TODO (HOD Team): Define request/response shapes.
 */
public class HodDto {

    @Data
    public static class HodProfile {
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
