package com.sapt.submission.repository;

import com.sapt.submission.entity.ActivitySubType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivitySubTypeRepository extends JpaRepository<ActivitySubType, String> {
    List<ActivitySubType> findByCategoryIdAndIsActiveTrue(String categoryId);
    Optional<ActivitySubType> findByCategoryIdAndLabel(String categoryId, String label);
    Optional<ActivitySubType> findByCategoryIdAndLabelIgnoreCase(String categoryId, String label);
}
