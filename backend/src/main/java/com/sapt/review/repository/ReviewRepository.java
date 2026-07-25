package com.sapt.review.repository;

import com.sapt.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByOrderByIdAsc();
    List<Review> findByOrderByIdDesc();
}
