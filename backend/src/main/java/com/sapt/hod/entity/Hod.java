package com.sapt.hod.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * HOD mirror table — synced from users table via DataSyncService (JDBC).
 * This entity is used for Hibernate schema auto-creation (ddl-auto=update).
 * Actual data operations use JdbcTemplate directly.
 * Uses VARCHAR(36) (not CHAR) for ID to ensure TiDB/MySQL UTF-8 compatibility.
 */
@Entity
@Table(name = "hods")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hod {

    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "college_id", length = 36)
    private String collegeId;

    @Column(name = "department_id", length = 36)
    private String departmentId;

    @Column(name = "status", length = 20)
    private String status;
}
