package com.sapt.student.repository;

import com.sapt.student.entity.StarThreshold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StarThresholdRepository extends JpaRepository<StarThreshold, Integer> {
    Optional<StarThreshold> findByStars(Integer stars);
}
