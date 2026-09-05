package com.sapt.review.service;

import com.sapt.review.dto.ReviewDto;
import com.sapt.review.entity.Review;
import com.sapt.review.repository.ReviewRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;

    @PostConstruct
    public void initSeedData() {
        if (reviewRepository.count() == 0) {
            log.info("Seeding initial app reviews into database...");
            reviewRepository.saveAll(List.of(
                Review.builder()
                    .name("Priya Nair")
                    .email("priya.nair@mit.edu")
                    .college("Madras Institute of Technology")
                    .role("Student")
                    .rating(5)
                    .feedback("SAPT has completely transformed how I track my co-curricular accomplishments. The interface is gorgeous, and seeing my star level increase keeps me incredibly motivated!")
                    .createdAt(LocalDateTime.now())
                    .build(),
                Review.builder()
                    .name("Arjun Krishnan")
                    .email("arjun.k@vit.ac.in")
                    .college("VIT University")
                    .role("Student")
                    .rating(5)
                    .feedback("I love the dashboard! Submitting my certificates for hackathons and online courses is effortless, and my mentor reviews them within hours. A perfect platform!")
                    .createdAt(LocalDateTime.now())
                    .build(),
                Review.builder()
                    .name("Dr. Priya Sharma")
                    .email("priya.sharma@mit.edu")
                    .college("Madras Institute of Technology")
                    .role("HOD")
                    .rating(5)
                    .feedback("Managing student activity credits used to be an administrative nightmare of spreadsheets and lost certificates. SAPT has streamlined the entire verification process into a seamless departmental dashboard.")
                    .createdAt(LocalDateTime.now())
                    .build(),
                Review.builder()
                    .name("Prof. Arun Vijay")
                    .email("arun.v@mit.edu")
                    .college("Madras Institute of Technology")
                    .role("Mentor")
                    .rating(5)
                    .feedback("As a mentor, SAPT allows me to stay connected with my students' extracurricular progress. The approval workflow is highly intuitive, allowing me to review and validate submissions in just a single click.")
                    .createdAt(LocalDateTime.now())
                    .build()
            ));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDto.Response> getAllReviews() {
        return reviewRepository.findByOrderByIdAsc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReviewDto.Response createReview(ReviewDto.CreateRequest request) {
        String feedback = request.getFeedback() != null ? request.getFeedback().trim() : "";
        Review review = Review.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .college(request.getCollege().trim())
                .role(request.getRole().trim())
                .rating(request.getRating())
                .feedback(feedback)
                .createdAt(LocalDateTime.now())
                .build();

        Review saved = reviewRepository.saveAndFlush(review);
        log.info("New review #{} submitted by {} ({}) for {}: rating={}", saved.getId(), saved.getName(), saved.getRole(), saved.getCollege(), saved.getRating());
        return mapToResponse(saved);
    }

    private ReviewDto.Response mapToResponse(Review r) {
        return ReviewDto.Response.builder()
                .id(r.getId())
                .name(r.getName())
                .email(r.getEmail())
                .college(r.getCollege())
                .role(r.getRole())
                .rating(r.getRating())
                .feedback(r.getFeedback())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
