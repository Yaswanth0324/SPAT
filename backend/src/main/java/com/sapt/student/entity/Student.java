package com.sapt.student.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Student mirror table — synced from users table via DataSyncService (JDBC).
 * This entity is only used for Hibernate schema auto-creation (ddl-auto=update).
 * Actual data operations use JdbcTemplate directly.
 */
@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @Column(name = "id", nullable = false, columnDefinition = "CHAR(36)")
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "college_id", columnDefinition = "CHAR(36)")
    private String collegeId;

    @Column(name = "department_id", columnDefinition = "CHAR(36)")
    private String departmentId;

    @Column(name = "roll_no", length = 50)
    private String rollNo;

    @Column(name = "mentor_id", columnDefinition = "CHAR(36)")
    private String mentorId;

    @Column(name = "status", length = 20)
    private String status;
}
