package com.sapt.submission.repository;

import com.sapt.submission.entity.ActivityCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityCategoryRepository extends JpaRepository<ActivityCategory, String> {
    Optional<ActivityCategory> findByName(String name);
    Optional<ActivityCategory> findByNameIgnoreCase(String name);
    List<ActivityCategory> findByIsActiveTrue();
}
