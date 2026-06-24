package com.sapt.systemadmin.repository;

import com.sapt.systemadmin.entity.SystemAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/** SystemAdminRepository - TODO (SystemAdmin Team): Add custom query methods. */
@Repository
public interface SystemAdminRepository extends JpaRepository<SystemAdmin, Long> {
    Optional<SystemAdmin> findByUserId(String userId);
}
